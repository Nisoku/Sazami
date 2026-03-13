import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const value = this.getAttribute("value") || "";
    const disabled = this.hasAttribute("disabled");

    const options = Array.from(this.querySelectorAll("option")).map((opt) => ({
      value: opt.getAttribute("value") || opt.textContent || "",
      label: opt.textContent || "",
    }));

    const selectedOption = options.find((o) => o.value === value);

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  position: relative;
  width: 100%;
}
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-medium, 8px);
  background: var(--saz-color-background, #fff);
  color: var(--saz-color-text, #1f2937);
  font-size: var(--saz-text-size-medium, 14px);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.trigger:hover {
  border-color: var(--saz-color-primary, #2563eb);
}
.trigger:focus {
  outline: none;
  border-color: var(--saz-color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.trigger svg {
  width: 16px;
  height: 16px;
  color: var(--saz-color-text-dim, #6b7280);
  transition: transform 0.2s ease;
}
:host([open]) .trigger svg {
  transform: rotate(180deg);
}
:host([disabled]) .trigger {
  opacity: 0.5;
  cursor: not-allowed;
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--saz-color-background, #fff);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-medium, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
  max-height: 200px;
  overflow-y: auto;
}
:host([open]) .dropdown {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}
.option {
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  cursor: pointer;
  transition: background 0.1s ease;
}
.option:hover {
  background: var(--saz-color-surface, #f3f4f6);
}
.option.selected,
.option:hover {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
}
`) +
      `<div class="trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false">
         <span class="value">${selectedOption?.label || placeholder}</span>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
       </div>
       <div class="dropdown" role="listbox">
         ${options.map((opt, i) => `<div class="option${opt.value === value ? " selected" : ""}" role="option" data-value="${opt.value}">${opt.label}</div>`).join("")}
       </div>`;

    if (disabled) return;

    const trigger = this.shadowRoot!.querySelector(".trigger");
    const dropdown = this.shadowRoot!.querySelector(".dropdown");

    trigger?.addEventListener("click", () => {
      this.toggleAttribute("open");
    });

    dropdown?.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("option")) {
        const newValue = target.getAttribute("data-value") || "";
        this.setAttribute("value", newValue);
        this.removeAttribute("open");
        this.dispatchEvent(
          new CustomEvent("saz-change", {
            detail: { value: newValue },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });

    document.addEventListener("click", (e: Event) => {
      if (!this.contains(e.target as Node)) {
        this.removeAttribute("open");
      }
    });
  }
}
