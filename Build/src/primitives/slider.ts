import { SazamiComponent, component } from "./base";
import { STATE_DISABLED } from "./shared";
import {
  Signal,
  Derived,
  isSignal,
  effect,
  type Readable,
} from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  width: 100%;
  padding: 8px 0;
  box-sizing: border-box;
}
.slider-container {
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
}
.track {
  position: absolute;
  width: 100%;
  height: 8px;
  background: var(--saz-color-border);
  border-radius: 999px;
  overflow: hidden;
}
.filled {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--saz-color-primary);
  border-radius: 999px;
}
.slider {
  position: relative;
  width: 100%;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--saz-color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}
.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: var(--saz-color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}
.slider:focus-visible {
  outline: none;
}
.slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(37, 99, 235, 0.3);
}
.labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--saz-space-small);
  font-size: var(--saz-text-size-small);
  color: var(--saz-color-text-dim);
}
${STATE_DISABLED}
`;

const sliderConfig = {
  properties: {
    min: { type: "number" as const, reflect: false, default: 0 },
    max: { type: "number" as const, reflect: false, default: 100 },
    step: { type: "number" as const, reflect: false, default: 1 },
    size: { type: "string" as const, reflect: false, default: "medium" },
  },
  events: {
    input: { name: "saz-input", detail: { value: "value" } },
  },
} as const;

@component(sliderConfig)
export class SazamiSlider extends SazamiComponent<typeof sliderConfig> {
  declare min: number;
  declare max: number;
  declare step: number;
  declare size: string;

  private _valueSignal: Readable<number> | null = null;
  private _disabledSignal: Readable<boolean> | null = null;
  private _sliderElement: HTMLInputElement | null = null;
  private _filledElement: HTMLElement | null = null;
  private _rangeMin: number = 0;
  private _rangeMax: number = 100;

  private _isReadableNum(value: unknown): value is Readable<number> {
    return isSignal(value) || value instanceof Derived;
  }

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
  }

  set value(valueOrSignal: number | Readable<number>) {
    if (this._isReadableNum(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
      this._setupValueBinding();
    } else {
      this._valueSignal = null;
      (this as any)._value = valueOrSignal;
      this._updateSliderValue(valueOrSignal);
    }
  }

  get value(): number | Readable<number> {
    return this._valueSignal || (this as any)._value || 50;
  }

  set disabled(value: boolean | Readable<boolean>) {
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      this.bindDisabled(":host", value);
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }

  get disabled(): boolean | Readable<boolean> {
    return this._disabledSignal || (this as any)._disabled || false;
  }

  private _setDisabled(value: boolean) {
    (this as any)._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  private _getIsDisabled(): boolean {
    if (this._disabledSignal) return this._disabledSignal.get();
    if ((this as any)._disabled !== undefined) return !!(this as any)._disabled;
    return this.hasAttribute("disabled");
  }

  private _setupValueBinding() {
    if (!this._sliderElement || !this._filledElement) return;

    const slider = this._sliderElement;
    const filled = this._filledElement;
    const min = this._rangeMin;
    const max = this._rangeMax;
    const range = max - min;

    this.onCleanup(
      effect(() => {
        const val = this._valueSignal!.get();
        if (slider.value !== String(val)) {
          slider.value = String(val);
        }
        const percent = range !== 0 ? ((val - min) / range) * 100 : 0;
        filled.style.width = `${percent}%`;
      }),
    );
  }

  private _updateSliderValue(value: number) {
    if (this._sliderElement) {
      this._sliderElement.value = String(value);
    }
    if (this._filledElement) {
      const range = this._rangeMax - this._rangeMin;
      const percent =
        range !== 0 ? ((value - this._rangeMin) / range) * 100 : 0;
      this._filledElement.style.width = `${percent}%`;
    }
  }

  render() {
    let min = this.min;
    let max = this.max;
    let step = this.step;

    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 100;
    if (!Number.isFinite(step)) step = 1;
    if (step <= 0) step = 1;

    if (min > max) [min, max] = [max, min];

    this._rangeMin = min;
    this._rangeMax = max;

    const currentValue = this._valueSignal
      ? this._valueSignal.get()
      : (this as any)._value || 50;
    let value = Number(currentValue);
    if (!Number.isFinite(value)) value = 50;
    if (value < min) value = min;
    if (value > max) value = max;

    const disabled = this._getIsDisabled();
    const size = this.size || "medium";

    const sizes: Record<string, { track: string; thumb: string }> = {
      tiny: { track: "4px", thumb: "16px" },
      small: { track: "6px", thumb: "18px" },
      medium: { track: "8px", thumb: "20px" },
      large: { track: "10px", thumb: "24px" },
      xlarge: { track: "14px", thumb: "28px" },
    };
    const trackHeight = sizes[size]?.track || sizes.medium.track;
    const thumbSize = sizes[size]?.thumb || sizes.medium.thumb;

    const range = max - min;
    const percent = range !== 0 ? ((value - min) / range) * 100 : 0;

    this.mount(
      STYLES,
      `
      <div class="slider-container" style="height: ${thumbSize}">
        <div class="track" style="height: ${trackHeight}">
          <div class="filled" style="width: ${percent}%"></div>
        </div>
        <input type="range" class="slider" min="${min}" max="${max}" step="${step}" value="${value}" ${disabled ? "disabled" : ""} style="height: ${thumbSize}" />
      </div>
      <div class="labels">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    `,
    );

    this._sliderElement = this.$(".slider") as HTMLInputElement;
    this._filledElement = this.$(".filled") as HTMLElement;

    if (this._sliderElement) {
      this.removeAllHandlers({ type: "input", source: "internal" });
      this.addHandler(
        "input",
        () => {
          const val = parseFloat(this._sliderElement!.value);
          const pct = range !== 0 ? ((val - min) / range) * 100 : 0;
          this._filledElement!.style.width = `${pct}%`;

          if (this._valueSignal && "set" in this._valueSignal) {
            (this._valueSignal as Signal<number>).set(val);
          } else {
            (this as any)._value = val;
          }
          (this.dispatchEventTyped as any)("input", { value: val });
        },
        { internal: true, element: this._sliderElement },
      );
    }

    if (this._valueSignal) {
      this._setupValueBinding();
    }
  }

  static get observedAttributes() {
    return [...super.observedAttributes, "value", "min", "max", "step", "size"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (
      name === "value" ||
      name === "min" ||
      name === "max" ||
      name === "step"
    ) {
      let parsed = newVal !== null ? parseFloat(newVal) : null;
      if (parsed === null || Number.isNaN(parsed)) {
        parsed =
          name === "value"
            ? 50
            : name === "step"
              ? 1
              : name === "max"
                ? 100
                : 0;
      }
      if (name === "step" && parsed <= 0) {
        parsed = 1;
      }
      (this as any)[name] = parsed;
      if (name === "value" || name === "min" || name === "max") {
        const min = this.min;
        const max = this.max;
        const currentVal = ((this as any)._value as number) || 50;
        if (currentVal < min) (this as any).value = min;
        if (currentVal > max) (this as any).value = max;
      }
    } else if (name === "size") {
      (this as any)[name] = newVal ?? "";
    }
    super.attributeChangedCallback(name, oldVal, newVal);
  }
}
