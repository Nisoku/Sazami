import { baseStyles, GAP_RULES } from "./shared";

// Factory for generic structural containers (details, controls, etc.)
// Each call returns a fresh class so customElements.define never collides.
export function createGenericClass(): typeof HTMLElement {
  return class extends HTMLElement {
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
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
:host([justify="space-between"]) { justify-content: space-between; }
`) + "<slot></slot>";
    }
  };
}
