// The left-hand panel: Akira's portrait, where he is and which episode,
// his health, condition and yield level, then the menu.
//
// The portrait has no background art yet. When the location art arrives,
// re-enable the commented-out block in style.css ("Background art").

(() => {
"use strict";

const { DATA } = LOU.data;
const { getState, getVitals } = LOU.state;
const { describe } = LOU.combat;
const { el, icon } = LOU.ui;
const { SpriteActor } = LOU.sprites;
const { getSettings, setSetting } = LOU.settings;
let refs = null;
let portraitActor = null;
let lastTip = -1;
let portraitDown = false;

const features = () => DATA.game?.features ?? {};
const achievementsMenuName = () => DATA.game?.achievementsMenu ?? "Achievements";

function mountSidebar(container, { onMenu }) {
    const portrait = el(
        "div",
        { class: "portrait", dataset: { ground: "none" } },
        // Background art layers, kept so the art can drop straight in later.
        el("div", { class: "portrait-sky" }),
        el("div", { class: "portrait-orb" }),
        el("div", { class: "portrait-ground" }),
        el("div", { class: "portrait-anchor" })
    );
    const collapseBtn = el(
        "button",
        { class: "icon-btn sidebar-collapse", type: "button", "aria-label": "Hide sidebar", title: "Hide sidebar", onclick: () => toggleCollapsed() },
        icon("chevronLeft")
    );

    const info = el("ul", { class: "sb-info" });
    const objective = el("div", { class: "sb-objective" });
    const stats = el("div", { class: "sb-stats" });
    const bars = el("div", { class: "sb-bars" });
    const conditions = el("div", { class: "sb-conditions" });
    const tip = el("p", { class: "sb-tip" });

    // Order: story menus first, then Save and Load side by side, and
    // Settings alone at the very bottom (it stretches across both columns).
    const menuItems = [
        ["character", "Character", "person"],
        ["objectives", "Objectives", "flag"],
        features().journal ? ["journal", "Journal", "book"] : ["achievements", achievementsMenuName(), "trophy"],
        ["credits", "Credits", "star"],
        ["save", "Save", "save"],
        ["load", "Load", "load"],
        features().settings ? ["settings", "Settings", "gear"] : null,
    ].filter(Boolean);
    const menuButtons = {};
    const menu = el(
        "nav",
        { class: "sb-menu", "aria-label": "Game menu" },
        menuItems.map(([id, label, ic]) => {
            const btn = el("button", { class: "sb-menu-btn", type: "button", onclick: () => onMenu(id) }, icon(ic), el("span", { text: label }));
            menuButtons[id] = btn;
            return btn;
        })
    );

    const version = el("div", { class: "sb-version", text: `v${DATA.game?.version ?? "?"} ${DATA.game?.build ?? ""}`.trim() });

    container.replaceChildren(
        el("div", { class: "sb-top" }, portrait, collapseBtn),
        el(
            "div",
            { class: "sb-scroll" },
            // Name and info rows share one wrapper so the even spacing
            // treats them as a single section and keeps them together.
            el("div", { class: "sb-identity" }, el("div", { class: "sb-name", text: "Akira" }), info),
            objective,
            stats,
            bars,
            conditions,
            features().tips ? tip : null,
            menu
        ),
        version
    );

    portraitActor?.destroy();
    portraitActor = new SpriteActor("akira", { scale: 1 });
    portraitDown = false;
    portrait.querySelector(".portrait-anchor").append(portraitActor.el);

    // Expand rail: the button that brings the sidebar back.
    const rail = document.getElementById("sidebar-rail");
    rail.replaceChildren(
        el("button", { class: "icon-btn", type: "button", "aria-label": "Show sidebar", title: "Show sidebar", onclick: () => setCollapsed(false) }, icon("chevronRight"))
    );

    refs = { portrait, info, objective, stats, bars, conditions, tip, menuButtons };
    applyCollapsed();
    updateSidebar({ newTip: true });
}

// Hide or show the sidebar. setCollapsed(true) hides it, setCollapsed(false)
// brings it back; toggleCollapsed() flips whichever it is now.
function setCollapsed(collapsed) {
    setSetting("portraitCollapsed", Boolean(collapsed));
    applyCollapsed();
}

function toggleCollapsed() {
    setCollapsed(!getSettings().portraitCollapsed);
}

function applyCollapsed() {
    document.getElementById("app")?.classList.toggle("sidebar-collapsed", Boolean(getSettings().portraitCollapsed));
}

// One labelled bar, e.g. "Stamina  80 / 105" with a fill showing how full it is.
// Each vital has its own colour (set in style.css by its name); below a
// quarter full the bar gets "is-low" and turns red.
function vitalBar(name, { current, max }) {
    const label = name[0].toUpperCase() + name.slice(1);
    const pct = max ? Math.round((current / max) * 100) : 0;
    return el(
        "div",
        { class: `sb-bar sb-bar-${name}${pct < 25 ? " is-low" : ""}`, title: `${label}: ${current} / ${max}` },
        el("div", { class: "sb-bar-head" },
            el("span", { class: "sb-bar-label", text: label }),
            el("span", { class: "sb-bar-value", text: `${current} / ${max}` })),
        el("div", { class: "sb-bar-track" }, el("div", { class: "sb-bar-fill", style: { width: `${pct}%` } }))
    );
}

function infoRow(iconName, main, sub, label) {
    return el(
        "li",
        { title: label },
        icon(iconName),
        el("span", { class: "sb-info-main", text: main }),
        sub ? el("span", { class: "sb-info-sub", text: sub }) : null
    );
}

// Every line for the Condition list: one for health, one for stamina
// once it's low, then any story conditions.
function conditionLines() {
    const s = getState();
    const v = getVitals();
    const table = DATA.player?.conditionText ?? {};
    const lines = [];
    for (const name of ["health", "stamina"]) {
        const d = describe(table[name], v[name].max ? v[name].current / v[name].max : 0);
        if (d.text) lines.push(d);
    }
    for (const id of s.activeConditions ?? []) {
        const [text, tone] = DATA.player?.conditions?.[id] ?? [id, ""];
        lines.push({ text, tone });
    }
    return lines;
}

function updateSidebar({ newTip = false } = {}) {
    if (!refs) return;
    const s = getState();
    const loc = DATA.locations?.[s.location];

    refs.portrait.dataset.ground = loc?.ground ?? "none";

    const rows = [];
    rows.push(infoRow("pin", loc?.name ?? "Unknown", loc?.region ?? null, "Location"));
    rows.push(infoRow("calendar", `Episode ${s.episode}`, null, "Episode"));
    refs.info.replaceChildren(...rows);

    const v = getVitals();
    const down = v.health.current <= 0;
    if (portraitActor && down !== portraitDown) {
        portraitDown = down;
        if (down) portraitActor.play("defeat", { hold: true });
        else portraitActor.play("idle");
    }

    const healthTone = describe(DATA.player?.conditionText?.health, v.health.current / v.health.max).tone;
    refs.stats.replaceChildren(
        el("div", { class: `sb-stat tone-${healthTone}` },
            el("span", { class: "sb-stat-label", text: "Health" }),
            el("span", { class: "sb-stat-value" }, el("strong", { text: String(v.health.current) }), el("span", { class: "sb-stat-max", text: ` / ${v.health.max}` }))),
        el("div", { class: "sb-stat" },
            el("span", { class: "sb-stat-label", text: "Yield level" }),
            el("span", { class: "sb-stat-value is-yield" }, el("strong", { text: String(s.yieldLevel ?? "???") })))
    );

    refs.objective.classList.toggle("is-empty", !s.objective);
    refs.objective.replaceChildren(
        el("span", { class: "sb-label" }, icon("flag"), "Objective"),
        el("div", { class: "sb-objective-text", text: s.objective ?? "Nothing pressing." })
    );

    // Health already has its big card above, so the bars cover the other two.
    refs.bars.replaceChildren(...["stamina", "aether"].map((name) => vitalBar(name, v[name])));

    refs.conditions.replaceChildren(
        el("span", { class: "sb-label", text: "Condition" }),
        el("ul", { class: "sb-condition-list" }, conditionLines().map((l) => el("li", { class: `tone-${l.tone || "calm"}`, text: l.text })))
    );

    if (newTip && features().tips) {
        const tips = (DATA.tips ?? []).filter((t) => typeof t === "string");
        if (tips.length) {
            let i;
            do { i = Math.floor(Math.random() * tips.length); } while (tips.length > 1 && i === lastTip);
            lastTip = i;
            refs.tip.replaceChildren(el("span", { class: "sb-tip-label", text: "Tip: " }), tips[i]);
        }
    }

    setBadge("objectives", s.objectiveUnread ? 1 : 0, "new objective");
    if (features().journal) setBadge("journal", s.codexUnread?.length ?? 0);
    else setBadge("achievements", (s.achievementsUnread ?? []).filter((f) => DATA.achievements?.[f]).length);
}

function setBadge(id, count, label = "new") {
    const btn = refs?.menuButtons[id];
    if (!btn) return;
    btn.querySelector(".badge")?.remove();
    if (count) btn.append(el("span", { class: "badge", text: id === "objectives" ? "!" : String(count), "aria-label": `${count} ${label}` }));
}

LOU.sidebar = { mountSidebar, updateSidebar, toggleCollapsed, setCollapsed };
})();
