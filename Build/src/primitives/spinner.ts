import { SazamiComponent, component } from "./base";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small);
}
.spinner {
  animation: spin 1s linear infinite;
  color: var(--saz-color-primary);
}
:host(:not([size])) .spinner,
:host([size="medium"]) .spinner { width: 24px; height: 24px; }
:host([size="tiny"]) .spinner { width: 12px; height: 12px; }
:host([size="small"]) .spinner { width: 16px; height: 16px; }
:host([size="large"]) .spinner { width: 32px; height: 32px; }
:host([size="xlarge"]) .spinner { width: 48px; height: 48px; }
:host([variant="accent"]) .spinner { color: var(--saz-color-accent); }
:host([variant="light"]) .spinner { color: #fff; }
.label {
  font-size: var(--saz-text-size-small);
  color: var(--saz-color-text-dim);
}
:host([label=""]) .label { display: none; }
:host(:not([label])) .label { 
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const spinnerConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
    label: { type: "string" as const, reflect: false },
  },
} as const;

@component(spinnerConfig)
export class SazamiSpinner extends SazamiComponent<typeof spinnerConfig> {
  declare size: string;
  declare variant: string;
  declare label: string;

  render() {
    const label = this.getAttribute("label") || "Loading...";
    const hasCustomLabel = this.hasAttribute("label");

    if (!hasCustomLabel) {
      this.setAttribute("role", "status");
      this.setAttribute("aria-live", "polite");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-live");
    }

    this.mount(
      STYLES,
      `
      <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      <span class="label"></span>
    `,
    );

    const labelSpan = this.$(".label");
    if (labelSpan) {
      labelSpan.textContent = label;
    }
  }
}
