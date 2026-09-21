// combat.js — round-based combat resolution.
//
// Sequential rounds, not simultaneous ticks (confirmed: fine against an AI
// opponent). Startup/recovery/damage math follows the Combat Design Record,
// Section 5, applied once per round rather than on a shared per-tick clock.
//
// Data sources this reads, never mutates:
//   data/moves.json    — by move id (e.g. "haru_espada")
//   data/forms.json    — by form id (e.g. "spirit_resonance")
//   data/enemies.json  — by enemy key (e.g. "felix")
// Player stats come from state.js via getAttributes()/getState(), not
// duplicated here.

import { getState, getAttributes, getCurrentAether, modifyAether, modifyStat } from "./state.js";
import { deriveAttributes } from "./attributes.js";

let movesData = {};
let formsData = {};
let enemiesData = {};

async function loadCombatData() {
    try {
        const [movesRes, formsRes, enemiesRes] = await Promise.all([
            fetch("data/moves.json"),
            fetch("data/forms.json"),
            fetch("data/enemies.json"),
        ]);
        if (!movesRes.ok) throw new Error("moves.json not found");
        if (!formsRes.ok) throw new Error("forms.json not found");
        if (!enemiesRes.ok) throw new Error("enemies.json not found");

        movesData = await movesRes.json();
        formsData = await formsRes.json();
        enemiesData = await enemiesRes.json();
        return true;
    } catch (error) {
        console.error("Failed to load combat data:", error);
        return false;
    }
}

// ---------------------------------------------------------------------
// Fighter construction
// ---------------------------------------------------------------------

// A "fighter" is the in-fight runtime object combat.js actually works
// with — current resources plus a reference to its move list. Built
// fresh at the start of every encounter; nothing here is persisted
// except through explicit calls back into state.js for the player.

function buildPlayerFighter() {
    const stats = getState().stats;
    const attrs = getAttributes();

    return {
        side: "player",
        name: "Akira",
        stats,
        attrs,
        health: attrs.maxHealth,
        aether: getCurrentAether(), // persisted from prior scenes, not always-full
        stamina: attrs.maxStamina,
        focus: attrs.startingFocus,
        moveIds: ["akira_strike", "akira_guard", "akira_evade", "akira_charge", "akira_breath"],
        activeForm: null,
        committed: null, // { moveId, ticksRemaining, phase: "startup"|"recovery" }
    };
}

function buildEnemyFighter(enemyKey) {
    const data = enemiesData[enemyKey];
    if (!data) {
        console.error(`Unknown enemy: ${enemyKey}`);
        return null;
    }

    const attrs = deriveAttributesForStats(data.stats);

    return {
        side: "enemy",
        name: data.name,
        stats: data.stats,
        attrs,
        health: attrs.maxHealth,
        aether: attrs.maxAether,
        stamina: attrs.maxStamina,
        focus: attrs.startingFocus,
        moveIds: data.moveIds,
        activeForm: null,
        committed: null,
    };
}

// enemies.json's stats object already uses the same nine named keys
// attributes.js expects, so this is a direct pass-through — enemy and
// player attributes are guaranteed to come from the same formula.
function deriveAttributesForStats(statsObj) {
    return deriveAttributes(statsObj);
}

// ---------------------------------------------------------------------
// Move resolution
// ---------------------------------------------------------------------

function getMove(moveId) {
    const move = movesData[moveId];
    if (!move) console.error(`Unknown move: ${moveId}`);
    return move;
}

function canAfford(fighter, move) {
    if (move.enabled === false) return false;
    if ((move.focusCost || 0) > fighter.focus) return false;
    if ((move.aetherCost || 0) > fighter.aether) return false;
    if ((move.staminaCost || 0) > fighter.stamina) return false;
    return true;
}

function payCosts(fighter, move) {
    fighter.focus -= move.focusCost || 0;
    fighter.aether -= move.aetherCost || 0;
    fighter.stamina -= move.staminaCost || 0;
}

