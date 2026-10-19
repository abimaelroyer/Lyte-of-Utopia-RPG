// Entry point. Loads data, shows the title screen, moves between scenes,
// starts fights, autosaves, and opens the sidebar menus.

(() => {
"use strict";

const { DATA, loadData } = LOU.data;
const State = LOU.state;
const Saves = LOU.saves;
const { loadSettings, getSettings, setSetting, resetSettings } = LOU.settings;
const { mountSidebar, updateSidebar } = LOU.sidebar;
const { runEncounter, combatKey } = LOU.combatUi;
const { describe } = LOU.combat;
const { el, formatText, renderChoices, openModal, closeModal, modalOpen, confirmDialog, toast, icon } = LOU.ui;
const $ = (id) => document.getElementById(id);

let inFight = false;
let lastTick = performance.now();
let onTitle = true;

// ---- boot -------------------------------------------------------------------

async function boot() {
    loadSettings();
    try {
        await loadData();
    } catch (err) {
        console.error(err);
        $("scene").innerHTML = `<p class="error">The game's data couldn't be loaded: ${err.message}</p>`;
        $("app").classList.remove("is-loading");
        return;
    }
    document.title = DATA.game?.title ?? "Lyte of Utopia";
    let problemCount = 0;
    LOU.check.runChecks(() => {
        problemCount += 1;
        if (problemCount === 1) setTimeout(() => toast(`Story data has problems. Open the console (F12) for details.`, { tone: "bad", ms: 8000 }), 300);
    });
    // With the Settings menu switched off, nobody can change these, so make
    // sure an old saved preference doesn't leave a player stuck with it.
    if (!features().settings) {
        setSetting("textSize", "medium");
        setSetting("animations", true);
        setSetting("combatPace", "normal");
    }
    Saves.migrateOldSaves();
    mountSidebar($("sidebar"), { onMenu: openMenu });
    $("mobile-menu").addEventListener("click", () => $("app").classList.toggle("drawer-open"));
    $("drawer-scrim").addEventListener("click", () => $("app").classList.remove("drawer-open"));
    document.addEventListener("keydown", onKey);
    setInterval(tickPlaytime, 15000);
    window.addEventListener("beforeunload", () => { if (!onTitle && !inFight) { tickPlaytime(); Saves.autosave(); } });
    $("app").classList.remove("is-loading");
    showTitle();
}

function tickPlaytime() {
    const now = performance.now();
    if (!onTitle) State.addPlaytime(now - lastTick);
    lastTick = now;
}

// ---- title screen -------------------------------------------------------------

function showTitle() {
    onTitle = true;
    inFight = false;
    $("app").classList.add("on-title");
    const recent = Saves.mostRecent();
    const g = DATA.game ?? {};

    const buttons = [];
    if (recent) {
        const sum = recent.record.summary ?? {};
        buttons.push(el("button", { class: "title-btn is-primary", type: "button", onclick: () => loadSlot(recent.slot) },
            el("span", { class: "title-btn-main", text: "Continue" }),
            el("span", { class: "title-btn-sub", text: [sum.location, sum.episode ? `Episode ${sum.episode}` : null, timeAgo(recent.record.savedAt)].filter(Boolean).join(" · ") })));
    }
    buttons.push(el("button", { class: `title-btn${recent ? "" : " is-primary"}`, type: "button", onclick: startNewGame },
        el("span", { class: "title-btn-main", text: "New game" })));
    if (Saves.hasAnySave()) buttons.push(el("button", { class: "title-btn", type: "button", onclick: () => openMenu("load") }, el("span", { class: "title-btn-main", text: "Load" })));
    if (features().settings) buttons.push(el("button", { class: "title-btn", type: "button", onclick: () => openMenu("settings") }, el("span", { class: "title-btn-main", text: "Settings" })));
    buttons.push(el("button", { class: "title-btn", type: "button", onclick: () => openMenu("credits") }, el("span", { class: "title-btn-main", text: "Credits" })));

    const storageNote = Saves.storageAvailable() ? null
        : el("p", { class: "title-warn", text: "This browser is blocking local storage, so saves won't persist. Try a normal (not private) window." });

    $("title-screen").replaceChildren(
        el("div", { class: "title-inner" },
            el("p", { class: "title-kicker", text: g.subtitle ?? "" }),
            el("h1", { class: "title-name", text: g.title ?? "Lyte of Utopia" }),
            el("p", { class: "title-ep", text: "Episode 1" }),
            el("nav", { class: "title-menu", "aria-label": "Title menu" }, buttons),
            storageNote,
            el("p", { class: "title-warning", text: "Contains violence, gore and mature themes." }),
            el("p", { class: "title-foot", text: `v${g.version ?? ""} ${g.build ?? ""} · ${g.feedback ?? ""}` })
        )
    );
    $("title-screen").hidden = false;
    $("title-screen").querySelector(".title-btn")?.focus();
}

function hideTitle() {
    onTitle = false;
    lastTick = performance.now();
    $("app").classList.remove("on-title");
    $("title-screen").hidden = true;
}

async function startNewGame() {
    if (Saves.readRecord("auto")) {
        const ok = await confirmDialog({
            title: "Start a new game?",
            message: "Your autosave will be replaced as soon as you begin. Saves in numbered slots are kept.",
            confirmText: "Start new game",
        });
        if (!ok) return;
    }
    closeModal();
    State.newGame();
    hideTitle();
    goToScene(DATA.game?.startScene ?? "ep1Opening");
}

function loadSlot(slot) {
    if (!Saves.load(slot)) {
        toast("That save couldn't be loaded.", { tone: "bad" });
        return;
    }
    closeModal();
    hideTitle();
    goToScene(State.getState().currentScene, { fromLoad: true });
    toast(slot === "auto" ? "Autosave loaded." : `Slot ${slot} loaded.`);
}

// ---- scenes -------------------------------------------------------------------

function goToScene(sceneId, { fromLoad = false } = {}) {
    const scene = DATA.story?.[sceneId];
    if (!scene) {
        console.error(`Missing scene: ${sceneId}`);
        toast(`Missing scene "${sceneId}". Please report this.`, { tone: "bad", ms: 5000 });
        return;
    }
    tickPlaytime();
    const newObjective = State.setScene(sceneId, scene);
    if (!fromLoad) {
        if (newObjective) toast(el("span", {}, icon("flag"), ` New objective: ${newObjective}`), { tone: "info", ms: 3400 });
        announce(State.applyEffects(scene.onEnter));
    }
    $("app").classList.remove("drawer-open");
    updateSidebar({ newTip: true });

    const sceneEl = $("scene");
    const choicesEl = $("choices");
    sceneEl.classList.remove("is-in");
    void sceneEl.offsetWidth;
    sceneEl.classList.add("is-in");
    $("main").scrollTop = 0;
    window.scrollTo(0, 0);

    if (scene.encounter) {
        // Autosave lands on the scene before the fight is resolved, so loading
        // it restarts the fight from the top.
        Saves.autosave();
        startFight(scene);
        return;
    }

    sceneEl.innerHTML = formatText(scene.text);
    renderSceneChoices(scene, choicesEl);
    if (!scene.ending) Saves.autosave();
}

function renderSceneChoices(scene, container) {
    const choices = (scene.choices ?? []).map((choice) => {
        const check = meetsRequirements(choice.requires);
        return {
            text: choice.text,
            disabled: !check.passed,
            reason: check.reason,
            onSelect: () => pickChoice(choice),
        };
    });
    if (scene.ending || !choices.length) {
        choices.push({ text: "Return to the title screen", kind: "end", onSelect: () => { Saves.autosave(); showTitle(); } });
        if (DATA.game?.feedback) {
            $("scene").append(el("p", { class: "scene-feedback", text: `Thanks for playtesting. ${DATA.game.feedback}` }));
        }
    }
    renderChoices(container, choices);
}

function meetsRequirements(requires) {
    if (!requires) return { passed: true };
    for (const flag of requires.flags ?? []) if (!State.hasFlag(flag)) return { passed: false, reason: "You haven't done what this needs yet." };
    for (const item of requires.items ?? []) if (!State.hasItem(item)) return { passed: false, reason: "You don't have what this needs." };
    for (const [stat, min] of Object.entries(requires.stats ?? {})) {
        if ((State.getState().stats[stat] ?? 0) < min) return { passed: false, reason: `Needs ${stat} ${min}.` };
    }
    return { passed: true };
}

function pickChoice(choice) {
    announce(State.applyEffects(choice.effects));
    if (choice.advancesStory) State.advanceStory();
    if (choice.goto === "__title") { showTitle(); return; }
    goToScene(choice.goto);
}

const features = () => DATA.game?.features ?? {};
const flagsMenuName = () => DATA.game?.flagsMenu ?? "Achievements";

// Toasts for anything new a scene or choice just unlocked.
function announce(news) {
    if (features().journal) {
        for (const id of news.codex) {
            const entry = DATA.codex?.[id];
            if (entry) toast(el("span", {}, icon("book"), ` Journal: ${entry.title}`), { tone: "info" });
        }
    }
    for (const id of news.flags) {
        const entry = DATA.flags?.[id];
        if (entry?.text) toast(el("span", {}, icon("trophy"), ` ${entry.text}`), { tone: "info", ms: 3400 });
    }
    if (news.codex.length || news.flags.length) updateSidebar();
}

async function startFight(scene) {
    const enc = typeof scene.encounter === "string" ? { enemy: scene.encounter } : scene.encounter;
    inFight = true;
    $("app").classList.add("in-fight");
    $("choices").replaceChildren();
    const sceneEl = $("scene");
    sceneEl.replaceChildren();
    if (scene.text) sceneEl.innerHTML = formatText(scene.text);
    const holder = el("div", { class: "combat-holder" });
    sceneEl.append(holder);

    const outcome = await runEncounter(holder, { enemyId: enc.enemy, canFlee: Boolean(enc.flee), modifiers: enc.modifiers });

    inFight = false;
    $("app").classList.remove("in-fight");
    const next = { win: enc.win, loss: enc.lose, draw: enc.lose, fled: enc.flee }[outcome];
    if (outcome === "win") State.advanceStory();
    goToScene(next);
}

// ---- keyboard -------------------------------------------------------------------

function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "Escape") {
        if (closeModal()) { e.preventDefault(); return; }
        if ($("app").classList.contains("drawer-open")) { $("app").classList.remove("drawer-open"); return; }
        return;
    }
    if (modalOpen() || onTitle) return;
    if (inFight) {
        if (combatKey(e.key)) e.preventDefault();
        return;
    }
    if (/^[1-9]$/.test(e.key)) {
        const btns = $("choices").querySelectorAll("button.choice");
        const btn = btns[Number(e.key) - 1];
        if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
    }
}

