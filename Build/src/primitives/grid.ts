import { baseStyles, GAP_RULES } from "./shared";

export class SazamiGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const cols = this.getAttribute("cols") || "3";
    const mdCols = this.getAttribute("md:cols");
    const lgCols = this.getAttribute("lg:cols");

    let responsive = "";
    if (mdCols) {
      responsive += `@media (min-width: 768px) { :host { grid-template-columns: repeat(${mdCols}, minmax(0, 1fr)); } }\n`;
    }
    if (lgCols) {
      responsive += `@media (min-width: 1024px) { :host { grid-template-columns: repeat(${lgCols}, minmax(0, 1fr)); } }\n`;
    }

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  gap: var(--saz-space-medium, 12px);
}
${GAP_RULES}
${responsive}
`) + "<slot></slot>";
  }
}
