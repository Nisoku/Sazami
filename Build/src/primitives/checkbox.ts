import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiCheckbox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "checkbox");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this.setAttribute(
      "aria-checked",
      this.hasAttribute("checked") ? "true" : "false",
    );

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
.box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-soft, 4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  background: var(--saz-color-background, #fff);
}
:host([checked]) .box {
  background: var(--saz-color-primary, #2563eb);
  border-color: var(--saz-color-primary, #2563eb);
}
.check {
  color: #fff;
  width: 12px;
  height: 12px;
  opacity: 0;
  transition: opacity 0.1s ease;
}
.check svg { width: 100%; height: 100%; }
:host([checked]) .check { opacity: 1; }
.label {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
:host(:focus-visible) .box {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) +
      `<span class="box"><span class="check">${ICON_SVGS.check}</span></span>${label ? `<span class="label">${label}</span>` : ""}`;

    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.toggleAttribute("checked");
      this.setAttribute(
        "aria-checked",
        this.hasAttribute("checked") ? "true" : "false",
      );
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
