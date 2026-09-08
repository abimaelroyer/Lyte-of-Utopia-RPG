// game engine

import * as state from "./state.js";
import * as ui from "./ui.js";

let sceneData = {};
let currentScene = null;

// story data loader
async function loadChapter(chapterNumber) {
    try {
        const response = await fetch(`data/story/ch${chapterNumber}.json`);
        if (!response.ok) throw new Error(`Chapter ${chapterNumber} not found`);

        sceneData = await response.json();
        return true;
    } catch (error) {
        console.error("Failed to load chapter:", error);
        return false;
    }
}

// scene displayer
function showScene(sceneId) {
    const scene = sceneData[sceneId];

    if (!scene) {
        console.error(`Scene not found: ${sceneId}`);
        return;
    }

    currentScene = sceneId;
    state.setScene(sceneId);

    ui.renderText(scene.text);
    ui.renderStatus(state.getState());

    const choices = buildChoices(scene.choices || []);
    ui.renderChoices(choices, handleChoice);
}

// requirement evaluation functions
function buildChoices(rawChoices) {
    return rawChoices.map(choice => {
        const check = meetsRequirements(choice.requires);

        return {
            text: choice.text,
            locked: !check.passed,
            lockedReason: check.reason
        };
    });
}

function meetsRequirements(requires) {
    if (!requires) return { passed: true };

    const gameState = state.getState();

    if (requires.flags) {
        for (const flag of requires.flags) {
            if (!state.hasFlag(flag)) {
                return { passed: false, reason: "You haven't discovered this yet." };
            }
        }
    }

    if (requires.items) {
        for (const item of requires.items) {
            if (!state.hasItem(item)) {
                return { passed: false, reason: "You don't have what you need." };
            }
        }
    }

    if (requires.aether && gameState.aether < requires.aether) {
        return { passed: false, reason: `Requires ${requires.aether} aether.` };
    }

    if (requires.stats) {
        for (const [statName, minimum] of Object.entries(requires.stats)) {
            if (state.getStat(statName) < minimum) {
                return { passed: false, reason: `Requires ${statName} ${minimum}.` };
            }
        }
    }

    return { passed: true };
}

// choice handler
function handleChoice(index) {
    const scene = sceneData[currentScene];
    const choice = scene.choices[index];

    if (!choice) return;

    applyEffects(choice.effects);

    if (choice.advancesStory) {
        state.advanceStory(choice.advancesStory === true ? null : choice.advancesStory);
        state.autoSave();
    }

    if (choice.goto) {
        showScene(choice.goto);
    }
}

// effects appllier (flags, aether, conditions, items, etc)
function applyEffects(effects) {
    if (!effects) return;

    if (effects.setFlags) {
        for (const flag of effects.setFlags) {
            state.setFlag(flag);
        }
    }

    if (effects.clearFlags) {
        for (const flag of effects.clearFlags) {
            state.setFlag(flag, false);
        }
    }

    if (effects.aether) {
        state.modifyAether(effects.aether);
    }

    if (effects.stats) {
        for (const [statName, amount] of Object.entries(effects.stats)) {
            state.modifyStat(statName, amount);
        }
    }

    if (effects.addConditions) {
        for (const condition of effects.addConditions) {
            state.addCondition(condition);
        }
    }

    if (effects.removeConditions) {
        for (const condition of effects.removeConditions) {
            state.removeCondition(condition);
        }
    }

    if (effects.addItems) {
        for (const item of effects.addItems) {
            state.addItem(item);
        }
    }

    if (effects.removeItems) {
        for (const item of effects.removeItems) {
            state.removeItem(item);
        }
    }
}

// game starter
async function startGame() {
    const gameState = state.getState();
    const loaded = await loadChapter(gameState.chapter);

    if (!loaded) {
        ui.renderText("Failed to load story data. Check the console.");
        return;
    }

    showScene(gameState.currentScene);
}

startGame();