import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiIconButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("aria-label")) {
      const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
      this.setAttribute("aria-label", icon);
    }

    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium, 20px);
  height: var(--saz-icon-size-medium, 20px);
  padding: var(--saz-space-small, 8px);
  border: none;
  border-radius: var(--saz-radius-round, 9999px);
  background: transparent;
  color: var(--saz-color-text, #1f2937);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
  line-height: 1;
}
:host(:hover) { background: var(--saz-color-border, #e0e0e0); }
:host(:active) { transform: scale(0.9); }
:host([size="small"]) {
  width: var(--saz-icon-size-small, 16px);
  height: var(--saz-icon-size-small, 16px);
  padding: var(--saz-space-tiny, 4px);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large, 24px);
  height: var(--saz-icon-size-large, 24px);
  padding: var(--saz-space-medium, 12px);
}
:host([variant="accent"]) { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="primary"]) { color: var(--saz-color-primary, #2563eb); }
:host([variant="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
:host([disabled]) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
svg { width: 100%; height: 100%; pointer-events: none; }
.glyph { pointer-events: none; }
`) + (svg || `<span class="glyph">${icon}</span>`);

    this.addEventListener("keydown", (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