// Startup/recovery adjusted for form speed multipliers, per Section 5,
// rule 3. Physical moves use the form's physical speed multiplier;
// aether moves use its aether speed multiplier. No movement-speed-based
// recovery reduction yet — that requires the world-position system this
// game doesn't have, so it's omitted rather than faked.
function computeTiming(fighter, move) {
    const form = fighter.activeForm ? formsData[fighter.activeForm] : null;
    const isPhysical = move.kind === "attack" || move.kind === "physical";

    let speedMult = 1;
    if (form) {
        speedMult = isPhysical
            ? form.physicalSpeedMultiplier
            : form.aetherSpeedMultiplier;
    }

    return {
        startup: Math.max(1, Math.ceil(move.startup / speedMult)),
        recovery: Math.max(1, Math.ceil(move.recovery / speedMult)),
    };
}

// Damage formula, Section 5 rule 6, verbatim:
//   damage = max(1, round(raw * 100 / (100 + defense) * guardFactor))
function computeDamage(attacker, defender, move) {
    const form = attacker.activeForm ? formsData[attacker.activeForm] : null;
    const isPhysical = move.kind === "attack";

    let raw;
    if (isPhysical) {
        const atkMult = form ? form.physicalAtkMultiplier : 1;
        raw = attacker.attrs.meleePotency * (move.physicalScale ?? move.potencyMultiplier ?? 1) * atkMult;
    } else {
        const atkMult = form ? form.aetherAtkMultiplier : 1;
        raw = (move.potency || 0) * atkMult;
    }

    const defense = isPhysical ? defender.attrs.physicalDefense : defender.attrs.aetherDefense;

    // Guard factor comes from the defending fighter's own Guard move
    // entry (moves.json), not a hardcoded constant — this was fixed
    // after an earlier draft hardcoded 0.6 directly here instead of
    // reading it from data. If the fighter isn't guarding, no reduction.
    let guardFactor = 1;
    if (defender.committed?.guarding) {
        const guardMoveId = defender.moveIds.find((id) => movesData[id]?.kind === "guard");
        const guardMove = guardMoveId ? movesData[guardMoveId] : null;
        guardFactor = guardMove ? 1 - guardMove.damageReduction : 1;
    }

    return Math.max(1, Math.round((raw * 100) / (100 + defense) * guardFactor));
}

// ---------------------------------------------------------------------
// Enemy move selection — PLACEHOLDER
// ---------------------------------------------------------------------
// No character-specific AI behavior is specified anywhere in the source
// material for Haru, Felix, or the Wolf (Section 6's cycle logic was
// written for Rikito, who isn't in this cast). This is a deliberately
// simple stand-in: pick a random affordable attack; fall back to
// recovery/charge if nothing else is affordable. Replace per-character
// once real behavior is decided — do not treat this as final.
function chooseEnemyMove(fighter) {
    const available = fighter.moveIds
        .map(getMove)
        .filter((m) => m && canAfford(fighter, m));

    const attacks = available.filter((m) => m.kind === "attack");
    if (attacks.length > 0) {
        return attacks[Math.floor(Math.random() * attacks.length)];
    }

    const recover = available.find((m) => m.kind === "recover");
    if (recover) return recover;

    const charge = available.find((m) => m.kind === "charge");
    if (charge) return charge;

    // Nothing affordable at all — guard if possible, else pass.
    const guard = available.find((m) => m.kind === "guard");
    return guard || null;
}

// ---------------------------------------------------------------------
// Round resolution
// ---------------------------------------------------------------------

