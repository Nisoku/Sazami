import { baseStyles, GAP_RULES } from "./shared";

export class SazamiStack extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium, 12px);
}
${GAP_RULES}
:host([align="center"])  { align-items: center; }
:host([align="stretch"]) { align-items: stretch; }
`) + "<slot></slot>";
  }
}
