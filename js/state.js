// Manages all game data; player stats, active states, story progression, and save/load files

const defaultState = {
    // story progression tracker
    chapter: 1,
    storyProgressed: 0,
    currentScene: "ch1Opening",
    currentLocation: null,

    // core stats
    baseYield: 2000,
    stats: {
        //ask Dan abt hidden stats
        filler1: 0,
        filler2: 0,
        filler3: 0,
        filler4: 0,
        filler5: 0,
    },

    //Aether pool
    aether: 20,
    maxAether: 20,

    activeConditions: [],

    // World tracking
    flags: {},
    inventory: [],
    codex: []
};

// Live game state where everything is read and written
let gameState = structuredClone(defaultState);

//File getters

function getState(){
    return gameState;
}

function getStat(statName) {
    return gameState.stats[statName];
}

function hasFlag(flagName) {
    return gameState.flags[flagName] === true;
}

function hasCondition (conditionId) {
    return gameState.activeConditions.includes(conditionId);
}

function hasItem(itemId) {
    return gameState.inventory.includes(itemId);
}

