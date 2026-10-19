// Turns combat events into prose using data/combat-text.js.
//
// Placeholders: {A}/{a} the acting fighter, {T}/{t} the other fighter,
// {their}/{them}/{Their} pronouns for the actor. Capitalised forms start a
// sentence ("The wolf"), lowercase forms sit mid-sentence ("the wolf").

(() => {
"use strict";

const { DATA } = LOU.data;
const lastPicked = new Map();

function pick(list, key) {
    if (!Array.isArray(list) || !list.length) return null;
    if (list.length === 1) return list[0];
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (list[i] === lastPicked.get(key));
    lastPicked.set(key, list[i]);
    return list[i];
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const PRONOUNS = {
    he: { their: "his", them: "him", they: "he" },
    she: { their: "her", them: "her", they: "she" },
    it: { their: "its", them: "it", they: "it" },
    they: { their: "their", them: "them", they: "they" },
};

function fill(template, actor, other) {
    if (!template) return "";
    const pr = PRONOUNS[actor?.pronouns] ?? PRONOUNS.they;
    const an = actor?.shortName ?? "";
    const on = other?.shortName ?? "";
    return template
        .replaceAll("{A}", cap(an)).replaceAll("{a}", an)
        .replaceAll("{T}", cap(on)).replaceAll("{t}", on)
        .replaceAll("{Their}", cap(pr.their))
        .replaceAll("{their}", pr.their).replaceAll("{them}", pr.them).replaceAll("{they}", pr.they);
}

function text() { return DATA.combatText ?? {}; }

function openingLine(enc) {
    const t = text().start ?? {};
    return fill(pick(t[enc.enemy.id] ?? t._default, "start"), enc.player, enc.enemy);
}

function intentLine(enc) {
    const t = text().intent ?? {};
    const move = enc.plan.move;
    if (enc.enemy.offBalance) {
        const ob = t._offBalance?.[enc.enemy.id] ?? t._offBalance?._default;
        if (ob) return fill(pick(ob, "intent:ob"), enc.enemy, enc.player);
    }
    const list = t[move.id] ?? t._kind?.[move.kind] ?? t._kind?.none;
    return fill(pick(list, `intent:${move.id}`), enc.enemy, enc.player);
}

function intentTagLabel(tag) {
    return text().intentTag?.[tag] ?? tag;
}

// Returns [{ text, tone, side, event }] for one round's events.
function narrateRound(enc, events) {
    const t = text();
    const lines = [];
    const fighters = { player: enc.player, enemy: enc.enemy };
    const other = (side) => (side === "player" ? enc.enemy : enc.player);
    const push = (str, tone, side, event) => { if (str) lines.push({ text: str, tone, side, event }); };

    for (const ev of events) {
        const actor = fighters[ev.side];
        switch (ev.type) {
            case "commit": {
                if (ev.side !== "player") break;
                const list = t.commit?.[ev.moveId];
                if (list) push(fill(pick(list, `commit:${ev.moveId}`), actor, other(ev.side)), "muted", ev.side, ev);
                break;
            }
            case "attack": {
                const target = fighters[ev.targetSide];
                const result = ev.result === "early" ? "hit" : ev.result;
                if (ev.result === "early") {
                    push(fill(pick(t.earlyEvade, "early"), actor, target), "muted", ev.side, ev);
                }
                const pool = t.attack?.[ev.moveId]?.[result] ?? t.attack?._default?.[result];
                const tone = ev.damage > 0 ? (ev.targetSide === "player" ? "bad" : "good") : "muted";
                let line = fill(pick(pool, `atk:${ev.moveId}:${result}`), actor, target);
                if (ev.damage > 0 && !ev.ko) {
                    const sev = fill(pick(t.severity?.[ev.severity], `sev:${ev.severity}`), actor, target);
                    if (sev) line += " " + sev;
                }
                push(line, tone, ev.side, ev);
                break;
            }
            case "offBalance": {
                const pool = ev.side === "player" ? t.offBalance?.player : (t.offBalance?.enemy?.[enc.enemy.id] ?? t.offBalance?.enemy?._default);
                push(fill(pick(pool, `ob:${ev.side}`), actor, other(ev.side)), ev.side === "player" ? "bad" : "good", ev.side, ev);
                break;
            }
            case "interrupt":
                push(fill(pick(t.interrupt, "int"), actor, other(ev.side)), ev.side === "player" ? "bad" : "good", ev.side, ev);
                break;
            case "idleDefense":
                push(fill(pick(t.defendIdle?.[ev.kind], `idle:${ev.kind}`), actor, other(ev.side)), "muted", ev.side, ev);
                break;
            case "restore": {
                const pool = t.recover?.[ev.moveId] ?? t.recover?._default;
                push(fill(pick(pool, `rec:${ev.moveId}`), actor, other(ev.side)), "muted", ev.side, ev);
                break;
            }
            case "charge": {
                const pool = t.charge?.[ev.moveId] ?? t.charge?._default;
                push(fill(pick(pool, `chg:${ev.moveId}`), actor, other(ev.side)), "muted", ev.side, ev);
                break;
            }
            case "flee":
                push(fill(pick(t.flee?.success, "flee"), actor, other(ev.side)), "good", ev.side, ev);
                break;
            case "end": {
                if (ev.outcome === "loss") push(fill(pick(t.ko?.player, "ko:p"), enc.player, enc.enemy), "bad", "player", ev);
                if (ev.outcome === "win") {
                    const pool = t.ko?.enemy?.[enc.enemy.id] ?? t.ko?.enemy?._default;
                    push(fill(pick(pool, "ko:e"), enc.enemy, enc.player), "good", "enemy", ev);
                }
                if (ev.outcome === "draw") push(fill(pick(t.ko?.draw, "ko:d"), enc.player, enc.enemy), "bad", "player", ev);
                break;
            }
            default:
                break;
        }
    }
    return lines;
}

LOU.narration = { openingLine, intentLine, intentTagLabel, narrateRound, fill };
})();
