// Small DOM helpers shared by every screen: element builder, story text
// formatting, numbered choices, modals, confirm dialogs and toasts.

(() => {
"use strict";

function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs ?? {})) {
        if (value == null || value === false) continue;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "html") node.innerHTML = value;
        else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
        else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
        else if (key === "dataset") Object.assign(node.dataset, value);
        else node.setAttribute(key, value === true ? "" : value);
    }
    // flat(Infinity): children can be nested arrays, e.g. a .map() that
    // returns [dt, dd] pairs. Without it, inner arrays get printed as text.
    for (const child of children.flat(Infinity)) {
        if (child == null || child === false) continue;
        node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
}

function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Story text uses a tiny subset of Markdown: **bold**, *italic*, "## " headers,
// blank lines between paragraphs. Bold lines on their own read as thoughts or
// shouts and get their own class.
function formatText(text) {
    const paragraphs = String(text ?? "").trim().split(/\n\s*\n/);
    return paragraphs
        .map((raw) => {
            const p = raw.trim();
            if (!p) return "";
            if (p.startsWith("## ")) return `<h2 class="scene-heading">${inline(p.slice(3))}</h2>`;
            const solo = /^\*[^*].*[^*]\*$/.test(p) && !p.slice(1, -1).includes("*");
            const cls = solo ? ' class="aside"' : "";
            return `<p${cls}>${inline(p).replace(/\n/g, "<br>")}</p>`;
        })
        .join("");
}

function inline(s) {
    return escapeHtml(s)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

// Numbered, link-style choices. Number keys 1–9 pick them (see engine.js).
function renderChoices(container, choices) {
    container.replaceChildren();
    choices.forEach((choice, i) => {
        const btn = el(
            "button",
            {
                class: `choice${choice.disabled ? " is-disabled" : ""}${choice.kind ? ` choice-${choice.kind}` : ""}`,
                type: "button",
                disabled: choice.disabled || null,
                title: choice.reason ?? null,
                onclick: () => !choice.disabled && choice.onSelect(),
            },
            el("span", { class: "choice-key", text: i < 9 ? `${i + 1}` : "" }),
            el("span", { class: "choice-text", html: inline(choice.text) }),
            choice.reason ? el("span", { class: "choice-reason", text: choice.reason }) : null
        );
        container.append(el("li", {}, btn));
    });
}

// ---- modals -------------------------------------------------------------------

let openModalState = null;

function openModal({ title, body, wide = false, onClose = null, className = "" }) {
    closeModal();
    const root = document.getElementById("modal-root");
    const previouslyFocused = document.activeElement;
    const closeBtn = el("button", { class: "icon-btn modal-close", type: "button", "aria-label": "Close", onclick: () => closeModal() }, icon("close"));
    const dialog = el(
        "div",
        { class: `modal${wide ? " modal-wide" : ""} ${className}`, role: "dialog", "aria-modal": "true", "aria-label": title },
        el("header", { class: "modal-head" }, el("h2", { text: title }), closeBtn),
        el("div", { class: "modal-body" }, body)
    );
    const backdrop = el("div", { class: "modal-backdrop", onclick: (e) => { if (e.target === backdrop) closeModal(); } }, dialog);
    root.append(backdrop);
    openModalState = { backdrop, onClose, previouslyFocused };
    requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        (dialog.querySelector("[autofocus]") ?? closeBtn).focus();
    });
    return dialog;
}

function closeModal() {
    if (!openModalState) return false;
    const { backdrop, onClose, previouslyFocused } = openModalState;
    openModalState = null;
    backdrop.remove();
    onClose?.();
    if (previouslyFocused?.isConnected) previouslyFocused.focus?.();
    return true;
}

function modalOpen() { return openModalState !== null; }

function confirmDialog({ title, message, confirmText = "Confirm", danger = false }) {
    return new Promise((resolve) => {
        let answered = false;
        const answer = (v) => { answered = true; closeModal(); resolve(v); };
        const body = el(
            "div",
            { class: "confirm" },
            el("p", { text: message }),
            el(
                "div",
                { class: "btn-row" },
                el("button", { class: "btn", type: "button", onclick: () => answer(false) }, "Cancel"),
                el("button", { class: `btn ${danger ? "btn-danger" : "btn-primary"}`, type: "button", autofocus: true, onclick: () => answer(true) }, confirmText)
            )
        );
        openModal({ title, body, onClose: () => { if (!answered) resolve(false); } });
    });
}

// ---- toasts -------------------------------------------------------------------

function toast(message, { tone = "", ms = 2600 } = {}) {
    const root = document.getElementById("toast-root");
    const node = el("div", { class: `toast ${tone ? `toast-${tone}` : ""}`, role: "status" }, message);
    root.append(node);
    requestAnimationFrame(() => node.classList.add("is-in"));
    setTimeout(() => {
        node.classList.remove("is-in");
        setTimeout(() => node.remove(), 300);
    }, ms);
}

// ---- icons (inline SVG, so the game has no icon font to download) --------------

const ICONS = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    flag: '<path d="M6 21V4M6 4h10l-2 3.5L16 11H6"/>',
    shirt: '<path d="M9 4l-5 3 2 4 2-1v10h8V10l2 1 2-4-5-3c-.5 1.5-1.7 2.5-3 2.5S9.5 5.5 9 4z"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
    book: '<path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h9"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    load: '<path d="M4 7h6l2 2h8v10H4z"/><path d="M12 17v-5M9.5 14.5L12 12l2.5 2.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3M12 13v4M8.5 20h7M10 17h4"/>',
    star: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
    chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
    chevronRight: '<path d="M9 5l7 7-7 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
    upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 20h14"/>',
    trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
    sword: '<path d="M14.5 4H20v5.5L10 19.5 4.5 14z"/><path d="M4 20l3-3M7.5 12.5l4 4"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/>',
    run: '<circle cx="14" cy="4.5" r="2"/><path d="M5 20l4-5 3 2 1-5 3 3h3M8 11l3-3 3 1"/>',
    bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
};

function icon(name, cls = "") {
    const span = document.createElement("span");
    span.className = `icon ${cls}`;
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ""}</svg>`;
    return span;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

LOU.ui = { el, formatText, inline, renderChoices, openModal, closeModal, modalOpen, confirmDialog, toast, icon, sleep };
})();
