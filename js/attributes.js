// derives combat attributes from raw stats.

function deriveAttributes(stats) {
    const {
        flow, flux, control, strength,
        constitution, vitality, movementSpeed, endurance
    } = stats;
    const agility = stats.agility;

    return {
        maxAether: 40 + 8 * flow,
        maxHealth: 100 + 12 * vitality,
        maxStamina: 40 + 6 * endurance,

        maxFocus: 3 + Math.floor(flux / 8),
        startingFocus: 1 + Math.floor(flux / 16),
        activeFocusGainPerCharge: 1 + flux / 16,
        passiveFocusPerTick: flux / 800,

        focusRetention: control / (control + 40),
        artFocusCost: (baseCost) =>
            baseCost > 0 ? Math.max(1, Math.ceil(baseCost / (1 + control / 100))) : 0,

        physicalDefense: 2 * constitution,
        aetherDefense: constitution,

        meleePotency: 10 + 2 * strength,
        physicalAttackSpeed: 1 + agility / 100,

        movementSpeedDisplay: 1 + movementSpeed / 100,
        recoveryReduction: Math.min(0.20, movementSpeed / 400),
    };
}

export { deriveAttributes };