// ---- menus ------------------------------------------------------------------------

function openMenu(id) {
    $("app").classList.remove("drawer-open");
    ({ character: openCharacter, journal: openJournal, flags: openFlags, objectives: openObjectives, save: () => openSlots("save"), load: () => openSlots("load"), settings: openSettings, credits: openCredits }[id])?.();
}

const STAT_LABELS = {
    flow: "Flow", flux: "Flux", control: "Control", strength: "Strength", constitution: "Constitution",
    vitality: "Vitality", movementSpeed: "Movement", agility: "Agility", endurance: "Endurance",
};

const STAT_HELP = {
    flow: "How much aether you can hold.",
    flux: "How much focus you can build and how fast.",
    control: "How hard and fast your aetherical arts hit.",
    strength: "How hard your physical attacks hit.",
    constitution: "How well you shrug off damage.",
    vitality: "How much punishment you can take.",
    movementSpeed: "How quickly you recover after acting.",
    agility: "How quickly your physical attacks come out.",
    endurance: "How long you can keep going.",
};

function openCharacter() {
    const s = State.getState();
    const a = State.getAttributes();
    const v = State.getVitals();
    const moves = (DATA.player?.moveIds ?? []).map((id) => ({ id, ...DATA.moves[id] })).filter((m) => m.name && m.enabled !== false);

    const vitalsList = ["health", "stamina", "aether", "composure"].map((name) => {
        const d = describe(DATA.player?.vitalText?.[name], v[name].current / v[name].max);
        const label = { health: "Health", stamina: "Stamina", aether: "Aether", composure: "Composure" }[name];
        return el("div", { class: "char-vital" },
            el("span", { class: "char-vital-label", text: label }),
            el("span", { class: `char-vital-text tone-${d.tone}`, text: d.text }),
            name === "composure" ? null : el("span", { class: "char-vital-num", text: `${v[name].current} / ${v[name].max}` }));
    });

    const body = el("div", { class: "character" },
        el("div", { class: "char-head" },
            el("div", {},
                el("h3", { text: "Akira" }),
                el("p", { class: "muted", text: `Episode ${s.episode}` })),
            el("div", { class: "char-yield" }, el("span", { class: "muted", text: "Yield level" }), el("strong", { text: String(s.yieldLevel ?? "???") }))),
        el("section", {}, el("h4", { text: "Condition" }), el("div", { class: "char-vitals" }, vitalsList)),
        el("section", {}, el("h4", { text: "Stats" }),
            el("dl", { class: "stat-grid" }, Object.entries(STAT_LABELS).map(([k, label]) =>
                el("div", { class: "stat", title: STAT_HELP[k] }, el("dt", { text: label }), el("dd", { text: String(s.stats[k]) }), el("p", { class: "stat-help", text: STAT_HELP[k] }))))),
        el("section", {}, el("h4", { text: "In a fight" }),
            el("dl", { class: "derived" },
                [["Melee potency", a.meleePotency], ["Aether potency", a.aetherPotency], ["Physical defence", a.physicalDefense], ["Aetherical defence", a.aetherDefense],
                    ["Physical speed", `×${a.physicalSpeed.toFixed(2)}`], ["Recovery", a.recoveryReduction >= 0.01 ? `${Math.round(a.recoveryReduction * 100)}% faster` : "Normal"]]
                    .map(([k, val]) => el("div", {}, el("dt", { text: k }), el("dd", { text: String(val) }))))),
        el("section", {}, el("h4", { text: "What you can do" }),
            el("ul", { class: "move-list" }, moves.map((m) => el("li", {},
                el("strong", { text: m.name }),
                el("span", { class: "muted", text: DATA.player?.moveText?.[m.id] ?? "" })))))
    );
    openModal({ title: "Character", body, wide: true });
}

