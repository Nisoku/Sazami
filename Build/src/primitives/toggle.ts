import { baseStyles } from "./shared";

export class SazamiToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "switch");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this.setAttribute(
      "aria-checked",
      this.hasAttribute("checked") ? "true" : "false",
    );

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  cursor: pointer;
  user-select: none;
}
.track {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--saz-color-border, #e0e0e0);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
:host([checked]) .track { background: var(--saz-color-primary, #2563eb); }
:host([checked]) .thumb { transform: translateX(18px); }
:host([variant="accent"][checked]) .track { background: var(--saz-color-accent, #ff4d8a); }
:host([disabled]) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
:host(:focus-visible) .track {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) + `<span class="track"><span class="thumb"></span></span><slot></slot>`;

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
