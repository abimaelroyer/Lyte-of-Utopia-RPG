// renders data to screen

const statusBar = document.getElementById("status-bar");
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
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
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
    const aether = `${state.aether}/${state.maxAether}`;

    let html = `
        <span class="stat">Yield: ${yieldValue}</span>
        <span class="stat">Aether: ${aether}</span>
    `;

    if (state.activeConditions.length > 0) {
        const conditionList = state.activeConditions.join(", ");
        html += `<span class="conditions">${conditionList}</span>`;
    }

    statusBar.innerHTML = html;
}

export {
    renderText,
    renderChoices,
    renderStatus
};