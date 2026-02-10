import { baseStyles, GAP_RULES } from "./shared";

export class SazamiRow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: flex;
  flex-direction: row;
  gap: var(--saz-space-medium, 12px);
  align-items: center;
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([justify="flex-end"])      { justify-content: flex-end; }
:host([justify="space-around"])  { justify-content: space-around; }
:host([justify="space-evenly"])  { justify-content: space-evenly; }
:host([align="center"])    { align-items: center; }
:host([align="flex-end"])  { align-items: flex-end; }
:host([align="stretch"])   { align-items: stretch; }
:host([align="baseline"])  { align-items: baseline; }
:host([wrap])              { flex-wrap: wrap; }
`) + "<slot></slot>";
  }
}
