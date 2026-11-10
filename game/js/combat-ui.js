// The fight screen, top to bottom: the stage, then Akira's panel and the
// opponent's panel side by side (descriptions for the opponent, never
// numbers), then the running log, then Akira's moves in one row. Plays each
// round's events back one line at a time.
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
const { paceMs, animationsOn, getSettings, setSetting } = LOU.settings;
const { el, icon, sleep, inline, openModal, closeModal } = LOU.ui;
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

// The "How to fight" window. Its words live in data/combat-text.js under
// "tutorial", so they can be edited without touching code.
function showTutorial() {
    const t = DATA.combatText?.tutorial;
    if (!t?.steps?.length) return;
    const body = el("div", { class: "tutorial" },
        el("ol", { class: "tutorial-steps" },
            t.steps.map(([head, text]) => el("li", {},
                el("div", { class: "tutorial-head", text: head }),
                el("p", { class: "tutorial-text", html: inline(text) })))),
        el("div", { class: "btn-row" },
            el("button", { class: "btn btn-primary", type: "button", autofocus: true, onclick: () => closeModal() }, t.button ?? "Got it")));
    openModal({ title: t.title ?? "How to fight", body, className: "modal-tutorial" });
    // Remember it was seen, so it only pops up by itself once.
    setSetting("combatTutorialSeen", true);
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
            el("div", { class: "stage-round", text: "" }),
            el("button", { class: "stage-help", type: "button", title: "How to fight", "aria-label": "How to fight", onclick: showTutorial }, "?")
        );
        // Each fighter's size on the stage comes from its data ("stageScale"
        // in data/player.js and data/enemies.js), so a big beast can tower
        // over Akira. Phones draw everyone at two thirds of that.
        const screenFactor = window.matchMedia("(max-width: 480px)").matches ? 2 / 3 : 1;
        const pActor = new SpriteActor("akira", { scale: (DATA.player?.stageScale ?? 1.5) * screenFactor });
        const eActor = new SpriteActor(enc.enemy.sprite, { mirror: true, scale: (enemyDef.stageScale ?? 1.5) * screenFactor });
        if (pActor.has("ready")) pActor.setIdle("ready");
        stage.querySelector(".stage-left").append(pActor.el);
        stage.querySelector(".stage-right").append(eActor.el);

        const foeName = el("div", { class: "foe-name", text: enemyDef.name });
        const foeHealth = el("div", { class: "foe-line foe-health" });
        const foeStamina = el("div", { class: "foe-line foe-stamina" });
        const foeTempo = el("div", { class: "tempo-line" });

        const intentTag = el("span", { class: "intent-tag" });
        const intentText = el("p", { class: "intent-text" });
        const intent = el("div", { class: "intent", "aria-live": "polite" },
            el("div", { class: "intent-head" }, el("span", { class: "intent-label", text: { he: "What he's doing", she: "What she's doing", it: "What it's doing" }[enc.enemy.pronouns] ?? "What they're doing" }), intentTag),
            intentText
        );

        const log = el("div", { class: "combat-log", "aria-live": "polite" });

        // The opponent's panel holds its read-out and what it's about to do.
        // Name and "Ready" share the top line; condition and breathing share the next.
        const foe = el("div", { class: "foe-card" },
            el("div", { class: "card-head" }, foeName, foeTempo),
            el("div", { class: "foe-lines" }, foeHealth, foeStamina),
            intent);

        const youBars = el("div", { class: "you-bars" });
        const youTempo = el("div", { class: "tempo-line" });
        const you = el("div", { class: "you-card" },
            el("div", { class: "card-head" }, el("div", { class: "you-name", text: "Akira" }), youTempo),
            youBars);

        const detail = el("div", { class: "action-detail" });
        const actions = el("div", { class: "actions" });
        const footer = el("div", { class: "combat-footer" });

        // Rows, top to bottom: stage / Akira + opponent / log / moves.
        const root = el("section", { class: "combat", "aria-label": `Fight: ${enemyDef.name}` },
            stage,
            el("div", { class: "combat-status" }, you, foe),
            el("div", { class: "log-col" }, log, footer),
            el("div", { class: "action-panel" }, actions, detail)
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

        // "Ready" or "Recovering: 5 ticks behind", from the lag the rules
        // carried over from last round.
        function tempoText(f) {
            if (enc.over) return "";
            return f.lag > 0 ? `Recovering: ${f.lag} ticks behind` : "Ready";
        }

        function renderFighters() {
            const c = enemyCondition(enc);
            const hr = enc.enemy.hp / enc.enemy.maxHp;
            foeHealth.className = `foe-line foe-health ${hr > 0.55 ? "tone-calm" : hr > 0.3 ? "tone-warn" : "tone-bad"}`;
            foeHealth.replaceChildren(el("span", { class: "foe-key", text: "Condition" }), el("span", { text: c.health }));
            foeStamina.replaceChildren(el("span", { class: "foe-key", text: "Breathing" }), el("span", { text: c.stamina }));
            foeTempo.textContent = tempoText(enc.enemy);
            foeTempo.classList.toggle("is-behind", enc.enemy.lag > 0);
            youTempo.textContent = tempoText(enc.player);
            youTempo.classList.toggle("is-behind", enc.player.lag > 0);

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
            youBars.after(el("div", { class: `you-mood tone-${comp.tone}`, text: comp.text }));
        }

        function renderIntent() {
            if (enc.over) { intent.hidden = true; return; }
            intent.hidden = false;
            intentTag.dataset.tag = enc.plan.tag;
            intentTag.textContent = intentTagLabel(enc.plan.tag);
            intentText.textContent = intentLine(enc);
            stage.querySelector(".stage-round").textContent = `Round ${enc.round}`;
        }

        function logLine(text, tone = "", { round = false, tick = null } = {}) {
            const node = el("p", { class: `log-line ${tone ? `tone-${tone}` : ""}${round ? " log-round" : ""}`, html: inline(text) });
            // A small "tick 4" stamp shows when in the exchange this happened.
            if (tick != null) node.prepend(el("span", { class: "log-tick", text: `tick ${tick}` }));
            log.append(node);
            log.scrollTop = log.scrollHeight;
            requestAnimationFrame(() => node.classList.add("is-in"));
            return node;
        }

        function showDetail(opt) {
            // No move hovered: hide the panel completely instead of showing a hint.
            if (!opt) { detail.hidden = true; detail.replaceChildren(); return; }
            detail.hidden = false;
            const m = opt.move;
            const text = blurbs[m.id] ?? "";
            const facts = [];
            const defence = m.kind === "guard" || m.kind === "evade";
            facts.push(["Speed", defence ? `Up at once, lasts ${m.duration} ticks` : `${speedWord(opt.startup)} (${opt.startup} ticks)`]);
            facts.push(["Lands", defence ? `Up on tick ${opt.lands} this round` : `On tick ${opt.lands} this round`]);
            facts.push(["Frame cost", `${opt.frames} ticks (${opt.startup} startup + ${opt.recovery} recovery)`]);
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
            // One row of buttons, still ordered attack → defend → recover →
            // escape; each button keeps its group's colour and icon.
            let n = 0;
            const ordered = [];
            const nodes = [];
            for (const [g, label, ic] of GROUPS) {
                const opts = byGroup.get(g);
                if (!opts.length) continue;
                nodes.push(...opts.map((opt) => {
                        n += 1;
                        ordered.push(opt);
                        const key = n;
                        const chips = [];
                        if (opt.move.staminaCost) chips.push(el("span", { class: "chip chip-stamina", text: `${opt.move.staminaCost} sta` }));
                        if (opt.move.aetherCost) chips.push(el("span", { class: "chip chip-aether", text: `${opt.move.aetherCost} ae` }));
                        if (opt.focusCost) chips.push(el("span", { class: "chip chip-focus", text: `${opt.focusCost} focus` }));
                        if (opt.usesLeft != null) chips.push(el("span", { class: "chip", text: `${opt.usesLeft} left` }));
                        chips.push(el("span", { class: "chip chip-ticks", title: "Frame cost: startup + recovery", text: `${opt.frames} ticks` }));
                        const btn = el("button", {
                            class: `action-btn group-${g}`,
                            type: "button",
                            disabled: Boolean(opt.blocked) || busy || null,
                            title: opt.blocked ?? null,
                            onclick: () => choose(opt),
                            onmouseenter: () => showDetail(opt),
                            onmouseleave: () => showDetail(null),
                            onfocus: () => showDetail(opt),
                            onblur: () => showDetail(null),
                        },
                        el("span", { class: "action-top" },
                            el("span", { class: "action-key", text: key <= 9 ? String(key) : "" }),
                            el("span", { class: "action-group-label", title: label }, icon(ic))),
                        el("span", { class: "action-name", text: opt.move.name }),
                        el("span", { class: "action-chips" }, chips),
                        opt.blocked ? el("span", { class: "action-blocked", text: opt.blocked }) : null);
                        return btn;
                    }));
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
                    logLine(line.text, line.tone, { tick: ev.at });
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
                    logLine(line.text, line.tone, { tick: ev?.at ?? null });
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
        // First fight ever: explain the basics before the player has to choose.
        if (!getSettings().combatTutorialSeen) showTutorial();
    });
}

LOU.combatUi = { runEncounter, combatKey };
})();
