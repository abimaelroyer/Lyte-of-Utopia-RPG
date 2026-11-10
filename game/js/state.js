// The live game state: everything a save file needs to put the player back
// exactly where they were. Read it with getState(); change it only through
// the functions below so vitals stay clamped and the sidebar stays truthful.

(() => {
"use strict";

const { deriveAttributes } = LOU.attributes;
const { DATA } = LOU.data;
const STATE_VERSION = 2;
const COMPOSURE_MAX = 100;

function freshState() {
    const state = {
        version: STATE_VERSION,

        // Story position
        episode: 1,
        currentScene: "ep1Opening",
        storyProgressed: 0,
        visited: [],

        // What the sidebar shows
        location: "void",
        objective: null,
        objectiveLog: [],      // [{ text, episode, done }] in the order they were given
        objectiveUnread: false,
        yieldLevel: DATA.player?.yieldLevel ?? "???",

        // Akira's nine raw stats (Episode 1 build, v0.11)
        stats: {
            flow: 11, flux: 1, control: 2,
            strength: 1, constitution: 1, vitality: 1,
            movementSpeed: 1, agility: 1, endurance: 1,
        },

        // Current values; maxima come from the stats. Composure is narrative only.
        vitals: { health: null, stamina: null, aether: null, composure: COMPOSURE_MAX },

        activeConditions: [],
        achievements: {},
        inventory: [],
        codex: [],
        codexUnread: [],
        achievementsUnread: [],

        playtimeMs: 0,
    };
    fillVitals(state);
    return state;
}

let state = freshState();

function fillVitals(s) {
    const a = deriveAttributes(s.stats);
    s.vitals.health = a.maxHealth;
    s.vitals.stamina = a.maxStamina;
    s.vitals.aether = a.maxAether;
    s.vitals.composure = COMPOSURE_MAX;
}

// ---- reading -------------------------------------------------------------

function getState() { return state; }
function getAttributes() { return deriveAttributes(state.stats); }

function vitalMax(name) {
    const a = getAttributes();
    return { health: a.maxHealth, stamina: a.maxStamina, aether: a.maxAether, composure: COMPOSURE_MAX }[name];
}

function getVitals() {
    const out = {};
    for (const name of ["health", "stamina", "aether", "composure"]) {
        out[name] = { current: state.vitals[name], max: vitalMax(name) };
    }
    return out;
}

function hasAchievement(id) { return state.achievements[id] === true; }
function hasItem(id) { return state.inventory.includes(id); }

// ---- writing -------------------------------------------------------------

function setVital(name, value) {
    const max = vitalMax(name);
    state.vitals[name] = Math.max(0, Math.min(max, Math.round(value)));
}

function changeVital(name, delta) {
    setVital(name, (state.vitals[name] ?? vitalMax(name)) + delta);
}

function restoreVitals() { fillVitals(state); }

// Returns true when the achievement is newly unlocked.
function setAchievement(id, value = true) {
    const isNew = value === true && state.achievements[id] !== true;
    state.achievements[id] = value;
    if (isNew && !state.achievementsUnread.includes(id)) state.achievementsUnread.push(id);
    if (value !== true) state.achievementsUnread = state.achievementsUnread.filter((f) => f !== id);
    return isNew;
}

function markAchievementsRead() { state.achievementsUnread = []; }

function addCodex(ids) {
    const added = [];
    for (const id of ids) {
        if (!state.codex.includes(id)) {
            state.codex.push(id);
            state.codexUnread.push(id);
            added.push(id);
        }
    }
    return added;
}

function markCodexRead() { state.codexUnread = []; }

// Moves to a scene and picks up its location and objective.
// Returns the new objective's text when it changed, otherwise null.
function setScene(sceneId, scene) {
    state.currentScene = sceneId;
    if (!state.visited.includes(sceneId)) state.visited.push(sceneId);
    if (!scene) return null;
    if (scene.location) state.location = scene.location;
    if (scene.objective !== undefined) return setObjective(scene.objective);
    return null;
}

// The current objective is the log entry that isn't done. Giving a new one
// ticks off the old; null just ticks it off. Re-giving an old objective
// (after refusing a death, say) reopens it instead of listing it twice.
function setObjective(text) {
    if ((text ?? null) === state.objective) return null;
    for (const o of state.objectiveLog) if (!o.done) o.done = true;
    state.objective = text ?? null;
    if (!text) return null;
    const existing = state.objectiveLog.find((o) => o.text === text && o.episode === state.episode);
    if (existing) {
        existing.done = false;
        state.objectiveLog = [...state.objectiveLog.filter((o) => o !== existing), existing];
    } else {
        state.objectiveLog.push({ text, episode: state.episode, done: false });
    }
    state.objectiveUnread = true;
    return text;
}

function markObjectivesRead() { state.objectiveUnread = false; }

// Applies a scene's onEnter block or a choice's effects block.
// Returns what's new ({ codex, achievements }) so the UI can announce it.
function applyEffects(effects) {
    const news = { codex: [], achievements: [] };
    if (!effects) return news;
    if (effects.restoreVitals) restoreVitals();
    for (const name of ["health", "stamina", "aether", "composure"]) {
        if (typeof effects[name] === "number") changeVital(name, effects[name]);
    }
    for (const id of effects.setAchievements ?? []) if (setAchievement(id)) news.achievements.push(id);
    for (const id of effects.clearAchievements ?? []) setAchievement(id, false);
    for (const item of effects.addItems ?? []) if (!hasItem(item)) state.inventory.push(item);
    for (const c of effects.addConditions ?? []) if (!state.activeConditions.includes(c)) state.activeConditions.push(c);
    if (effects.removeConditions) state.activeConditions = state.activeConditions.filter((c) => !effects.removeConditions.includes(c));
    if (effects.setYield != null) state.yieldLevel = String(effects.setYield);
    if (typeof effects.setEpisode === "number") state.episode = effects.setEpisode;
    // "addStats": { "strength": 5 } raises stats by that much (growth between episodes).
    for (const [stat, n] of Object.entries(effects.addStats ?? {})) state.stats[stat] = (state.stats[stat] ?? 0) + n;
    if (effects.addStats) restoreVitals();
    news.codex = addCodex(effects.addCodex ?? []);
    return news;
}

function advanceStory() { state.storyProgressed += 1; }
function addPlaytime(ms) { state.playtimeMs += ms; }

function newGame() { state = freshState(); }

// Loads a saved state, filling in anything an older save didn't have.
function replaceState(saved) {
    const base = freshState();
    const merged = {
        ...base,
        ...saved,
        stats: { ...base.stats, ...(saved.stats ?? {}) },
        vitals: { ...base.vitals, ...(saved.vitals ?? {}) },
        // Older saves called achievements "flags"; carry them over.
        achievements: { ...(saved.flags ?? {}), ...(saved.achievements ?? {}) },
        achievementsUnread: saved.achievementsUnread ?? saved.flagsUnread,
        version: STATE_VERSION,
    };
    delete merged.flags;
    delete merged.flagsUnread;
    // Version 1 saves kept aether inside stats and had no vitals.
    if (saved.stats && "currentAether" in saved.stats) {
        delete merged.stats.currentAether;
        if (saved.stats.currentAether != null) merged.vitals.aether = saved.stats.currentAether;
    }
    if (saved.currentLocation && !saved.location) merged.location = saved.currentLocation;
    delete merged.currentLocation;
    delete merged.day;
    delete merged.time;
    if (!Array.isArray(merged.objectiveLog)) {
        merged.objectiveLog = merged.objective ? [{ text: merged.objective, episode: merged.episode ?? 1, done: false }] : [];
    }
    for (const key of ["visited", "codex", "codexUnread", "achievementsUnread", "inventory", "activeConditions"]) {
        if (!Array.isArray(merged[key])) merged[key] = [];
    }
    state = merged;
    for (const name of ["health", "stamina", "aether", "composure"]) {
        setVital(name, state.vitals[name] ?? vitalMax(name));
    }
}

LOU.state = { STATE_VERSION, getState, getAttributes, getVitals, vitalMax, hasAchievement, hasItem, setVital, changeVital, restoreVitals, setAchievement, markAchievementsRead, markObjectivesRead, addCodex, markCodexRead, setScene, applyEffects, advanceStory, addPlaytime, newGame, replaceState };
})();
