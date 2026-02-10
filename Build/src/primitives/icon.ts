import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiIcon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium, 20px);
  height: var(--saz-icon-size-medium, 20px);
  color: inherit;
  line-height: 1;
}
:host([size="small"]) {
  width: var(--saz-icon-size-small, 16px);
  height: var(--saz-icon-size-small, 16px);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large, 24px);
  height: var(--saz-icon-size-large, 24px);
}
:host([size="xlarge"]) {
  width: var(--saz-icon-size-xlarge, 32px);
  height: var(--saz-icon-size-xlarge, 32px);
}
:host([variant="accent"]) { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="primary"]) { color: var(--saz-color-primary, #2563eb); }
:host([variant="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
svg { width: 100%; height: 100%; }
`) + (svg || `<span>${icon}</span>`);
  }
}
