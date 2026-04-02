import { SazamiComponent, component } from "./base";
import { ICON_SVGS } from "../icons/index";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindText } from "@nisoku/sairin";

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
.spinner svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
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
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
  },
} as const;

@component(spinnerConfig)
export class SazamiSpinner extends SazamiComponent<typeof spinnerConfig> {
  private _labelSignal: Readable<string> | null = null;
  private _visibleSignal: Readable<boolean> | null = null;
  private _labelElement: HTMLElement | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
  }

  set label(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._labelSignal = value;
      this._setupLabelBinding();
    } else {
      this._labelSignal = null;
      (this as any)._label = value;
      this._updateLabel(value);
    }
  }

  get label(): string | Readable<string> {
    return this._labelSignal || (this as any)._label || "";
  }

  set visible(value: boolean | Readable<boolean>) {
    if (this._isReadableBool(value)) {
      this._visibleSignal = value;
      this.bindVisible(":host", value);
    } else {
      this._visibleSignal = null;
      if (value) {
        this.setAttribute("visible", "");
      } else {
        this.removeAttribute("visible");
      }
    }
  }

  get visible(): boolean | Readable<boolean> {
    return this._visibleSignal || this.hasAttribute("visible");
  }

  private _updateLabel(value: string) {
    if (this._labelElement) {
      this._labelElement.textContent = value;
    }
  }

  private _setupLabelBinding() {
    if (!this._labelElement) return;

    const dispose = bindText(this._labelElement, this._labelSignal!);
    this.onCleanup(dispose);
  }

  render() {
    const labelText = this._labelSignal ? this._labelSignal.get() : ((this as any)._label || this.label || "Loading...");

    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "status");
    }
    if (!this.hasAttribute("aria-live")) {
      this.setAttribute("aria-live", "polite");
    }

    this.mount(
      STYLES,
      `
      <div class="spinner">${ICON_SVGS["spinner"] || ""}</div>
      <span class="label"></span>
    `,
    );

    this._labelElement = this.$(".label");
    if (this._labelElement) {
      this._labelElement.textContent = labelText;
    }

    if (this._labelSignal) {
      this._setupLabelBinding();
    }
  }
}
