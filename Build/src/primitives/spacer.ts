import { baseStyles } from "./shared";

export class SazamiSpacer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host { display: block; flex: 1; }
:host([size="small"])  { flex: none; width: var(--saz-space-small, 8px); height: var(--saz-space-small, 8px); }
:host([size="medium"]) { flex: none; width: var(--saz-space-medium, 12px); height: var(--saz-space-medium, 12px); }
:host([size="large"])  { flex: none; width: var(--saz-space-large, 16px); height: var(--saz-space-large, 16px); }
:host([size="xlarge"]) { flex: none; width: var(--saz-space-xlarge, 24px); height: var(--saz-space-xlarge, 24px); }
`) + "";
  }
}
