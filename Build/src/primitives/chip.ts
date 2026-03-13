import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiChip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const label = this.getAttribute("label") || this.textContent?.trim() || "";
    const variant = this.getAttribute("variant") || "default";
    const removable = this.hasAttribute("removable");
    const selected = this.hasAttribute("selected");

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-tiny, 4px);
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  border-radius: var(--saz-radius-round, 9999px);
  font-size: var(--saz-text-size-small, 12px);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;
}
:host(:not([size])) {
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  font-size: var(--saz-text-size-small, 12px);
}
:host([size="small"]) {
  padding: 2px var(--saz-space-tiny, 4px);
  font-size: 10px;
}
:host([size="large"]) {
  padding: var(--saz-space-small, 8px) var(--saz-space-medium, 12px);
  font-size: var(--saz-text-size-medium, 14px);
}
:host([size="xlarge"]) {
  padding: var(--saz-space-medium, 12px) var(--saz-space-large, 16px);
  font-size: var(--saz-text-size-large, 16px);
}
:host([variant="default"]) {
  background: var(--saz-color-surface, #f3f4f6);
  color: var(--saz-color-text, #1f2937);
}
:host([variant="primary"]) {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
}
:host([variant="accent"]) {
  background: var(--saz-color-accent, #ff4d8a);
  color: var(--saz-color-on-accent, #fff);
}
:host([variant="success"]) {
  background: var(--saz-color-success, #10b981);
  color: #fff;
}
:host([variant="warning"]) {
  background: #fef3c7;
  color: #92400e;
}
:host([variant="danger"]) {
  background: var(--saz-color-danger, #ef4444);
  color: #fff;
}
:host([selected]) {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
}
:host(:hover) {
  filter: brightness(0.95);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.remove-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
.remove-btn svg {
  width: 16px;
  height: 16px;
}
`) +
      `${label}${removable ? `<button class="remove-btn" aria-label="Remove">${ICON_SVGS.close}</button>` : ""}`;

    if (removable) {
      const btn = this.shadowRoot!.querySelector(".remove-btn");
      btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.dispatchEvent(
          new CustomEvent("saz-remove", { bubbles: true, composed: true }),
        );
        this.remove();
      });
    }

    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.toggleAttribute("selected");
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { selected: this.hasAttribute("selected") },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}
