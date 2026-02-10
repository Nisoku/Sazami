import { baseStyles } from "./shared";

export class SazamiDivider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  border: none;
  background: var(--saz-color-border, #e0e0e0);
  margin: var(--saz-space-medium, 12px) 0;
}
:host(:not([vertical])) { height: 1px; width: 100%; }
:host([vertical]) {
  width: 1px;
  height: 100%;
  margin: 0 var(--saz-space-medium, 12px);
  align-self: stretch;
}
:host([size="small"]) { margin: var(--saz-space-small, 8px) 0; }
:host([size="large"]) { margin: var(--saz-space-large, 16px) 0; }
:host([variant="dim"]) { background: var(--saz-color-surface, #f8f9fa); }
`) + "";
  }
}
