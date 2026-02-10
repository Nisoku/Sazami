import { baseStyles } from "./shared";

export class SazamiText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  font-size: var(--saz-text-size-medium, 14px);
  font-weight: var(--saz-text-weight-normal, 400);
  line-height: var(--saz-text-leading-normal, 1.5);
  color: inherit;
}
:host([size="small"])  { font-size: var(--saz-text-size-small, 12px); }
:host([size="medium"]) { font-size: var(--saz-text-size-medium, 14px); }
:host([size="large"])  { font-size: var(--saz-text-size-large, 16px); }
:host([size="xlarge"]) { font-size: var(--saz-text-size-xlarge, 20px); }
:host([weight="light"])  { font-weight: 300; }
:host([weight="normal"]) { font-weight: var(--saz-text-weight-normal, 400); }
:host([weight="medium"]) { font-weight: var(--saz-text-weight-medium, 500); }
:host([weight="bold"])   { font-weight: var(--saz-text-weight-bold, 700); }
:host([tone="dim"])    { color: var(--saz-color-text-dim, #6b7280); }
:host([tone="dimmer"]) { color: var(--saz-color-text-dimmer, #9ca3af); }
:host([leading="tight"])  { line-height: var(--saz-text-leading-tight, 1.25); }
:host([leading="normal"]) { line-height: var(--saz-text-leading-normal, 1.5); }
:host([leading="loose"])  { line-height: var(--saz-text-leading-loose, 1.75); }
`) + "<slot></slot>";
  }
}
