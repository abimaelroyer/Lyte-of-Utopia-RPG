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

//file getters: read

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

//file getters: write

function setFlag (flagName, value = true){
    gameState.Flags[flagName] = value;
}

function modifyStat(statName, amount){
    if (gameState.stats[statName] === undefined) return;
    gameState.stats[statJake] += amount;
}

function modifyAether(amount) {
    gameState.aether = Math.max(0, Math.min(gameState.maxAether, gameState.aether + amount));
}

function addCondition(conditionId) {
    if (!gameState.activeConditions.includes(conditionId)) {
        gameState.activeConditions.push(conditionId);
    }
}

function removeCondition(conditionId) {
    gameState.activeConditions = gameState.activeConditions.filter(c => c !== conditionId);
}

function addItem(itemId) {
    gameState.inventory.push(itemId);
}

function removeItem(itemId) {
    const index = gameState.inventory.indexOf(itemId);
    if (index !== -1) gameState.inventory.splice(index, 1);
}

function advanceStory(newProgress = null) {
    if (newProgress !== null) {
        gameState.storyProgressed = newProgress;
    } else {
        gameState.storyProgressed += 1;
    }
}

function setScene(sceneId) {
    gameState.currentScene = sceneId;
}

function setLocation(locationId) {
    gameState.currentLocation = locationId;
}

// save and load functions

const savePrefix = "lyteOfUtopia_save_";
const saveSlotCount = 10;

function saveGame(slot) {
    try {
        const saveData = {
            state: gameState,
            timestamp: Date.now(),
            chapter: gameState.chapter,
            location: gameState.currentLocation
        };
        localStorage.setItem(savePrefix + slot, JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error("Save failed:", error);
        return false;
    }
}

function loadGame(slot) {
    try {
        const saved = localStorage.getItem(savePrefix + slot);
        if (!saved) return false;

        const parsed = JSON.parse(saved);
        gameState = { ...structuredClone(defaultState), ...parsed.state };
        return true;
    } catch (error) {
        console.error("Load failed:", error);
        return false;
    }
}

function deleteSave(slot) {
    localStorage.removeItem(savePrefix + slot);
}

function getSaveInfo(slot) {
    const saved = localStorage.getItem(savePrefix + slot);
    if (!saved) return null;

    try {
        const parsed = JSON.parse(saved);
        return {
            timestamp: parsed.timestamp,
            chapter: parsed.chapter,
            location: parsed.location
        };
    } catch {
        return null;
    }
}

function getAllSaves() {
    const saves = [{ slot: "auto", info: getSaveInfo("auto") }];

    for (let i = 1; i <= saveSlotCount; i++) {
        saves.push({ slot: i, info: getSaveInfo(i) });
    }

    return saves;
}

function autoSave() {
    return saveGame("auto");
}

function newGame() {
    gameState = structuredClone(defaultState);
}

// exports

export {
    getState,
    getStat,
    hasFlag,
    hasCondition,
    hasItem,
    setFlag,
    modifyStat,
    modifyAether,
    addCondition,
    removeCondition,
    addItem,
    removeItem,
    advanceStory,
    setScene,
    setLocation,
    saveGame,
    loadGame,
    deleteSave,
    getSaveInfo,
    getAllSaves,
    autoSave,
    newGame
};