import { baseStyles } from "./shared";

export class SazamiInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const placeholder = this.getAttribute("placeholder") || "";
    const type = this.getAttribute("type") || "text";
    const value = this.getAttribute("value") || this.textContent?.trim() || "";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host { display: block; }
input {
  width: 100%;
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-medium, 8px);
  font-size: var(--saz-text-size-medium, 14px);
  font-family: inherit;
  color: var(--saz-color-text, #1f2937);
  background: var(--saz-color-background, #ffffff);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}
input:focus {
  border-color: var(--saz-color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
input::placeholder { color: var(--saz-color-text-dimmer, #9ca3af); }
:host([size="small"]) input {
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  font-size: var(--saz-text-size-small, 12px);
}
:host([size="large"]) input {
  padding: var(--saz-space-medium, 12px) var(--saz-space-large, 16px);
  font-size: var(--saz-text-size-large, 16px);
}
:host([disabled]) input {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--saz-color-surface, #f8f9fa);
}
:host([variant="accent"]) input:focus {
  border-color: var(--saz-color-accent, #ff4d8a);
  box-shadow: 0 0 0 3px rgba(255, 77, 138, 0.15);
}
`) +
      `<input type="${type}" placeholder="${placeholder}" value="${value}" ${this.hasAttribute("disabled") ? "disabled" : ""} />`;

    const input = this.shadowRoot!.querySelector("input");
    if (input) {
      input.addEventListener("input", (e) => {
        this.dispatchEvent(
          new CustomEvent("saz-input", {
            detail: { value: (e.target as HTMLInputElement).value },
            bubbles: true,
            composed: true,
          }),
        );
      });
    }
  }
}