// Objectives: the current one on top, everything already done below,
// grouped by episode.
function openObjectives() {
    const s = State.getState();
    const log = s.objectiveLog ?? [];
    const current = log.filter((o) => !o.done);
    const done = log.filter((o) => o.done);
    const byEpisode = new Map();
    for (const o of done) {
        if (!byEpisode.has(o.episode)) byEpisode.set(o.episode, []);
        byEpisode.get(o.episode).push(o);
    }
    const body = el("div", { class: "objectives" },
        el("section", {}, el("h4", { text: "Current" }),
            current.length
                ? el("ul", { class: "objective-list" }, current.map((o) => el("li", { class: "objective is-current" }, icon("flag"), el("span", { text: o.text }))))
                : el("p", { class: "muted", text: "Nothing right now." })),
        [...byEpisode].sort((a, b) => b[0] - a[0]).map(([ep, list]) =>
            el("section", {}, el("h4", { text: `Done · Episode ${ep}` }),
                el("ul", { class: "objective-list" }, list.slice().reverse().map((o) =>
                    el("li", { class: "objective is-done" }, el("span", { class: "objective-check", text: "✓" }), el("span", { text: o.text }))))))
    );
    openModal({ title: "Objectives", body, onClose: () => { State.markObjectivesRead(); updateSidebar(); } });
}

