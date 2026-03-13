import { baseStyles } from "./shared";

export class SazamiSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const checked = this.hasAttribute("checked");
    const disabled = this.hasAttribute("disabled");

    const label = this.textContent?.trim() || "";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  cursor: pointer;
  user-select: none;
}
.switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--saz-color-border, #e0e0e0);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
:host([checked]) .switch {
  background: var(--saz-color-primary, #2563eb);
}
:host([checked]) .thumb {
  transform: translateX(20px);
}
:host([variant="accent"]) .switch {
  background: var(--saz-color-border, #e0e0e0);
}
:host([variant="accent"][checked]) .switch {
  background: var(--saz-color-accent, #ff4d8a);
}
:host([variant="success"]) .switch {
  background: var(--saz-color-border, #e0e0e0);
}
:host([variant="success"][checked]) .switch {
  background: var(--saz-color-success, #10b981);
}
.label {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
:host(:focus-visible) .switch {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) +
      `<div class="switch"><div class="thumb"></div></div>${label ? `<span class="label">${label}</span>` : ""}`;

    if (disabled) return;

    this.addEventListener("click", () => {
      this.toggleAttribute("checked");
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { checked: this.hasAttribute("checked") },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.addEventListener("keydown", (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
