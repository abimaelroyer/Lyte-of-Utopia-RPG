// renders data to screen

const statsBox = document.getElementById("stats");
const menuBox = document.getElementById("menu");
const sceneText = document.getElementById("scene-text");
const choiceBox = document.getElementById("choices");

function renderText(text) {
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

function renderStatus(state) {
    const yieldValue = state.baseYield.toLocaleString();

    let html = `
        <div class="stat">
            <span>Yield</span>
            <span class="stat-value">${yieldValue}</span>
        </div>
        <div class="stat">
            <span>Aether</span>
            <span class="stat-value">${state.aether}/${state.maxAether}</span>
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

export {
    renderText,
    renderChoices,
    renderStatus,
    renderMenu
};