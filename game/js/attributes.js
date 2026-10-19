// Derives combat attributes from the nine raw stats.
//
// Formulas follow the author's Combat Design Record, v0.11 (unchanged from
// v0.10): HP, Aether, stamina and both potencies scale from a baseline of 1
// in each stat. Constitution, Focus and speed formulas carry over from v0.9.
// If the record changes, this is the only file that needs to follow it.

(() => {
"use strict";

function deriveAttributes(stats) {
    const {
        flow, flux, control, strength,
        constitution, vitality, movementSpeed, agility, endurance,
    } = stats;

    return {
        maxHealth: 100 + 25 * (vitality - 1),
        maxAether: 100 + 10 * (flow - 1),
        maxStamina: 100 + 5 * (endurance - 1),

        meleePotency: 10 + 5 * (strength - 1),
        aetherPotency: 10 + 5 * (control - 1),

        physicalDefense: 2 * constitution,
        aetherDefense: constitution,

        maxFocus: 3 + Math.floor(flux / 8),
        startingFocus: 1 + Math.floor(flux / 16),
        activeFocusGainPerCharge: 1 + flux / 16,

        // Startup is divided by these; recovery is reduced by recoveryReduction.
        physicalSpeed: 1 + agility / 100,
        aetherSpeed: 1 + control / 100,
        recoveryReduction: Math.min(0.25, movementSpeed / 400),
    };
}

LOU.attributes = { deriveAttributes };
})();
