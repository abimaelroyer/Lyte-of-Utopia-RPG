// Checks the game data for mistakes every time the game starts: choices that
// point to scenes that don't exist, unknown enemies, moves or journal
// entries, scenes with no way out, missing sprite images.
//
// Problems are listed in the browser console (F12 > Console) and a red
// notice appears in the corner, so a typo in the story shows up the moment
// you open the game instead of when a tester clicks the broken choice.

(() => {
"use strict";

const { DATA } = LOU.data;

function checkData() {
    const problems = [];
    const { story = {}, enemies = {}, moves = {}, codex = {}, locations = {}, sprites = {}, player = {}, game = {} } = DATA;

    if (!story[game.startScene]) problems.push(`game.js: startScene "${game.startScene}" doesn't exist`);

    // Tutorial steps are ["Heading", "Text"] or ["Text"]. A missing comma
    // between two steps silently turns one of them into undefined.
    (DATA.combatText?.tutorial?.steps ?? []).forEach((step, i) => {
        const ok = Array.isArray(step) && (step.length === 1 || step.length === 2) && step.every((x) => typeof x === "string");
        if (!ok) problems.push(`combat-text.js: tutorial step ${i + 1} should be ["Heading", "Text"] or ["Text"] (missing comma before it?)`);
    });

    for (const [id, scene] of Object.entries(story)) {
        if (scene.location && !locations[scene.location]) problems.push(`${id}: unknown location "${scene.location}"`);
        (scene.choices ?? []).forEach((c, i) => {
            if (c.goto?.startsWith("__")) return;
            if (!story[c.goto]) problems.push(`${id}: choice ${i + 1} ("${c.text}") goes to missing scene "${c.goto}"`);
        });
        for (const block of [scene.onEnter, ...(scene.choices ?? []).map((c) => c.effects)]) {
            for (const cid of block?.addCodex ?? []) if (!codex[cid]) problems.push(`${id}: unknown journal entry "${cid}"`);
            // Achievements used to be called flags. The old names now do nothing.
            for (const key of ["setFlags", "clearFlags"]) {
                if (block?.[key]) problems.push(`${id}: "${key}" was renamed to "${key.replace("Flags", "Achievements")}"`);
            }
        }
        (scene.choices ?? []).forEach((c, i) => {
            if (c.requires?.flags) problems.push(`${id}: choice ${i + 1} uses "requires.flags", which was renamed to "requires.achievements"`);
        });
        if (scene.encounter) {
            const e = typeof scene.encounter === "string" ? { enemy: scene.encounter } : scene.encounter;
            if (!enemies[e.enemy]) problems.push(`${id}: unknown enemy "${e.enemy}"`);
            for (const k of ["win", "lose", "flee"]) {
                if (e[k] && !story[e[k]]) problems.push(`${id}: fight's "${k}" scene "${e[k]}" doesn't exist`);
            }
            if (!e.win || !e.lose) problems.push(`${id}: a fight needs both "win" and "lose" scenes`);
        }
        if (!scene.encounter && !scene.ending && !(scene.choices ?? []).length) {
            problems.push(`${id}: dead end (no choices, and not marked "ending": true)`);
        }
    }

    for (const [fid, f] of Object.entries({ player, ...enemies })) {
        for (const mid of f.moveIds ?? []) if (!moves[mid]) problems.push(`${fid}: unknown move "${mid}"`);
        const sprite = f.sprite ?? fid;
        if (!sprites[sprite]) problems.push(`${fid}: no sprites for "${sprite}"`);
    }
    return problems;
}

// Image files can only be checked by trying to load them.
function checkSpriteFiles(report) {
    for (const [cid, clips] of Object.entries(DATA.sprites ?? {})) {
        for (const [clip, c] of Object.entries(clips)) {
            const img = new Image();
            img.onerror = () => report(`sprite ${cid}/${clip}: can't load ${c.src}`);
            img.src = c.src;
        }
    }
}

function runChecks(onProblem) {
    const report = (msg) => { console.warn(`[data check] ${msg}`); onProblem?.(msg); };
    checkData().forEach(report);
    checkSpriteFiles(report);
}

LOU.check = { checkData, runChecks };
})();
