import { baseStyles } from "./shared";

export class SazamiRadio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const name = this.getAttribute("name") || "";
    const value = this.getAttribute("value") || "";
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
.radio {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border, #e0e0e0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
  background: var(--saz-color-background, #fff);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--saz-color-primary, #2563eb);
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
:host([checked]) .radio {
  border-color: var(--saz-color-primary, #2563eb);
}
:host([checked]) .dot {
  opacity: 1;
  transform: scale(1);
}
.label {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
:host(:focus-visible) .radio {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) +
      `<div class="radio"><div class="dot"></div></div>${label ? `<span class="label">${label}</span>` : ""}`;

    if (disabled) return;

    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;

      document.querySelectorAll(`saz-radio[name="${name}"]`).forEach((el) => {
        el.removeAttribute("checked");
      });

      this.setAttribute("checked", "");
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { value },
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
