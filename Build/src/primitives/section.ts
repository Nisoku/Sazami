import { baseStyles, GAP_RULES } from "./shared";

export class SazamiSection extends HTMLElement {
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
`) + "<slot></slot>";

    if (this.hasAttribute("center-point")) {
      requestAnimationFrame(() => {
        const rect = this.getBoundingClientRect();
        this.dataset.centerX = (rect.left + rect.width / 2).toString();
        this.dataset.centerY = (rect.top + rect.height / 2).toString();
      });
    }
  }
}
