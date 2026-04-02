import { SazamiComponent, component } from "./base";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";

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
    max: { type: "number" as const, reflect: true, default: 100 },
    min: { type: "number" as const, reflect: true, default: 0 },
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
    indeterminate: { type: "boolean" as const, reflect: true },
  },
} as const;

@component(progressConfig)
export class SazamiProgress extends SazamiComponent<typeof progressConfig> {
  declare max: number;
  declare min: number;
  declare size: string;
  declare variant: string;
  declare indeterminate: boolean;

  private _valueSignal: Readable<number> | null = null;
  private _barElement: HTMLElement | null = null;
  private _rangeMin: number = 0;
  private _rangeMax: number = 100;

  private _isReadableNum(value: unknown): value is Readable<number> {
    return isSignal(value) || value instanceof Derived;
  }

  set value(valueOrSignal: number | Readable<number>) {
    if (this._isReadableNum(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
      this._setupValueBinding();
    } else {
      this._valueSignal = null;
      (this as any)._value = valueOrSignal;
      this._updateBarWidth(valueOrSignal);
    }
  }

  get value(): number | Readable<number> {
    return this._valueSignal || (this as any)._value || 0;
  }

  private _setupValueBinding() {
    if (!this._barElement || !this._valueSignal) return;

    this.bindWidthPercent(
      ".bar",
      this._valueSignal,
      this._rangeMin,
      this._rangeMax,
    );
  }

  private _updateBarWidth(value: number) {
    if (this._barElement) {
      const range = this._rangeMax - this._rangeMin;
      const percent =
        range > 0
          ? Math.min(100, Math.max(0, ((value - this._rangeMin) / range) * 100))
          : 0;
      this._barElement.style.width = `${percent}%`;
    }
  }

  render() {
    const rawValue = this._valueSignal
      ? this._valueSignal.get()
      : ((this as any)._value ?? Number(this.getAttribute("value") || "50"));
    const rawMax = Number(this.getAttribute("max") || "100");
    const rawMin = Number(this.getAttribute("min") || "0");
    const value = Number.isFinite(rawValue) ? rawValue : 50;
    const max = Number.isFinite(rawMax) ? rawMax : 100;
    const min = Number.isFinite(rawMin) ? rawMin : 0;
    const indeterminate = this.hasAttribute("indeterminate");

    this._rangeMin = min;
    this._rangeMax = max;

    const range = max - min;
    const percent =
      range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 0;

    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "progressbar");
    }
    this.setAttribute("aria-valuemin", String(min));
    this.setAttribute("aria-valuemax", String(max));
    if (indeterminate) {
      this.removeAttribute("aria-valuenow");
    } else {
      this.setAttribute("aria-valuenow", String(Math.round(value)));
    }

    this.mount(
      STYLES,
      `
      <div class="track">
        <div class="bar" style="width: ${indeterminate ? "30%" : percent + "%"}"></div>
      </div>
    `,
    );

    this._barElement = this.$(".bar");

    if (this._valueSignal) {
      this._setupValueBinding();
    }
  }

  static get observedAttributes() {
    return ["value", "max", "min", "indeterminate"];
  }

  attributeChangedCallback() {
    this.render();
  }
}
