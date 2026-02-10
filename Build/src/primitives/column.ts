import { baseStyles, GAP_RULES } from "./shared";

export class SazamiColumn extends HTMLElement {
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
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
`) + "<slot></slot>";
  }
}
