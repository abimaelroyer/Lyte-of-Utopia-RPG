// renders data to screen

const statsBox = document.getElementById("stats");
const menuBox = document.getElementById("menu");
const sceneText = document.getElementById("scene-text");
const choiceBox = document.getElementById("choices");

function renderText(text) {
    // Report malformed story data instead of crashing on text.split().
    if (typeof text !== "string") {
        console.error("renderText expected a string; received:", text);
        text = "Scene text is missing or invalid. Check the story data and console.";
    }
    sceneText.innerHTML = "";

    const paragraphs = text.split("\n\n");

    for (const para of paragraphs) {
        const p = document.createElement("p");
        p.innerHTML = formatText(para);
        sceneText.appendChild(p);
    }
}

function formatText(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/^## (.+)$/gm, '<span class="section-header">$1</span>')
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
}

function renderChoices(choices, onChoice) {
    choiceBox.innerHTML = "";

    choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.classList.add("choice");
        button.textContent = choice.text;

        if (choice.locked) {
            button.disabled = true;
            button.classList.add("locked");
            if (choice.lockedReason) {
                button.title = choice.lockedReason;
            }
        } else {
            button.addEventListener("click", () => onChoice(index));
        }

        choiceBox.appendChild(button);
    });
}

function renderStatus(state, attributes) {
    const aetherValue = `${Math.round(attributes.maxAether)}`;

    let html = `
        <div class="stat">
            <span>Aether Pool</span>
            <span class="stat-value">${aetherValue}</span>
        </div>
        <div class="stat">
            <span>Melee Potency</span>
            <span class="stat-value">${attributes.meleePotency}</span>
        </div>
    `;

    if (state.activeConditions.length > 0) {
        html += `<div class="conditions">${state.activeConditions.join(" · ")}</div>`;
    }

    statsBox.innerHTML = html;
}

function renderMenu(buttons) {
    menuBox.innerHTML = "";

    for (const item of buttons) {
        const button = document.createElement("button");
        button.classList.add("menu-button");
        button.textContent = item.label;
        button.addEventListener("click", item.action);
        menuBox.appendChild(button);
    }
}

// ---------------------------------------------------------------------
// Combat sprites
// ---------------------------------------------------------------------
// Renders idle-loop strips from data/sprites.json. Combat-pose frames
// (strike, hit-react) don't exist yet -- everyone just breathes.
// See sprites.json's per-character "note" fields for known caveats
// (Wolf's displayScale is clamped for a different stage width than
// this one; recompute here rather than trust that number blindly).

let spriteSheet = {};
const spriteState = {}; // per-character: { frame, elapsed, lastTime }

async function loadSpriteSheet() {
    try {
        const res = await fetch("data/sprites.json");
        if (!res.ok) throw new Error("sprites.json not found");
        spriteSheet = await res.json();
        return true;
    } catch (error) {
        console.error("Failed to load sprites.json:", error);
        return false;
    }
}

function initSpriteState(characterId) {
    spriteState[characterId] = { frame: 0, elapsed: 0, lastTime: performance.now() };
}

// Call once per animation frame while a combat scene is visible.
// stageWidthPx lets each stage clamp scale independently, since the
// source tool's displayScale numbers were tuned for its own 512px
// preview box, not this game's layout.
function tickSprite(characterId, stageWidthPx) {
    const sheet = spriteSheet[characterId];
    const state = spriteState[characterId];
    if (!sheet || !state) return null;

    const now = performance.now();
    state.elapsed += now - state.lastTime;
    state.lastTime = now;

    const delay = sheet.frameDelaysMs[state.frame];
    if (state.elapsed >= delay) {
        state.elapsed = 0;
        state.frame = (state.frame + 1) % sheet.frameCount;
    }

    const maxScale = stageWidthPx
        ? Math.min(sheet.displayScale, (stageWidthPx - 16) / sheet.frameWidth)
        : sheet.displayScale;

    return {
        src: sheet.idleStrip,
        frame: state.frame,
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
        scale: maxScale,
    };
}

// Draws both fighters into whatever container the combat scene provides.
// facingLeft mirrors the sprite -- used so the enemy faces the player.
function renderCombatSprites(playerId, enemyId, container) {
    container.innerHTML = "";

    const playerBox = document.createElement("div");
    playerBox.className = "combat-sprite combat-sprite-player";
    const enemyBox = document.createElement("div");
    enemyBox.className = "combat-sprite combat-sprite-enemy";

    container.appendChild(playerBox);
    container.appendChild(enemyBox);

    function paint(characterId, box, facingLeft) {
        const stageWidth = box.clientWidth || 200;
        const data = tickSprite(characterId, stageWidth);
        if (!data) return;

        box.style.width = data.frameWidth + "px";
        box.style.height = data.frameHeight + "px";
        box.style.backgroundImage = `url(${data.src})`;
        box.style.backgroundPosition = `-${data.frame * data.frameWidth}px 0`;
        box.style.backgroundRepeat = "no-repeat";
        box.style.imageRendering = "pixelated";
        box.style.transform = `scale(${facingLeft ? -data.scale : data.scale}, ${data.scale})`;
        box.style.transformOrigin = "50% 100%";
    }

    function frameLoop() {
        if (!container.isConnected || !playerBox.isConnected || !enemyBox.isConnected) return; // stop when the stage is cleared/replaced
        paint(playerId, playerBox, false);
        paint(enemyId, enemyBox, true);
        requestAnimationFrame(frameLoop);
    }

    initSpriteState(playerId);
    initSpriteState(enemyId);
    requestAnimationFrame(frameLoop);
}

export {
    renderText,
    renderChoices,
    renderStatus,
    renderMenu,
    loadSpriteSheet,
    renderCombatSprites
};