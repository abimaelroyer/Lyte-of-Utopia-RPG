// game engine

import * as state from "./state.js";
import * as ui from "./ui.js";

let sceneData = {};
let currentScene = null;
let sceneBeforeMenu = null;

// story data loader
async function loadEpisode(episodeNumber) {
    try {
        const [episodeResponse, systemResponse] = await Promise.all([
            fetch(`data/story/Chapter_1/ep${episodeNumber}.json`),
            fetch("data/system.json"),
        ]);

        if (!episodeResponse.ok) throw new Error(`Episode ${episodeNumber} not found`);
        if (!systemResponse.ok) throw new Error("system.json not found");

        const episode = await episodeResponse.json();
        const system = await systemResponse.json();

        sceneData = { ...episode, ...system };
        return true;
    } catch (error) {
        console.error("Failed to load:", error);
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
    let sceneBeforeMenu = null;
    state.setScene(sceneId);

    ui.renderText(scene.text);
    ui.renderStatus(state.getState());

    const choices = buildChoices(scene.choices || []);
    ui.renderChoices(choices, handleChoice);
}

function setupMenu() {
    ui.renderMenu([
        {
            label: "Credits",
            action: () => {
                if (currentScene === "credits") return;
                sceneBeforeMenu = currentScene;
                showScene("credits");
            }
        }
    ]);
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
async function handleChoice(index) {
    const scene = sceneData[currentScene];
    const choice = scene.choices[index];

    if (!choice) return;

    applyEffects(choice.effects);

    if (choice.advancesStory) {
        state.advanceStory(choice.advancesStory === true ? null : choice.advancesStory);
        state.autoSave();
    }

    if (choice.nextEpisode) {
        const loaded = await loadEpisode(choice.nextEpisode);

        if (!loaded) {
            ui.renderText("Failed to load the next episode. Check the console.");
            return;
        }

        state.setEpisode(choice.nextEpisode);
    }

    if (choice.goto === "__return") {
        showScene(sceneBeforeMenu);
        return;
    }

    if (choice.goto) {
        showScene(choice.goto);
    }

    // saved after showScene so the save records the scene we arrived at, not the one we left
    if (choice.nextEpisode) {
        state.autoSave();
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
    const loaded = await loadEpisode(gameState.episode);

    if (!loaded) {
        ui.renderText("Failed to load story data. Check the console.");
        return;
    }

    setupMenu();
    showScene(gameState.currentScene);
}

startGame();