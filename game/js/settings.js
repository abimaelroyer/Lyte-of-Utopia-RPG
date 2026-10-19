// Player preferences. Stored separately from saves so they survive a new game.

(() => {
"use strict";

const KEY = "lou_settings_v1";

const DEFAULTS = {
    textSize: "medium",      // small | medium | large
    animations: true,        // combat sprites animate
    combatPace: "normal",    // fast | normal | slow: delay between combat log lines
    portraitCollapsed: false,
};

let settings = { ...DEFAULTS };

function loadSettings() {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (raw) settings = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
        settings = { ...DEFAULTS };
    }
    applySettings();
    return settings;
}

function getSettings() { return settings; }

function setSetting(key, value) {
    settings[key] = value;
    try { window.localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* private mode */ }
    applySettings();
}

function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function animationsOn() { return settings.animations && !prefersReducedMotion(); }

function paceMs() {
    if (!animationsOn()) return 0;
    return { fast: 120, normal: 420, slow: 800 }[settings.combatPace] ?? 420;
}

function applySettings() {
    const root = document.documentElement;
    root.dataset.textSize = settings.textSize;
    root.dataset.animations = animationsOn() ? "on" : "off";
}

function resetSettings() {
    settings = { ...DEFAULTS };
    try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
    applySettings();
}

LOU.settings = { loadSettings, getSettings, setSetting, animationsOn, paceMs, resetSettings };
})();
