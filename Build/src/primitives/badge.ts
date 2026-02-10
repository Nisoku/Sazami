import { baseStyles } from "./shared";

export class SazamiBadge extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  border-radius: var(--saz-radius-round, 9999px);
  font-size: var(--saz-text-size-small, 12px);
  font-weight: var(--saz-text-weight-medium, 500);
  line-height: 1;
  white-space: nowrap;
  background: var(--saz-color-surface, #f8f9fa);
  color: var(--saz-color-text, #1f2937);
  border: 1px solid var(--saz-color-border, #e0e0e0);
}
:host([variant="accent"])    { background: var(--saz-color-accent, #ff4d8a); color: var(--saz-color-on-accent, #fff); border-color: transparent; }
:host([variant="primary"])   { background: var(--saz-color-primary, #2563eb); color: var(--saz-color-on-primary, #fff); border-color: transparent; }
:host([variant="secondary"]) { background: var(--saz-color-secondary, #6b7280); color: #fff; border-color: transparent; }
:host([variant="danger"])    { background: var(--saz-color-danger, #ef4444); color: #fff; border-color: transparent; }
:host([variant="success"])   { background: var(--saz-color-success, #10b981); color: #fff; border-color: transparent; }
:host([variant="dim"])       { background: transparent; color: var(--saz-color-text-dim, #6b7280); }
:host([size="small"]) { font-size: 10px; padding: 2px var(--saz-space-tiny, 4px); }
:host([size="large"]) { font-size: var(--saz-text-size-medium, 14px); padding: var(--saz-space-small, 8px) var(--saz-space-medium, 12px); }
`) + "<slot></slot>";
  }
}
