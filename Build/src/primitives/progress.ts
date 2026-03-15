import { SazamiComponent, component } from "./base";

const STYLES = `
:host { display: block; width: 100%; }
.track {
  width: 100%;
  background: var(--saz-color-surface);
  border-radius: var(--saz-radius-round);
  overflow: hidden;
  border: 2px solid var(--saz-color-border);
}
:host(:not([size])) .track,
:host([size="medium"]) .track { height: 12px; }
:host([size="tiny"]) .track { height: 6px; }
:host([size="small"]) .track { height: 8px; }
:host([size="large"]) .track { height: 16px; }
:host([size="xlarge"]) .track { height: 20px; }
.bar {
  height: 100%;
  background: var(--saz-color-primary);
  border-radius: var(--saz-radius-round);
  transition: width 0.3s ease;
}
:host([variant="accent"]) .bar { background: var(--saz-color-accent); }
:host([variant="success"]) .bar { background: var(--saz-color-success); }
:host([variant="danger"]) .bar { background: var(--saz-color-danger); }
:host([indeterminate]) .bar {
  width: 30% !important;
  animation: indeterminate 1.5s ease-in-out infinite;
}
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
`;

const progressConfig = {
  properties: {
    value: { type: "number" as const, reflect: false },
    max: { type: "number" as const, reflect: false },
    min: { type: "number" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
  },
} as const;

@component(progressConfig)
export class SazamiProgress extends SazamiComponent<typeof progressConfig> {
  declare value: number;
  declare max: number;
  declare min: number;
  declare size: string;
  declare variant: string;

  render() {
    const value = parseFloat(this.getAttribute("value") || "50");
    const max = parseFloat(this.getAttribute("max") || "100");
    const min = parseFloat(this.getAttribute("min") || "0");
    const indeterminate = this.hasAttribute("indeterminate");

    const percent = Math.min(
      100,
      Math.max(0, ((value - min) / (max - min)) * 100),
    );

    this.mount(
      STYLES,
      `
      <div class="track">
        <div class="bar" style="width: ${indeterminate ? "30%" : percent + "%"}"></div>
      </div>
    `,
    );
  }

  static get observedAttributes() {
    return ["value", "max", "min"];
  }

  attributeChangedCallback() {
    this.render();
  }
}