// The flags menu: things Akira has done or learned, grouped by episode, in the
// order they happened. Text comes from data/flags.js; flags without text
// stay hidden.
function openFlags() {
    const s = State.getState();
    const unread = new Set(s.flagsUnread ?? []);
    const byEpisode = new Map();
    for (const [id, on] of Object.entries(s.flags)) {
        const entry = DATA.flags?.[id];
        if (on !== true || !entry?.text) continue;
        const ep = entry.episode ?? s.episode;
        if (!byEpisode.has(ep)) byEpisode.set(ep, []);
        byEpisode.get(ep).push({ id, ...entry });
    }
    const body = byEpisode.size
        ? el("div", { class: "flags" }, [...byEpisode].sort((a, b) => a[0] - b[0]).map(([ep, entries]) =>
            el("section", {}, el("h4", { text: `Episode ${ep}` }),
                el("ol", { class: "flag-list" }, entries.map((e) =>
                    el("li", { class: `flag${unread.has(e.id) ? " is-new" : ""}` },
                        el("span", { text: e.text }),
                        unread.has(e.id) ? el("span", { class: "new-pill", text: "New" }) : null))))))
        : el("p", { class: "muted", text: "No achievements yet. The choices you make and the things that happen to you will be kept here." });
    openModal({ title: flagsMenuName(), body, wide: true, onClose: () => { State.markFlagsRead(); updateSidebar(); } });
}

