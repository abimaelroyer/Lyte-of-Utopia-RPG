// Save slots live in the browser's localStorage, which works even when the
// game is opened straight from a folder. Each record carries a small summary
// so the save screen can describe a slot without loading it.
//
// Players can also export a slot to a .json file and import it later, which
// is the only way to move a save to another browser or computer.

(() => {
"use strict";

const { getState, replaceState, STATE_VERSION } = LOU.state;
const { DATA } = LOU.data;
const PREFIX = "lou_save_v2_";
const OLD_PREFIX = "lyteOfUtopia_ep_save_";
const SLOT_COUNT = 6;
const SLOTS = ["auto", ...Array.from({ length: SLOT_COUNT }, (_, i) => String(i + 1))];

function storage() {
    try {
        const ls = window.localStorage;
        const probe = "__lou_probe__";
        ls.setItem(probe, "1");
        ls.removeItem(probe);
        return ls;
    } catch {
        return null;
    }
}

function storageAvailable() { return storage() !== null; }

function summarize(state) {
    const scene = DATA.story?.[state.currentScene];
    const loc = DATA.locations?.[state.location];
    const preview = (scene?.text ?? "")
        .replace(/[*#]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 110);
    return {
        episode: state.episode,
        location: loc?.name ?? "Unknown",
        objective: state.objective,
        playtimeMs: state.playtimeMs,
        preview,
    };
}

function writeRecord(slot, record) {
    const ls = storage();
    if (!ls) return false;
    try {
        ls.setItem(PREFIX + slot, JSON.stringify(record));
        return true;
    } catch (err) {
        console.error("Save failed:", err);
        return false;
    }
}

function save(slot) {
    const state = getState();
    return writeRecord(slot, {
        version: STATE_VERSION,
        gameVersion: DATA.game?.version,
        savedAt: Date.now(),
        state: structuredClone(state),
        summary: summarize(state),
    });
}

function autosave() { return save("auto"); }

function readRecord(slot) {
    const ls = storage();
    if (!ls) return null;
    try {
        const raw = ls.getItem(PREFIX + slot);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function load(slot) {
    const record = readRecord(slot);
    if (!record?.state) return false;
    return applyRecord(record);
}

function applyRecord(record) {
    const scene = record.state?.currentScene;
    if (!scene || !DATA.story?.[scene]) return false;
    replaceState(record.state);
    return true;
}

function remove(slot) {
    storage()?.removeItem(PREFIX + slot);
}

function list() {
    return SLOTS.map((slot) => ({ slot, record: readRecord(slot) }));
}

function hasAnySave() { return list().some((s) => s.record); }

function mostRecent() {
    let best = null;
    for (const s of list()) {
        if (s.record && (!best || s.record.savedAt > best.record.savedAt)) best = s;
    }
    return best;
}

// ---- export / import -------------------------------------------------------

function exportSlot(slot) {
    const record = readRecord(slot);
    if (!record) return false;
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date(record.savedAt).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `lyte-of-utopia-save-${slot}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}

// Reads a file chosen by the player. Resolves with the parsed record or throws.
async function readImportFile(file) {
    const text = await file.text();
    let record;
    try {
        record = JSON.parse(text);
    } catch {
        throw new Error("That file isn't a Lyte of Utopia save.");
    }
    if (!record?.state?.currentScene) throw new Error("That file isn't a Lyte of Utopia save.");
    if (!DATA.story?.[record.state.currentScene]) {
        throw new Error("That save is from a different version of the game and points to a scene that no longer exists.");
    }
    return record;
}

function importToSlot(slot, record) {
    return writeRecord(slot, { ...record, summary: record.summary ?? summarize(record.state) });
}

// ---- one-time migration from the old save format -----------------------------

function migrateOldSaves() {
    const ls = storage();
    if (!ls) return;
    const oldSlots = ["auto", ...Array.from({ length: 10 }, (_, i) => String(i + 1))];
    let next = 1;
    for (const old of oldSlots) {
        const raw = ls.getItem(OLD_PREFIX + old);
        if (!raw) continue;
        try {
            const parsed = JSON.parse(raw);
            if (!parsed?.state?.currentScene || !DATA.story?.[parsed.state.currentScene]) continue;
            let target = old === "auto" ? "auto" : null;
            if (!target) {
                while (next <= SLOT_COUNT && readRecord(String(next))) next++;
                if (next > SLOT_COUNT) continue;
                target = String(next++);
            }
            if (readRecord(target)) continue;
            const before = structuredClone(getState());
            replaceState(parsed.state);
            const migrated = structuredClone(getState());
            replaceState(before);
            writeRecord(target, {
                version: STATE_VERSION,
                gameVersion: "0.1",
                savedAt: parsed.timestamp ?? Date.now(),
                state: migrated,
                summary: summarize(migrated),
            });
            ls.removeItem(OLD_PREFIX + old);
        } catch {
            /* skip unreadable old saves */
        }
    }
}

function clearAll() {
    const ls = storage();
    if (!ls) return;
    for (const slot of SLOTS) ls.removeItem(PREFIX + slot);
}

LOU.saves = { SLOTS, storageAvailable, save, autosave, load, applyRecord, remove, list, readRecord, hasAnySave, mostRecent, exportSlot, readImportFile, importToSlot, migrateOldSaves, clearAll };
})();
