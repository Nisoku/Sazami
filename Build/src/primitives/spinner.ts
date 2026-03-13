import { baseStyles } from "./shared";

export class SazamiSpinner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const size = this.getAttribute("size") || "medium";
    const label = this.getAttribute("label") || "Loading...";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small, 8px);
}
.spinner {
  animation: spin 1s linear infinite;
  color: var(--saz-color-primary, #2563eb);
}
:host(:not([size])) .spinner,
:host([size="medium"]) .spinner { width: 24px; height: 24px; }
:host([size="tiny"]) .spinner { width: 12px; height: 12px; }
:host([size="small"]) .spinner { width: 16px; height: 16px; }
:host([size="large"]) .spinner { width: 32px; height: 32px; }
:host([size="xlarge"]) .spinner { width: 48px; height: 48px; }
:host([variant="accent"]) .spinner { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="light"]) .spinner { color: #fff; }
.label {
  font-size: var(--saz-text-size-small, 12px);
  color: var(--saz-color-text-dim, #6b7280);
}
:host([label=""]) .label,
:host(:not([label])) .label { display: none; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`) +
      `<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
         <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
         <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
       </svg>
       ${label ? `<span class="label">${label}</span>` : ""}`;
  }
}

export class SazamiProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const value = parseFloat(this.getAttribute("value") || "50");
    const max = parseFloat(this.getAttribute("max") || "100");
    const min = parseFloat(this.getAttribute("min") || "0");
    const indeterminate = this.hasAttribute("indeterminate");
    const size = this.getAttribute("size") || "medium";

    const percent = Math.min(
      100,
      Math.max(0, ((value - min) / (max - min)) * 100),
    );

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host { display: block; width: 100%; }
.track {
  width: 100%;
  background: var(--saz-color-surface, #f3f4f6);
  border-radius: var(--saz-radius-round, 9999px);
  overflow: hidden;
  border: 2px solid var(--saz-color-border, #e0e0e0);
}
:host(:not([size])) .track,
:host([size="medium"]) .track { height: 12px; }
:host([size="tiny"]) .track { height: 6px; }
:host([size="small"]) .track { height: 8px; }
:host([size="large"]) .track { height: 16px; }
:host([size="xlarge"]) .track { height: 20px; }
.bar {
  height: 100%;
  background: var(--saz-color-primary, #2563eb);
  border-radius: var(--saz-radius-round, 9999px);
  transition: width 0.3s ease;
}
:host([variant="accent"]) .bar { background: var(--saz-color-accent, #ff4d8a); }
:host([variant="success"]) .bar { background: var(--saz-color-success, #10b981); }
:host([variant="danger"]) .bar { background: var(--saz-color-danger, #ef4444); }
:host([indeterminate]) .bar {
  width: 30% !important;
  animation: indeterminate 1.5s ease-in-out infinite;
}
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
`) +
      `<div class="track">
         <div class="bar" style="width: ${indeterminate ? "30%" : percent + "%"}"></div>
       </div>`;
  }

  static get observedAttributes() {
    return ["value", "max", "min"];
  }

  attributeChangedCallback() {
    this.connectedCallback();
  }
}
