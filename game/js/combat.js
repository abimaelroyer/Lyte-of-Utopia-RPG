// Combat rules. No DOM in here: this file takes choices in and hands back a
// list of events describing what happened, which narration.js turns into
// prose and combat-ui.js animates. That split keeps the maths testable.
//
// How a round works
//   1. At the start of the round the enemy decides what it will do. The
//      player is shown a description of the tell (never the move's name).
//   2. The player picks a response.
//   3. Both commit at the same instant and pay their costs.
//   4. Guard and sidestep are up immediately: guard for `duration` ticks,
//      sidestep for `duration` ticks and only against one attack.
//   5. Every other action lands after its effective startup. Earlier actions
//      land first, so a knockout stops the slower action. Actions landing on
//      the same tick both go through (a trade, possibly a double knockout).
//
// Numbers follow the Combat Design Record v0.11: pools and potencies from
// attributes.js, mixed physical/aetherical damage mitigated separately by
// 100 / (100 + defence after pierce), guard blocks, 100% evasion except
// 65% damage from area attacks, startup sped up by Agility/Control.

(() => {
"use strict";

const { deriveAttributes } = LOU.attributes;
const { DATA } = LOU.data;
const AREA_EVADE_DAMAGE = 0.65;

// Openings. Not part of the v0.11 record; added so careful play can beat
// opponents who outclass you. Whoever has an attack cleanly sidestepped is
// off balance for the next round: they can't guard or sidestep, everything
// they do comes out OFF_BALANCE_DELAY ticks later, and hits against them
// deal OPENING_BONUS times damage. A hit on them before their own action
// lands knocks that action away.
const OFF_BALANCE_DELAY = 3;
const OPENING_BONUS = 1.5;
const FLEE_MOVE = {
    id: "flee", name: "Run for it", kind: "flee", startup: 6, recovery: 0,
    staminaCost: 0, aetherCost: 0, focusCost: 0, physicalTiming: 1, aetherTiming: 0,
};

// ---- helpers -----------------------------------------------------------------

const ceilTenth = (n) => Math.ceil(n * 10 - 1e-9) / 10;

function moveById(id) {
    if (id === "flee") return FLEE_MOVE;
    const m = DATA.moves?.[id];
    return m ? { ...m, id } : null;
}

function makeFighter(def, side, vitals = null) {
    const attrs = deriveAttributes(def.stats);
    const moves = (def.moveIds ?? [])
        .map(moveById)
        .filter((m) => m && m.enabled !== false);
    const f = {
        side,
        id: def.id,
        name: def.name,
        shortName: def.shortName ?? def.name,
        pronouns: def.pronouns ?? "they",
        sprite: def.sprite ?? def.id,
        stats: { ...def.stats },
        attrs,
        maxHp: attrs.maxHealth,
        maxStamina: attrs.maxStamina,
        maxAether: attrs.maxAether,
        maxFocus: attrs.maxFocus,
        hp: vitals?.health ?? attrs.maxHealth,
        stamina: vitals?.stamina ?? attrs.maxStamina,
        aether: vitals?.aether ?? attrs.maxAether,
        focus: attrs.startingFocus,
        moves,
        uses: {},
        lastKind: null,
        offBalance: false,
        condition: def.condition ?? null,
        staminaCondition: def.staminaCondition ?? null,
        ai: def.ai ?? null,
    };
    for (const m of moves) if (m.limited) f.uses[m.id] = maxUses(f, m);
    return f;
}

function maxUses(f, move) {
    if (!move.limited) return Infinity;
    const investment =
        (move.useFlow ?? 0) * Math.max(0, f.stats.flow - 1) +
        (move.useEndurance ?? 0) * Math.max(0, f.stats.endurance - 1);
    const growth = move.useGrowth || 1;
    return Math.min(move.useCap ?? Infinity, (move.baseUses ?? 0) + Math.floor(investment / growth));
}

function focusCost(f, move) {
    const raw = move.focusCost ?? 0;
    if (raw <= 0) return 0;
    return Math.max(1, Math.ceil(raw / (1 + f.stats.control / 100)));
}

function effectiveStartup(f, move) {
    if (!move.startup) return 0;
    const pt = move.physicalTiming ?? 0;
    const at = move.aetherTiming ?? 0;
    const w = pt + at;
    const speed = w === 0 ? 1 : (pt * f.attrs.physicalSpeed + at * f.attrs.aetherSpeed) / w;
    return Math.max(0.1, ceilTenth(move.startup / speed));
}

function effectiveRecovery(f, move) {
    if (!move.recovery) return 0;
    return Math.max(3, ceilTenth(move.recovery * (1 - f.attrs.recoveryReduction)));
}

// Why a move can't be used right now, or null if it can.
function blockedReason(f, move) {
    if (f.offBalance && (move.kind === "guard" || move.kind === "evade")) return "Off balance";
    if (move.kind === "flee") return null;
    if ((move.staminaCost ?? 0) > f.stamina) return "Too winded";
    if ((move.aetherCost ?? 0) > f.aether) return "Not enough aether";
    if (focusCost(f, move) > f.focus) return "Not enough focus";
    if (move.limited && (f.uses[move.id] ?? 0) <= 0) return "No uses left";
    if (move.kind === "charge" && f.focus >= f.maxFocus) return "Focus is full";
    if (move.kind === "charge" && f.aether <= 0) return "No aether to draw on";
    return null;
}

// Raw → mitigated damage for one attack against one target, before guard/evade.
function damageComponents(attacker, target, move) {
    const physRaw = (move.physicalFlat ?? 0) + (move.physicalScale ?? 0) * attacker.attrs.meleePotency;
    const aethRaw = (move.aetherFlat ?? 0) + (move.aetherScale ?? 0) * attacker.attrs.aetherPotency;
    const physDef = target.attrs.physicalDefense * (1 - (move.physicalPierce ?? 0) / 100);
    const aethDef = target.attrs.aetherDefense * (1 - (move.aetherPierce ?? 0) / 100);
    return {
        physical: physRaw > 0 ? (physRaw * 100) / (100 + physDef) : 0,
        aether: aethRaw > 0 ? (aethRaw * 100) / (100 + aethDef) : 0,
    };
}

// ---- encounter setup -----------------------------------------------------------

// modifiers tune one specific fight without touching the v0.11 base numbers:
//   enemyHealth  multiplies the opponent's max health
//   enemyDamage  multiplies damage the opponent deals
//   playerDamage multiplies damage Akira deals
function createEncounter({ enemyId, playerDef, playerVitals, canFlee = false, modifiers = {}, rng = Math.random }) {
    const enemyDef = { id: enemyId, ...DATA.enemies[enemyId] };
    if (!DATA.enemies[enemyId]) throw new Error(`Unknown enemy: ${enemyId}`);
    const enc = {
        round: 0,
        rng,
        canFlee,
        player: makeFighter({ id: "akira", ...playerDef }, "player", playerVitals),
        enemy: makeFighter(enemyDef, "enemy"),
        plan: null,
        over: false,
        outcome: null, // "win" | "loss" | "draw" | "fled"
        history: [],
        mods: { enemyHealth: 1, enemyDamage: 1, playerDamage: 1, ...modifiers },
    };
    enc.enemy.maxHp = Math.max(1, Math.round(enc.enemy.maxHp * enc.mods.enemyHealth));
    enc.enemy.hp = enc.enemy.maxHp;
    startRound(enc);
    return enc;
}

function startRound(enc) {
    enc.round += 1;
    enc.plan = planEnemyMove(enc);
}

// ---- enemy decision-making -----------------------------------------------------

function weightedPick(entries, rng) {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    if (total <= 0) return entries[0]?.[0] ?? null;
    let roll = rng() * total;
    for (const [item, w] of entries) {
        roll -= w;
        if (roll < 0) return item;
    }
    return entries[entries.length - 1][0];
}

function planEnemyMove(enc) {
    const e = enc.enemy;
    const ai = e.ai ?? {};
    const weights = ai.weights ?? {};
    const react = ai.react?.[enc.player.lastKind] ?? {};
    const lowStamina = e.stamina / e.maxStamina < (ai.recoverBelowStamina ?? 0.25);

    const options = [];
    for (const m of e.moves) {
        if (blockedReason(e, m)) continue;
        let w = weights[m.id] ?? 1;
        w *= react[m.id] ?? 1;
        if (m.kind === "recover") {
            if (e.stamina >= e.maxStamina) w = 0;
            else if (lowStamina) w = Math.max(w, 1) * 6;
        }
        if (w > 0) options.push([m, w]);
    }
    let move = weightedPick(options, enc.rng);
    if (!move) move = e.moves.find((m) => m.kind === "recover") ?? e.moves[0];

    return {
        move,
        startup: effectiveStartup(e, move) + (e.offBalance && move.startup ? OFF_BALANCE_DELAY : 0),
        tag: e.offBalance ? "offbalance" : intentTag(e, move),
    };
}

function intentTag(f, move) {
    switch (move.kind) {
        case "attack": return effectiveStartup(f, move) <= 6 ? "quick" : "slow";
        case "guard":
        case "evade": return "defensive";
        case "recover": return "recovering";
        case "charge": return "charging";
        default: return "unknown";
    }
}

// ---- what the player can do ----------------------------------------------------

function playerOptions(enc) {
    const p = enc.player;
    const list = p.moves.map((m) => ({
        move: m,
        blocked: blockedReason(p, m),
        startup: effectiveStartup(p, m),
        recovery: effectiveRecovery(p, m),
        focusCost: focusCost(p, m),
        usesLeft: m.limited ? p.uses[m.id] : null,
        preview: m.kind === "attack" ? Math.round(previewDamage(p, enc.enemy, m) * enc.mods.playerDamage * (enc.enemy.offBalance ? OPENING_BONUS : 1)) : null,
    }));
    if (enc.canFlee) {
        list.push({ move: FLEE_MOVE, blocked: null, startup: effectiveStartup(p, FLEE_MOVE), recovery: 0, focusCost: 0, usesLeft: null, preview: null });
    }
    return list;
}

function previewDamage(attacker, target, move) {
    const c = damageComponents(attacker, target, move);
    return Math.round(c.physical + c.aether);
}

// ---- resolving a round ---------------------------------------------------------

function payCosts(f, move) {
    f.stamina -= move.staminaCost ?? 0;
    f.aether -= move.aetherCost ?? 0;
    f.focus -= focusCost(f, move);
    if (move.limited) f.uses[move.id] -= 1;
}

function resolveRound(enc, playerMoveId) {
    if (enc.over) return [];
    const p = enc.player;
    const e = enc.enemy;
    const pMove = playerMoveId === "flee" ? FLEE_MOVE : p.moves.find((m) => m.id === playerMoveId);
    if (!pMove) throw new Error(`Akira doesn't know ${playerMoveId}`);
    if (blockedReason(p, pMove)) throw new Error(`Can't use ${playerMoveId}: ${blockedReason(p, pMove)}`);
    if (pMove.kind === "flee" && !enc.canFlee) throw new Error("Can't run from this fight");

    const eMove = enc.plan.move;
    const events = [];
    const actors = [
        { f: p, foe: e, move: pMove },
        { f: e, foe: p, move: eMove },
    ];

    // Commit: pay costs, raise defences.
    for (const a of actors) {
        payCosts(a.f, a.move);
        a.f.lastKind = a.move.kind;
        a.startup = effectiveStartup(a.f, a.move) + (a.f.offBalance && a.move.startup ? OFF_BALANCE_DELAY : 0);
        events.push({ type: "commit", side: a.f.side, moveId: a.move.id, kind: a.move.kind, startup: a.startup });
        if (a.move.kind === "guard" || a.move.kind === "evade") {
            a.f.defense = { kind: a.move.kind, move: a.move, end: a.move.duration ?? 12, used: false };
        } else {
            a.f.defense = null;
        }
    }

    // Everything that isn't a defence lands at its startup time.
    const pending = actors
        .filter((a) => a.move.kind !== "guard" && a.move.kind !== "evade")
        .sort((x, y) => x.startup - y.startup);

    let attacked = { player: false, enemy: false };
    let fled = false;
    let i = 0;
    while (i < pending.length && !fled) {
        const t = pending[i].startup;
        const group = [];
        while (i < pending.length && pending[i].startup === t) group.push(pending[i++]);
        const alive = group.filter((a) => a.f.hp > 0 && !a.interrupted);

        // Work out every hit in the group against the state before any of
        // them land, so simultaneous attacks genuinely trade.
        const hits = [];
        for (const a of alive) {
            if (a.move.kind === "attack") hits.push(resolveAttack(enc, a, t));
        }
        for (const h of hits) {
            h.target.hp = Math.max(0, h.target.hp - h.damage);
            attacked[h.target.side] = true;
            events.push({
                type: "attack", side: h.attacker.side, moveId: h.move.id, at: t,
                result: h.result, damage: h.damage, targetSide: h.target.side,
                severity: severity(h.damage, h.target.maxHp),
                targetHp: h.target.hp, ko: h.target.hp <= 0,
            });
            // Catching someone off balance knocks their pending action away.
            const victim = pending.find((x) => x.f === h.target && x.startup > t && !x.interrupted);
            if (victim && h.target.offBalance && h.damage > 0 && h.target.hp > 0) {
                victim.interrupted = true;
                events.push({ type: "interrupt", side: h.target.side, moveId: victim.move.id, at: t });
            }
        }
        for (const a of alive) {
            if (a.move.kind === "recover") events.push(applyRestore(a.f, a.move, t));
            if (a.move.kind === "charge") events.push(applyCharge(a.f, a.move, t));
            if (a.move.kind === "flee" && a.f.hp > 0) {
                events.push({ type: "flee", side: a.f.side, at: t });
                fled = true;
            }
        }
        if (p.hp <= 0 || e.hp <= 0) break;
    }

    // A cleanly sidestepped attacker is off balance next round.
    const whiffed = new Set(events.filter((e) => e.type === "attack" && e.result === "evaded").map((e) => e.side));
    for (const f of [p, e]) {
        f.offBalance = whiffed.has(f.side) && f.hp > 0;
        if (f.offBalance) events.push({ type: "offBalance", side: f.side });
    }

    // Defences that never had anything to stop.
    for (const a of actors) {
        if ((a.move.kind === "guard" || a.move.kind === "evade") && !attacked[a.f.side] && a.f.hp > 0) {
            events.push({ type: "idleDefense", side: a.f.side, kind: a.move.kind });
        }
    }

    // How did it end?
    if (p.hp <= 0 && e.hp <= 0) finish(enc, "draw", events);
    else if (p.hp <= 0) finish(enc, "loss", events);
    else if (e.hp <= 0) finish(enc, "win", events);
    else if (fled) finish(enc, "fled", events);

    enc.history.push({ round: enc.round, events });
    if (!enc.over) startRound(enc);
    return events;
}

function resolveAttack(enc, a, t) {
    const attacker = a.f;
    const target = a.foe;
    const move = a.move;
    const c = damageComponents(attacker, target, move);
    const mult = (attacker.side === "player" ? enc.mods.playerDamage : enc.mods.enemyDamage)
        * (target.offBalance ? OPENING_BONUS : 1);
    let phys = c.physical * mult;
    let aeth = c.aether * mult;
    let result = target.offBalance ? "opening" : "hit";
    const d = target.hp > 0 ? target.defense : null;

    if (d && d.kind === "evade" && !d.used) {
        if (t <= d.end) {
            d.used = true;
            if (move.area) {
                phys *= AREA_EVADE_DAMAGE;
                aeth *= AREA_EVADE_DAMAGE;
                result = "grazed";
            } else {
                const keep = 1 - (d.move.evade ?? 100) / 100;
                phys *= keep;
                aeth *= keep;
                result = keep <= 0 ? "evaded" : "grazed";
            }
        } else {
            result = "early";
        }
    } else if (d && d.kind === "guard" && t <= d.end) {
        phys *= 1 - (d.move.physicalBlock ?? 0) / 100;
        aeth *= 1 - (d.move.aetherBlock ?? 0) / 100;
        result = "guarded";
    }
    return { attacker, target, move, result, damage: Math.round(phys + aeth) };
}

function applyRestore(f, move, t) {
    const before = { hp: f.hp, stamina: f.stamina, aether: f.aether };
    f.hp = Math.min(f.maxHp, f.hp + (move.restoreHP ?? 0));
    f.stamina = Math.min(f.maxStamina, f.stamina + (move.restoreStamina ?? 0));
    f.aether = Math.min(f.maxAether, f.aether + (move.restoreAether ?? 0));
    return {
        type: "restore", side: f.side, moveId: move.id, at: t,
        hp: f.hp - before.hp, stamina: f.stamina - before.stamina, aether: f.aether - before.aether,
    };
}

function applyCharge(f, move, t) {
    const gain = Math.floor(f.attrs.activeFocusGainPerCharge * (move.chargeScale ?? 1));
    const before = f.focus;
    f.focus = Math.min(f.maxFocus, f.focus + gain);
    return { type: "charge", side: f.side, moveId: move.id, at: t, focus: f.focus - before };
}

function severity(damage, maxHp) {
    if (damage <= 0) return "none";
    const r = damage / maxHp;
    if (r < 0.05) return "graze";
    if (r < 0.15) return "light";
    if (r < 0.3) return "solid";
    if (r < 0.6) return "heavy";
    return "brutal";
}

function finish(enc, outcome, events) {
    enc.over = true;
    enc.outcome = outcome;
    events.push({ type: "end", outcome });
}

// Picks the descriptor whose threshold the ratio meets. Tables are
// [[threshold, text, tone?], ...] sorted high to low; the last entry is
// used at zero.
function describe(table, ratio) {
    if (!table?.length) return { text: "", tone: "" };
    for (const [threshold, text, tone] of table) {
        if (threshold === 0 ? ratio <= 0 : ratio >= threshold) return { text, tone: tone ?? "" };
    }
    const [, text, tone] = table[table.length - 2] ?? table[0];
    return { text, tone: tone ?? "" };
}

function enemyCondition(enc) {
    const e = enc.enemy;
    return {
        health: describe(e.condition, e.hp / e.maxHp).text,
        stamina: describe(e.staminaCondition, e.stamina / e.maxStamina).text,
    };
}

LOU.combat = { OPENING_BONUS, OFF_BALANCE_DELAY, FLEE_MOVE, createEncounter, resolveRound, playerOptions, enemyCondition, describe, effectiveStartup, effectiveRecovery, damageComponents, maxUses, focusCost, severity };
})();
