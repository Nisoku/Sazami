import { baseStyles, GAP_RULES, VARIANT_BG_RULES } from "./shared";

export class SazamiCard extends HTMLElement {
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
  background: var(--saz-color-surface, #f8f9fa);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  padding: var(--saz-space-large, 16px);
  border-radius: var(--saz-radius-medium, 8px);
  box-shadow: var(--saz-shadow-soft, 0 1px 3px rgba(0,0,0,0.1));
  color: var(--saz-color-text, #1f2937);
  transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.2s ease;
  gap: var(--saz-space-large, 16px);
}
:host(:hover) { box-shadow: var(--saz-shadow-medium, 0 4px 6px rgba(0,0,0,0.1)); }
:host([layout="row"])    { flex-direction: row; }
:host([layout="column"]) { flex-direction: column; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
${GAP_RULES}
:host([size="small"])  { padding: var(--saz-space-small, 8px); }
:host([size="medium"]) { padding: var(--saz-space-medium, 12px); }
:host([size="large"])  { padding: var(--saz-space-large, 16px); }
${VARIANT_BG_RULES}
`) + "<slot></slot>";
  }
}
