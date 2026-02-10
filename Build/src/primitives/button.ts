import { baseStyles } from "./shared";

export class SazamiButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small, 8px);
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: 1px solid transparent;
  border-radius: var(--saz-radius-medium, 8px);
  font-size: var(--saz-text-size-medium, 14px);
  font-weight: var(--saz-text-weight-medium, 500);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease,
              box-shadow 0.2s ease, opacity 0.2s ease,
              transform 0.15s ease;
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #ffffff);
}
:host(:hover) { filter: brightness(1.1); }
:host(:active) { transform: scale(0.97); }
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
:host([size="small"]) {
  padding: var(--saz-space-tiny, 4px) var(--saz-space-medium, 12px);
  font-size: var(--saz-text-size-small, 12px);
}
:host([size="large"]) {
  padding: var(--saz-space-medium, 12px) var(--saz-space-xlarge, 24px);
  font-size: var(--saz-text-size-large, 16px);
}
:host([variant="accent"]) {
  background: var(--saz-color-accent, #ff4d8a);
  color: var(--saz-color-on-accent, #ffffff);
}
:host([variant="primary"]) {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #ffffff);
}
:host([variant="secondary"]) {
  background: transparent;
  color: var(--saz-color-text, #1f2937);
  border-color: var(--saz-color-border, #e0e0e0);
}
:host([variant="danger"]) {
  background: var(--saz-color-danger, #ef4444);
  color: #ffffff;
}
:host([variant="success"]) {
  background: var(--saz-color-success, #10b981);
  color: #ffffff;
}
:host([variant="dim"]) {
  background: transparent;
  color: var(--saz-color-text-dim, #6b7280);
  border-color: transparent;
}
:host([variant="dim"]:hover) { color: var(--saz-color-text, #1f2937); }
:host([shape="pill"])   { border-radius: var(--saz-radius-round, 9999px); }
:host([shape="round"])  { border-radius: var(--saz-radius-round, 9999px); }
:host([shape="square"]) { border-radius: var(--saz-radius-none, 0); }
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
:host([loading]) {
  opacity: 0.7;
  cursor: wait;
  pointer-events: none;
}
:host([active]) { filter: brightness(0.9); }
`) + "<slot></slot>";

    this.addEventListener("keydown", (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
