import { baseStyles } from "./shared";

export class SazamiLabel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  font-size: var(--saz-text-size-small, 12px);
  font-weight: var(--saz-text-weight-medium, 500);
  color: var(--saz-color-text-dim, #6b7280);
  margin-bottom: var(--saz-space-tiny, 4px);
  line-height: var(--saz-text-leading-normal, 1.5);
  cursor: default;
  user-select: none;
}
`) + "<slot></slot>";
  }
}
