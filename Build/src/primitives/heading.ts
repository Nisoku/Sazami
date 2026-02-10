import { baseStyles } from "./shared";

export class SazamiHeading extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  font-size: var(--saz-text-size-xlarge, 20px);
  font-weight: var(--saz-text-weight-bold, 700);
  line-height: var(--saz-text-leading-tight, 1.25);
  color: inherit;
  margin: 0 0 var(--saz-space-small, 8px) 0;
}
:host([size="small"])  { font-size: var(--saz-text-size-medium, 14px); }
:host([size="medium"]) { font-size: var(--saz-text-size-large, 16px); }
:host([size="large"])  { font-size: var(--saz-text-size-xlarge, 20px); }
:host([size="xlarge"]) { font-size: 24px; }
:host([weight="normal"]) { font-weight: var(--saz-text-weight-normal, 400); }
:host([weight="medium"]) { font-weight: var(--saz-text-weight-medium, 500); }
:host([tone="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
`) + "<slot></slot>";
  }
}
