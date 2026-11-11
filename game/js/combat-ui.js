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
const { createEncounter, resolveRound, playerOptions, enemyCondition } = LOU.combat;
const { openingLine, intentLine, intentTagLabel, narrateRound } = LOU.narration;
const { SpriteActor } = LOU.sprites;
const { paceMs, animationsOn, getSettings, setSetting } = LOU.settings;
const { el, icon, sleep, inline, formatText, openModal, closeModal } = LOU.ui;
// The four categories shown first. Picking one shows its moves.
const GROUPS = [
    ["attack", "Combat", "sword"],
    ["defend", "Defense", "shield"],
    ["recover", "Recovery", "wind"],
    ["escape", "Flee", "run"],
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

// The "Combat Tutorial" window. Its words live in data/combat-text.js under
// "tutorial", so they can be edited without touching code. Each entry in
// "steps" is either ["Heading", "Text"] (a numbered step) or ["Text"]
// (a plain paragraph, handy for an intro or a sign-off).
// "enemyNotes" adds lines at the end only when fighting that enemy, so the
// wolf's sign-off doesn't show up in other fights.
function showTutorial(enemyId) {
    const t = DATA.combatText?.tutorial;
    if (!t?.steps?.length) return;
    const parts = [];
    let list = null;
    let number = 0;
    const notes = (t.enemyNotes?.[enemyId] ?? []).map((line) => [line]);
    for (const entry of [...t.steps, ...notes]) {
        // Skip anything that isn't a list of text, e.g. from a missing comma.
        if (!Array.isArray(entry) || !entry.length) {
            console.warn("Combat tutorial: skipped a step that isn't a [heading, text] list", entry);
            continue;
        }
        if (entry.length === 1) {
            list = null; // a paragraph ends the current numbered list
            parts.push(el("div", { class: "tutorial-note", html: formatText(entry[0]) }));
            continue;
        }
        const [head, text] = entry;
        if (!list) {
            // Keep counting where the last list left off.
            list = el("ol", { class: "tutorial-steps", start: number + 1 });
            parts.push(list);
        }
        number += 1;
        list.append(el("li", {},
            el("div", { class: "tutorial-head", text: head }),
            // formatText() is what story scenes use: \n is a line break,
            // a blank line (\n\n) starts a new paragraph, **bold** works.
            el("div", { class: "tutorial-text", html: formatText(text) })));
    }
    const body = el("div", { class: "tutorial" },
        ...parts,
        el("div", { class: "btn-row" },
            el("button", { class: "btn btn-primary", type: "button", autofocus: true, onclick: () => closeModal() }, t.button ?? "Got it")));
    openModal({ title: t.title ?? "Combat Tutorial", body, className: "modal-tutorial" });
    // Remember it was seen, so it only pops up by itself once.
    setSetting("combatTutorialSeen", true);
}

// ---- the tutorial tour ------------------------------------------------------
// Small windows that sit next to the thing they explain, one at a time.
// 1 goes back, ` goes forward. Steps live in data/combat-text.js ("tour").

let tourCleanup = null;

function visibleTarget(selector) {
    if (!selector) return null;
    const node = document.querySelector(selector);
    if (!node) return null;
    const r = node.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return null;
    return node;
}

function startTour(enemyId, { onDone } = {}) {
    tourCleanup?.();
    const t = DATA.combatText?.tutorial ?? {};
    const notes = (t.enemyNotes?.[enemyId] ?? []).map((text) => ({ title: "One more thing", text }));
    // Skip steps whose target isn't on screen (e.g. the sidebar on a phone).
    const steps = [...(t.tour ?? []), ...notes].filter((st) => !st.target || visibleTarget(st.target));
    if (!steps.length) { onDone?.(); return; }

    const blocker = el("div", { class: "tour-blocker" });
    const spot = el("div", { class: "tour-spot" });
    const box = el("div", { class: "tour-box", role: "dialog", "aria-live": "polite" });
    document.body.append(blocker, spot, box);
    let index = 0;
    const previousKeys = activeKeyHandler;

    function place() {
        const st = steps[index];
        const target = visibleTarget(st.target);
        const gap = 14;
        const bw = box.offsetWidth, bh = box.offsetHeight;
        if (!target) {
            spot.hidden = true;
            box.style.left = `${Math.max(12, (innerWidth - bw) / 2)}px`;
            box.style.top = `${Math.max(12, (innerHeight - bh) / 2)}px`;
            return;
        }
        target.scrollIntoView({ block: "nearest" });
        const r = target.getBoundingClientRect();
        spot.hidden = false;
        Object.assign(spot.style, { left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px` });
        // Try right, left, above, below; use the first that fits.
        const fits = (x, y) => x >= 8 && y >= 8 && x + bw <= innerWidth - 8 && y + bh <= innerHeight - 8;
        const clampY = (y) => Math.min(Math.max(8, y), innerHeight - bh - 8);
        const clampX = (x) => Math.min(Math.max(8, x), innerWidth - bw - 8);
        const options = [
            [r.right + gap, clampY(r.top + r.height / 2 - bh / 2)],
            [r.left - gap - bw, clampY(r.top + r.height / 2 - bh / 2)],
            [clampX(r.left + r.width / 2 - bw / 2), r.top - gap - bh],
            [clampX(r.left + r.width / 2 - bw / 2), r.bottom + gap],
        ];
        const [x, y] = options.find(([ox, oy]) => fits(ox, oy)) ?? [clampX(r.left), clampY(r.bottom + gap)];
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
    }

    function render() {
        const st = steps[index];
        const last = index === steps.length - 1;
        box.replaceChildren(
            el("div", { class: "tour-head" },
                el("span", { class: "tour-title", text: st.title ?? "" }),
                el("span", { class: "tour-count", text: `${index + 1} / ${steps.length}` })),
            el("div", { class: "tour-text", html: formatText(st.text ?? "") }),
            el("div", { class: "tour-nav" },
                el("button", { class: "tour-btn", type: "button", disabled: index === 0 || null, onclick: back },
                    el("span", { class: "action-key", text: "1" }), "Back"),
                el("button", { class: "tour-btn tour-next", type: "button", onclick: next },
                    last ? "Done" : "Next", el("span", { class: "action-key", text: "`" }))));
        place();
    }
    function next() { if (index < steps.length - 1) { index += 1; render(); } else finish(); }
    function back() { if (index > 0) { index -= 1; render(); } }
    function finish() {
        tourCleanup?.();
        setSetting("combatTutorialSeen", true);
        onDone?.();
    }
    const onResize = () => place();
    addEventListener("resize", onResize);
    tourCleanup = () => {
        removeEventListener("resize", onResize);
        blocker.remove(); spot.remove(); box.remove();
        activeKeyHandler = previousKeys;
        tourCleanup = null;
    };
    activeKeyHandler = (key) => {
        if (key === "`") { next(); return true; }
        if (key === "1") { back(); return true; }
        return true; // nothing else happens while the tour is open
    };
    render();
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
            el("button", { class: "stage-help", type: "button", title: "Combat Tutorial", "aria-label": "Combat Tutorial", onclick: () => startTour(enemyId) }, "?")
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

        // null = showing the categories; otherwise the open category's id.
        let openGroup = null;

        function moveButton(opt, g, label, ic, key) {
            const chips = [];
            if (opt.move.staminaCost) chips.push(el("span", { class: "chip chip-stamina", text: `${opt.move.staminaCost} sta` }));
            if (opt.move.aetherCost) chips.push(el("span", { class: "chip chip-aether", text: `${opt.move.aetherCost} ae` }));
            if (opt.focusCost) chips.push(el("span", { class: "chip chip-focus", text: `${opt.focusCost} focus` }));
            if (opt.usesLeft != null) chips.push(el("span", { class: "chip", text: `${opt.usesLeft} left` }));
            chips.push(el("span", { class: "chip chip-ticks", title: "Frame cost: startup + recovery", text: `${opt.frames} ticks` }));
            return el("button", {
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
        }

        function renderActions() {
            const all = playerOptions(enc);
            const byGroup = new Map(GROUPS.map(([g]) => [g, []]));
            all.forEach((opt) => byGroup.get(groupOf(opt.move.kind)).push(opt));
            const nodes = [];
            currentOptions = [];

            if (!openGroup) {
                // Categories, side by side. Same buttons as the moves.
                let n = 0;
                for (const [g, label, ic] of GROUPS) {
                    const opts = byGroup.get(g);
                    if (!opts.length) continue;
                    n += 1;
                    const key = n;
                    const usable = opts.some((o) => !o.blocked);
                    const pick = () => { openGroup = g; renderActions(); };
                    currentOptions.push({ key, pick });
                    nodes.push(el("button", {
                        class: `action-btn action-group group-${g}`,
                        type: "button",
                        disabled: !usable || busy || null,
                        onclick: pick,
                    },
                    el("span", { class: "action-top" },
                        el("span", { class: "action-key", text: String(key) }),
                        el("span", { class: "action-group-label" }, icon(ic))),
                    el("span", { class: "action-name", text: label }),
                    el("span", { class: "action-chips" }, el("span", { class: "chip", text: opts.length === 1 ? "1 move" : `${opts.length} moves` }))));
                }
            } else {
                const [g, label, ic] = GROUPS.find(([id]) => id === openGroup);
                byGroup.get(g).forEach((opt, i) => {
                    const key = i + 1;
                    currentOptions.push({ key, pick: () => choose(opt) });
                    nodes.push(moveButton(opt, g, label, ic, key));
                });
                const back = () => { openGroup = null; renderActions(); };
                currentOptions.push({ key: "`", pick: back });
                nodes.push(el("button", { class: "action-btn action-back", type: "button", disabled: busy || null, onclick: back },
                    el("span", { class: "action-top" }, el("span", { class: "action-key", text: "`" })),
                    el("span", { class: "action-name", text: "Back" }),
                    el("span", { class: "action-chips" }, el("span", { class: "chip", text: "Categories" }))));
            }
            actions.replaceChildren(...nodes);
            actions.classList.toggle("is-busy", busy);
            showDetail(null);
        }

        async function choose(opt) {
            if (busy || enc.over || opt.blocked) return;
            busy = true;
            openGroup = null;
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
        const fightKeys = (key) => {
            if (busy) return key === "`" || /^[1-9]$/.test(key);
            if (key === "`") { currentOptions.find((o) => o.key === "`")?.pick(); return true; }
            const n = Number(key);
            if (!Number.isInteger(n) || n < 1 || n > 9) return false;
            currentOptions.find((o) => o.key === n)?.pick();
            return true;
        };
        activeKeyHandler = fightKeys;
        renderFighters();
        logLine(openingLine(enc), "muted");
        renderIntent();
        logLine(intentText.textContent, "intent");
        renderActions();
        // First fight ever: explain the basics before the player has to choose.
        if (!getSettings().combatTutorialSeen) requestAnimationFrame(() => startTour(enemyId));
    });
}

LOU.combatUi = { runEncounter, combatKey };
})();
