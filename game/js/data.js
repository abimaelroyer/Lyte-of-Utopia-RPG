// Holds every piece of game data (story, enemies, moves, text...).
//
// Each file in data/ is a small script that adds one entry to LOU_DATA, e.g.
// data/game.js sets LOU_DATA.game. index.html loads them before the game
// code, so by the time the game starts everything is already here. That's
// why the game runs from a plain double-click: no server, no fetch().
//
// To add a new data file: create data/<name>.js starting with
// "LOU_DATA.<name> = ", then add a <script> line for it in index.html.

(() => {
"use strict";

const DATA = window.LOU_DATA;

async function loadData() {
    const missing = ["game", "story", "player", "enemies", "moves", "sprites", "combatText", "locations", "flags"]
        .filter((key) => !DATA[key]);
    if (missing.length) throw new Error(`Missing data: ${missing.join(", ")}. Check the <script> tags in index.html.`);
    return DATA;
}

LOU.data = { DATA, loadData };
})();
