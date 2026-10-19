// The fight screen. Builds the stage, the opponent's read-out (descriptions,
// never numbers), the intent card, the running log, Akira's bars and the
// action panel, then plays each round's events back one line at a time.
//
// runEncounter() resolves with "win" | "loss" | "draw" | "fled" once the
// player presses Continue after the fight.

(() => {
"use strict";

const { DATA } = LOU.data;
const { getState, setVital } = LOU.state;
const { updateSidebar } = LOU.sidebar;
const { createEncounter, resolveRound, playerOptions, enemyCondition, describe } = LOU.combat;
const { openingLine, intentLine, intentTagLabel, narrateRound } = LOU.narration;
const { SpriteActor } = LOU.sprites;
const { paceMs, animationsOn } = LOU.settings;
const { el, icon, sleep, inline } = LOU.ui;
const GROUPS = [
    ["attack", "Attack", "sword"],
    ["defend", "Defend", "shield"],
    ["recover", "Recover", "wind"],
    ["escape", "Escape", "run"],
];

function groupOf(kind) {
    if (kind === "attack") return "attack";
    if (kind === "guard" || kind === "evade") return "defend";
    if (kind === "recover" || kind === "charge") return "recover";
    return "escape";
}

function speedWord(ticks) {
    if (ticks === 0) return "Instant";
    if (ticks <= 4) return "Fast";
    if (ticks <= 7) return "Average";
    return "Slow";
}

function clipFor(fighter, move, actor) {
    const own = move.id.includes("_") ? move.id.split("_").slice(1).join("_") : move.id;
    if (actor.has(own)) return own;
    return { attack: "strike", guard: "guard", evade: "evade", recover: "breath", charge: "charge" }[move.kind] ?? "idle";
}

let activeKeyHandler = null;

// Called by the engine's global key handler while a fight is on screen.
function combatKey(key) {
    return activeKeyHandler ? activeKeyHandler(key) : false;
}

function runEncounter(container, { enemyId, canFlee = false, modifiers = {} }) {
    return new Promise((resolve) => {
        const s = getState();
        const enc = createEncounter({
            enemyId,
            playerDef: { ...DATA.player, stats: s.stats },
            playerVitals: { ...s.vitals },
            canFlee,
            modifiers,
        });
        const enemyDef = DATA.enemies[enemyId];
        const blurbs = DATA.player?.moveText ?? {};

        // ---- layout ------------------------------------------------------------
        const stage = el("div", { class: "stage", dataset: { ground: DATA.locations?.[s.location]?.ground ?? "dirt" } },
            el("div", { class: "stage-sky" }),
            el("div", { class: "stage-ground" }),
            el("div", { class: "stage-anchor stage-left" }),
            el("div", { class: "stage-anchor stage-right" }),
            el("div", { class: "stage-round", text: "" })
        );
        const pActor = new SpriteActor("akira", { scale: 1 });
        const eActor = new SpriteActor(enc.enemy.sprite, { mirror: true, scale: 1 });
        if (pActor.has("ready")) pActor.setIdle("ready");
        stage.querySelector(".stage-left").append(pActor.el);
        stage.querySelector(".stage-right").append(eActor.el);

        const foeName = el("div", { class: "foe-name", text: enemyDef.name });
        const foeHealth = el("div", { class: "foe-line foe-health" });
        const foeStamina = el("div", { class: "foe-line foe-stamina" });
        const foe = el("div", { class: "foe-card" }, foeName, foeHealth, foeStamina);

        const intentTag = el("span", { class: "intent-tag" });
        const intentText = el("p", { class: "intent-text" });
        const intent = el("div", { class: "intent", "aria-live": "polite" },
            el("div", { class: "intent-head" }, el("span", { class: "intent-label", text: { he: "What he's doing", she: "What she's doing", it: "What it's doing" }[enc.enemy.pronouns] ?? "What they're doing" }), intentTag),
            intentText
        );

        const log = el("div", { class: "combat-log", "aria-live": "polite" });

        const youBars = el("div", { class: "you-bars" });
        const you = el("div", { class: "you-card" }, el("div", { class: "you-name", text: "Akira" }), youBars);

        const detail = el("div", { class: "action-detail" });
        const actions = el("div", { class: "actions" });
        const footer = el("div", { class: "combat-footer" });

        const root = el("section", { class: "combat", "aria-label": `Fight: ${enemyDef.name}` },
            el("div", { class: "combat-top" }, stage, el("div", { class: "combat-side" }, foe, you)),
            intent,
            el("div", { class: "combat-bottom" },
                el("div", { class: "log-col" }, log, footer),
                el("div", { class: "action-panel" }, actions, detail))
        );
        container.replaceChildren(root);

        // ---- rendering helpers ---------------------------------------------------
        function bar(label, cur, max, cls) {
            const pct = max ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
            return el("div", { class: `cbar ${cls}` },
                el("div", { class: "cbar-head" }, el("span", { text: label }), el("span", { class: "cbar-num", text: `${Math.round(cur)} / ${max}` })),
                el("div", { class: "cbar-track" }, el("div", { class: "cbar-fill", style: { width: `${pct}%` } }))
            );
        }

        function renderFighters() {
            const c = enemyCondition(enc);
            const hr = enc.enemy.hp / enc.enemy.maxHp;
            foeHealth.className = `foe-line foe-health ${hr > 0.55 ? "tone-calm" : hr > 0.3 ? "tone-warn" : "tone-bad"}`;
            foeHealth.replaceChildren(el("span", { class: "foe-key", text: "Condition" }), el("span", { text: c.health }));
            foeStamina.replaceChildren(el("span", { class: "foe-key", text: "Breathing" }), el("span", { text: c.stamina }));

            const p = enc.player;
            const usesAether = p.moves.some((m) => (m.aetherCost ?? 0) > 0);
            const usesFocus = p.moves.some((m) => (m.focusCost ?? 0) > 0 || m.kind === "charge");
            youBars.replaceChildren(...[
                bar("Health", p.hp, p.maxHp, "is-health"),
                bar("Stamina", p.stamina, p.maxStamina, "is-stamina"),
                usesAether ? bar("Aether", p.aether, p.maxAether, "is-aether") : null,
                usesFocus ? bar("Focus", p.focus, p.maxFocus, "is-focus") : null,
            ].filter(Boolean));
            // Keep the sidebar in step with the fight.
            setVital("health", p.hp);
            setVital("stamina", p.stamina);
            setVital("aether", p.aether);
            updateSidebar();

            const comp = describe(DATA.player?.vitalText?.composure, s.vitals.composure / 100);
            you.querySelector(".you-mood")?.remove();
            you.append(el("div", { class: `you-mood tone-${comp.tone}`, text: comp.text }));
        }

        function renderIntent() {
            if (enc.over) { intent.hidden = true; return; }
            intent.hidden = false;
            intentTag.dataset.tag = enc.plan.tag;
            intentTag.textContent = intentTagLabel(enc.plan.tag);
            intentText.textContent = intentLine(enc);
            stage.querySelector(".stage-round").textContent = `Round ${enc.round}`;
        }

        function logLine(text, tone = "", { round = false } = {}) {
            const node = el("p", { class: `log-line ${tone ? `tone-${tone}` : ""}${round ? " log-round" : ""}`, html: inline(text) });
            log.append(node);
            log.scrollTop = log.scrollHeight;
            requestAnimationFrame(() => node.classList.add("is-in"));
            return node;
        }

        function showDetail(opt) {
            if (!opt) { detail.replaceChildren(el("p", { class: "detail-hint", text: "Pick a response. Hover or focus an action to see what it does." })); return; }
            const m = opt.move;
            const text = blurbs[m.id] ?? "";
            const facts = [];
            facts.push(["Speed", m.kind === "guard" || m.kind === "evade" ? `Up at once, lasts ${m.duration} ticks` : `${speedWord(opt.startup)} (${opt.startup} ticks)`]);
            if (opt.preview != null) facts.push(["Damage", `About ${opt.preview} on a clean hit`]);
            if (m.kind === "guard") facts.push(["Blocks", `${m.physicalBlock}% physical, ${m.aetherBlock}% aetherical`]);
            if (m.kind === "evade") facts.push(["Avoids", m.evade >= 100 ? "One attack entirely (area attacks still graze)" : `${m.evade}% of one attack`]);
            if (m.restoreStamina) facts.push(["Restores", `${m.restoreStamina} stamina`]);
            if (m.kind === "flee") facts.push(["Risk", "Anything that lands before you're gone still hits"]);
            const cost = [];
            if (m.staminaCost) cost.push(`${m.staminaCost} stamina`);
            if (m.aetherCost) cost.push(`${m.aetherCost} aether`);
            if (opt.focusCost) cost.push(`${opt.focusCost} focus`);
            facts.push(["Cost", cost.join(", ") || "Free"]);
            if (opt.usesLeft != null) facts.push(["Uses left", String(opt.usesLeft)]);
            // replaceChildren() prints null as the word "null", so drop empty slots first.
            detail.replaceChildren(...[
                el("div", { class: "detail-name", text: m.name }),
                text ? el("p", { class: "detail-text", text }) : null,
                el("dl", { class: "detail-facts" }, facts.map(([k, v]) => [el("dt", { text: k }), el("dd", { text: v })])),
                opt.blocked ? el("p", { class: "detail-blocked", text: opt.blocked }) : null,
            ].filter(Boolean));
        }

        let busy = false;
        let currentOptions = [];

        function renderActions() {
            currentOptions = playerOptions(enc);
            const byGroup = new Map(GROUPS.map(([g]) => [g, []]));
            currentOptions.forEach((opt) => byGroup.get(groupOf(opt.move.kind)).push(opt));
            let n = 0;
            const ordered = [];
            const nodes = [];
            for (const [g, label, ic] of GROUPS) {
                const opts = byGroup.get(g);
                if (!opts.length) continue;
                nodes.push(el("div", { class: `action-group group-${g}` },
                    el("div", { class: "action-group-label" }, icon(ic), label),
                    opts.map((opt) => {
                        n += 1;
                        ordered.push(opt);
                        const key = n;
                        const chips = [];
                        if (opt.move.staminaCost) chips.push(el("span", { class: "chip chip-stamina", text: `${opt.move.staminaCost} sta` }));
                        if (opt.move.aetherCost) chips.push(el("span", { class: "chip chip-aether", text: `${opt.move.aetherCost} ae` }));
                        if (opt.focusCost) chips.push(el("span", { class: "chip chip-focus", text: `${opt.focusCost} focus` }));
                        if (opt.usesLeft != null) chips.push(el("span", { class: "chip", text: `${opt.usesLeft} left` }));
                        chips.push(el("span", { class: "chip chip-speed", text: opt.move.kind === "guard" || opt.move.kind === "evade" ? "Instant" : speedWord(opt.startup) }));
                        const btn = el("button", {
                            class: "action-btn",
                            type: "button",
                            disabled: Boolean(opt.blocked) || busy || null,
                            title: opt.blocked ?? null,
                            onclick: () => choose(opt),
                            onmouseenter: () => showDetail(opt),
                            onfocus: () => showDetail(opt),
                        },
                        el("span", { class: "action-key", text: key <= 9 ? String(key) : "" }),
                        el("span", { class: "action-name", text: opt.move.name }),
                        el("span", { class: "action-chips" }, chips),
                        opt.blocked ? el("span", { class: "action-blocked", text: opt.blocked }) : null);
                        return btn;
                    })
                ));
            }
            actions.replaceChildren(...nodes);
            actions.classList.toggle("is-busy", busy);
            ordered.forEach((o, i) => { o.key = i + 1; });
            currentOptions = ordered;
            showDetail(null);
        }

        async function choose(opt) {
            if (busy || enc.over || opt.blocked) return;
            busy = true;
            renderActions();

            const events = resolveRound(enc, opt.move.id);
            const lines = narrateRound(enc, events);
            logLine(`Round ${enc.history.length}`, "", { round: true });

            // Defensive and looping stances for the whole round.
            const pCommit = events.find((e) => e.type === "commit" && e.side === "player");
            const eCommit = events.find((e) => e.type === "commit" && e.side === "enemy");
            const stance = (actor, commit) => {
                if (!commit) return;
                if (commit.kind === "guard") actor.play("guard");
                else if (commit.kind === "recover") actor.play("breath");
                else if (commit.kind === "charge") actor.play("charge");
            };
            stance(pActor, pCommit);
            stance(eActor, eCommit);

            const pace = paceMs();
            for (const line of lines) {
                const ev = line.event;
                if (ev?.type === "attack") {
                    const attacker = ev.side === "player" ? pActor : eActor;
                    const defender = ev.side === "player" ? eActor : pActor;
                    const fighter = ev.side === "player" ? enc.player : enc.enemy;
                    const move = fighter.moves.find((m) => m.id === ev.moveId);
                    const swing = attacker.play(clipFor(fighter, move, attacker));
                    if (animationsOn()) await sleep(Math.min(260, pace));
                    if (ev.result === "evaded" || ev.result === "grazed") defender.play("evade");
                    else if (ev.damage > 0 && !ev.ko) defender.play(ev.severity === "heavy" || ev.severity === "brutal" ? "stagger" : "hit");
                    if (ev.damage > 0) {
                        stage.classList.remove("is-shaking", "is-flash-bad", "is-flash-good");
                        void stage.offsetWidth;
                        if (ev.severity === "heavy" || ev.severity === "brutal") stage.classList.add("is-shaking");
                        stage.classList.add(ev.targetSide === "player" ? "is-flash-bad" : "is-flash-good");
                    }
                    logLine(line.text, line.tone);
                    renderFighters();
                    if (animationsOn()) await Promise.race([swing, sleep(700)]);
                } else if (ev?.type === "flee") {
                    logLine(line.text, line.tone);
                    if (animationsOn()) {
                        pActor.el.parentElement.classList.add("is-leaving");
                    }
                } else if (ev?.type === "end") {
                    logLine(line.text, line.tone);
                } else {
                    logLine(line.text, line.tone);
                    renderFighters();
                }
                await sleep(pace);
            }

            renderFighters();
            if (enc.over) {
                await endFight();
                return;
            }
            // Back to neutral stances; next tell.
            if (pCommit?.kind !== "attack") pActor.play(pActor.idleClip);
            if (eCommit?.kind !== "attack") eActor.play(eActor.idleClip);
            renderIntent();
            logLine(intentText.textContent, "intent");
            busy = false;
            renderActions();
        }

        async function endFight() {
            const outcome = enc.outcome;
            intent.hidden = true;
            if (outcome === "win") { eActor.play("defeat", { hold: true }); pActor.play("victory", { hold: true }); }
            if (outcome === "loss") { pActor.play("defeat", { hold: true }); eActor.play("victory", { hold: true }); }
            if (outcome === "draw") { pActor.play("defeat", { hold: true }); eActor.play("defeat", { hold: true }); }
            actions.replaceChildren();
            detail.replaceChildren();
            root.classList.add("is-over");
            activeKeyHandler = null;

            // Write Akira's condition back to the story state.
            const st = getState();
            st.vitals.health = Math.max(0, Math.round(enc.player.hp));
            st.vitals.stamina = Math.max(0, Math.round(enc.player.stamina));
            st.vitals.aether = Math.max(0, Math.round(enc.player.aether));

            const label = { win: "Continue", loss: "Continue", draw: "Continue", fled: "Keep running" }[outcome];
            const btn = el("button", { class: "choice combat-continue", type: "button", autofocus: true, onclick: () => { activeKeyHandler = null; resolve(outcome); } },
                el("span", { class: "choice-key", text: "1" }), el("span", { class: "choice-text", text: label }));
            footer.replaceChildren(btn);
            activeKeyHandler = (key) => { if (key === "1" || key === "Enter") { btn.click(); return true; } return false; };
            btn.focus();
        }

        // ---- start --------------------------------------------------------------
        activeKeyHandler = (key) => {
            const n = Number(key);
            if (!Number.isInteger(n) || n < 1 || n > 9) return false;
            const opt = currentOptions.find((o) => o.key === n);
            if (opt) choose(opt);
            return true;
        };
        renderFighters();
        logLine(openingLine(enc), "muted");
        renderIntent();
        logLine(intentText.textContent, "intent");
        renderActions();
    });
}

LOU.combatUi = { runEncounter, combatKey };
})();