function openJournal() {
    const s = State.getState();
    const unread = new Set(s.codexUnread ?? []);
    const groups = new Map();
    for (const id of s.codex) {
        const entry = DATA.codex?.[id];
        if (!entry) continue;
        if (!groups.has(entry.group)) groups.set(entry.group, []);
        groups.get(entry.group).push({ id, ...entry });
    }
    const body = groups.size
        ? el("div", { class: "journal" }, [...groups].map(([group, entries]) =>
            el("section", {}, el("h4", { text: group }),
                entries.map((e) => el("article", { class: `journal-entry${unread.has(e.id) ? " is-new" : ""}` },
                    el("h5", {}, e.title, unread.has(e.id) ? el("span", { class: "new-pill", text: "New" }) : null),
                    el("p", { text: e.text }))))))
        : el("p", { class: "muted", text: "Nothing yet. People, places and mysteries you come across will be written down here." });
    openModal({ title: "Journal", body, wide: true, onClose: () => { State.markCodexRead(); updateSidebar(); } });
}

function timeAgo(ts) {
    if (!ts) return "";
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    return new Date(ts).toLocaleDateString();
}

function playtime(ms) {
    const m = Math.floor((ms ?? 0) / 60000);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function openSlots(mode) {
    const canSave = mode === "save" && !onTitle && !inFight;
    const body = el("div", { class: "slots" });
    const fileInput = el("input", { type: "file", accept: "application/json,.json", hidden: true });

    function render() {
        const rows = Saves.list().map(({ slot, record }) => {
            const isAuto = slot === "auto";
            const sum = record?.summary ?? {};
            const title = isAuto ? "Autosave" : `Slot ${slot}`;
            const actions = [];
            if (mode === "save" && !isAuto) {
                actions.push(el("button", { class: "btn btn-primary", type: "button", disabled: !canSave || null, onclick: () => doSave(slot, record) }, record ? "Overwrite" : "Save here"));
            }
            if (mode === "load" && record) {
                actions.push(el("button", { class: "btn btn-primary", type: "button", onclick: () => doLoad(slot) }, "Load"));
            }
            if (record) {
                actions.push(el("button", { class: "icon-btn", type: "button", title: "Export to a file", "aria-label": `Export ${title}`, onclick: () => Saves.exportSlot(slot) }, icon("download")));
                actions.push(el("button", { class: "icon-btn", type: "button", title: "Delete", "aria-label": `Delete ${title}`, onclick: () => doDelete(slot, title) }, icon("trash")));
            }
            if (mode === "load" && !isAuto && !record) {
                actions.push(el("button", { class: "btn", type: "button", onclick: () => pickImport(slot) }, icon("upload"), " Import file"));
            }
            return el("div", { class: `slot${record ? "" : " is-empty"}${isAuto ? " is-auto" : ""}` },
                el("div", { class: "slot-info" },
                    el("div", { class: "slot-title" }, el("strong", { text: title }), record ? el("span", { class: "muted", text: timeAgo(record.savedAt) }) : null),
                    record
                        ? el("div", { class: "slot-meta", text: [sum.location, sum.episode ? `Episode ${sum.episode}` : null, `played ${playtime(sum.playtimeMs)}`].filter(Boolean).join(" · ") })
                        : el("div", { class: "slot-meta muted", text: isAuto ? "Saved automatically whenever the scene changes." : "Empty" }),
                    record?.summary?.preview ? el("p", { class: "slot-preview", text: `${sum.preview}…` }) : null),
                el("div", { class: "slot-actions" }, actions));
        });
        const note = mode === "save" && !canSave
            ? el("p", { class: "slots-note", text: inFight ? "You can't save in the middle of a fight. The autosave from just before it is kept." : "Start or continue a game to save." })
            : el("p", { class: "slots-note muted", text: "Saves live in this browser. Export one to keep it as a file or move it to another computer." });
        body.replaceChildren(note, ...rows, fileInput);
    }

    async function doSave(slot, existing) {
        if (existing) {
            const ok = await confirmDialog({ title: `Overwrite slot ${slot}?`, message: "The save already in this slot will be replaced.", confirmText: "Overwrite" });
            if (!ok) { openSlots(mode); return; }
        }
        const ok = Saves.save(slot);
        toast(ok ? `Saved to slot ${slot}.` : "Couldn't save. The browser may be out of space or blocking storage.", { tone: ok ? "good" : "bad" });
        openSlots(mode);
    }

    async function doLoad(slot) {
        if (!onTitle) {
            const ok = await confirmDialog({ title: "Load this save?", message: "Anything since your last save will be lost.", confirmText: "Load" });
            if (!ok) { openSlots(mode); return; }
        }
        if (inFight) { location.reload(); return; }
        loadSlot(slot);
    }

    async function doDelete(slot, title) {
        const ok = await confirmDialog({ title: `Delete ${title.toLowerCase()}?`, message: "This can't be undone.", confirmText: "Delete", danger: true });
        if (ok) { Saves.remove(slot); toast(`${title} deleted.`); }
        if (onTitle && !Saves.hasAnySave()) { closeModal(); showTitle(); return; }
        if (onTitle) showTitle();
        openSlots(mode);
    }

    let importTarget = null;
    function pickImport(slot) { importTarget = slot; fileInput.value = ""; fileInput.click(); }
    fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file || !importTarget) return;
        try {
            const record = await Saves.readImportFile(file);
            Saves.importToSlot(importTarget, record);
            toast(`Imported into slot ${importTarget}.`, { tone: "good" });
            render();
        } catch (err) {
            toast(err.message, { tone: "bad", ms: 5000 });
        }
    });

    render();
    openModal({ title: mode === "save" ? "Save game" : "Load game", body, wide: true });
}