function resolveRound(player, enemy, playerMoveId) {
    const playerMove = getMove(playerMoveId);
    const enemyMove = chooseEnemyMove(enemy);

    const log = [];

    if (!playerMove || !canAfford(player, playerMove)) {
        log.push("That move isn't available right now.");
        return { log, ended: false };
    }

    payCosts(player, playerMove);
    if (enemyMove) payCosts(enemy, enemyMove);

    player.committed = { guarding: playerMove.kind === "guard" };
    enemy.committed = { guarding: enemyMove?.kind === "guard" };

    log.push(`${enemy.name} ${enemyMove ? enemyMove.telegraph || "moves to act" : "hesitates"}.`);

    // Player acts first if their startup is shorter or equal; otherwise
    // the enemy's effect resolves first. This approximates initiative
    // without a shared tick clock.
    const playerTiming = computeTiming(player, playerMove);
    const enemyTiming = enemyMove ? computeTiming(enemy, enemyMove) : null;

    const order = enemyTiming && enemyTiming.startup < playerTiming.startup
        ? ["enemy", "player"]
        : ["player", "enemy"];

    // No evade-chance stat exists anywhere in the source data (design
    // record or builds file) — Sidestep/Backstep are player-selected
    // moves, not a passive dodge roll, so evasion only applies when the
    // "evade" kind is the move actually chosen. That's not implemented
    // yet (neither fighter can currently pick evade as a real action
    // with an effect); this only handles guard-vs-attack for now.
    for (const actor of order) {
        if (actor === "player" && playerMove.kind === "attack") {
            const dmg = computeDamage(player, enemy, playerMove);
            enemy.health -= dmg;
            log.push(
                enemy.committed?.guarding
                    ? `Your strike lands through their guard for ${dmg}.`
                    : `You land ${playerMove.name} for ${dmg} damage.`
            );
        }

        if (actor === "enemy" && enemyMove?.kind === "attack") {
            const dmg = computeDamage(enemy, player, enemyMove);
            player.health -= dmg;
            log.push(
                player.committed?.guarding
                    ? `${enemy.name}'s attack breaks through your guard for ${dmg}.`
                    : `${enemy.name} hits you for ${dmg} damage.`
            );
        }
    }

    if (playerMove.kind === "recover") {
        player.stamina = Math.min(player.attrs.maxStamina, player.stamina + (playerMove.restoreStamina || 0));
        log.push("You catch your breath.");
    }
    if (playerMove.kind === "charge" && playerMove.enabled !== false) {
        player.focus = Math.min(player.attrs.maxFocus, player.focus + player.attrs.activeFocusGainPerCharge);
        log.push("Focus builds.");
    }

    applyFormUpkeep(player, log, "You");
    applyFormUpkeep(enemy, log, enemy.name);

    player.committed = null;
    enemy.committed = null;

    const ended = player.health <= 0 || enemy.health <= 0;
    return { log, ended, playerWon: enemy.health <= 0 && player.health > 0 };
}

function applyFormUpkeep(fighter, log, label) {
    if (!fighter.activeForm) return;
    const form = formsData[fighter.activeForm];

    fighter.aether -= form.aetherUpkeepPerTick;
    if (form.healthRegenPerTick) {
        fighter.health = Math.min(fighter.attrs.maxHealth, fighter.health + form.healthRegenPerTick);
    }

    if (fighter.aether <= 0) {
        fighter.aether = 0;
        fighter.activeForm = null;
        log.push(`${label} can no longer sustain the form. It fades.`);
    }
}

// ---------------------------------------------------------------------
// Public encounter API
// ---------------------------------------------------------------------

let activeEncounter = null;

function startEncounter(enemyKey) {
    const enemy = buildEnemyFighter(enemyKey);
    if (!enemy) return null;

    activeEncounter = {
        player: buildPlayerFighter(),
        enemy,
    };
    return activeEncounter;
}

function submitPlayerMove(moveId) {
    if (!activeEncounter) {
        console.error("No active encounter.");
        return null;
    }
    const { player, enemy } = activeEncounter;

    const move = getMove(moveId);
    if (!move || !canAfford(player, move)) {
        return { log: ["That move isn't available right now."], ended: false };
    }

    const result = resolveRound(player, enemy, moveId);

    if (result.ended) {
        // Sync the player's final aether back to persistent state --
        // without this, the next scene (combat or story) would see
        // whatever aether existed before this fight started, not what
        // was actually spent during it.
        modifyAether(player.aether - getCurrentAether());
        activeEncounter = null;
    }
    return result;
}

// Lets the UI grey out unaffordable/disabled moves before the player
// even tries to pick one — same locked-choice pattern used elsewhere
// in the engine for story choices with unmet requirements.
function getAvailablePlayerMoves() {
    if (!activeEncounter) return [];
    return activeEncounter.player.moveIds.map((id) => {
        const move = getMove(id);
        return {
            id,
            move,
            available: move ? canAfford(activeEncounter.player, move) : false,
        };
    });
}

function getActiveEncounter() {
    return activeEncounter;
}

export {
    loadCombatData,
    startEncounter,
    submitPlayerMove,
    getActiveEncounter,
    getAvailablePlayerMoves,
};