function openSettings() {
    const st = getSettings();
    const seg = (key, options) => el("div", { class: "seg", role: "radiogroup" }, options.map(([value, label]) =>
        el("button", { type: "button", class: `seg-btn${st[key] === value ? " is-on" : ""}`, role: "radio", "aria-checked": String(st[key] === value),
            onclick: () => { setSetting(key, value); openSettings(); } }, label)));

    const body = el("div", { class: "settings" },
        el("div", { class: "setting" }, el("div", {}, el("strong", { text: "Text size" })), seg("textSize", [["small", "Small"], ["medium", "Medium"], ["large", "Large"]])),
        el("div", { class: "setting" }, el("div", {}, el("strong", { text: "Animations" }), el("p", { class: "muted", text: "Sprites, scene fades and screen shake." })), seg("animations", [[true, "On"], [false, "Off"]])),
        el("div", { class: "setting" }, el("div", {}, el("strong", { text: "Combat pace" }), el("p", { class: "muted", text: "How quickly each line of a round appears." })), seg("combatPace", [["fast", "Fast"], ["normal", "Normal"], ["slow", "Slow"]])),
        el("div", { class: "setting setting-danger" },
            el("div", {}, el("strong", { text: "Erase everything" }), el("p", { class: "muted", text: "Deletes every save and resets settings on this browser." })),
            el("button", { class: "btn btn-danger", type: "button", onclick: async () => {
                const ok = await confirmDialog({ title: "Erase all saves?", message: "Every save slot, including the autosave, will be deleted. This can't be undone.", confirmText: "Erase everything", danger: true });
                if (ok) { Saves.clearAll(); resetSettings(); toast("All saves erased."); if (onTitle) showTitle(); } else openSettings();
            } }, "Erase"))
    );
    openModal({ title: "Settings", body });
}

function openCredits() {
    const text = DATA.system?.credits?.text ?? "";
    openModal({ title: "Credits", body: el("div", { class: "credits", html: formatText(text) }) });
}

boot();
})();
