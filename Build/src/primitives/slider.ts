import { SazamiComponent, component } from "./base";
import { STATE_DISABLED } from "./shared";

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
    value: { type: "number" as const, reflect: false },
    min: { type: "number" as const, reflect: false },
    max: { type: "number" as const, reflect: false },
    step: { type: "number" as const, reflect: false },
    disabled: { type: "boolean" as const, reflect: true },
    size: { type: "string" as const, reflect: false },
  },
  events: {
    input: { name: "saz-input", detail: { value: "value" } },
  },
} as const;

@component(sliderConfig)
export class SazamiSlider extends SazamiComponent<typeof sliderConfig> {
  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare disabled: boolean;
  declare size: string;

  private _sliderHandlerAdded = false;

  render() {
    const min = parseFloat(this.getAttribute("min") || "0");
    const max = parseFloat(this.getAttribute("max") || "100");
    const value = parseFloat(this.getAttribute("value") || "50");
    const step = parseFloat(this.getAttribute("step") || "1");
    const disabled = this.hasAttribute("disabled");
    const size = this.getAttribute("size") || "medium";

    const sizes: Record<string, { track: string; thumb: string }> = {
      tiny: { track: "4px", thumb: "16px" },
      small: { track: "6px", thumb: "18px" },
      medium: { track: "8px", thumb: "20px" },
      large: { track: "10px", thumb: "24px" },
      xlarge: { track: "14px", thumb: "28px" },
    };
    const trackHeight = sizes[size]?.track || sizes.medium.track;
    const thumbSize = sizes[size]?.thumb || sizes.medium.thumb;

    const percent = ((value - min) / (max - min)) * 100;

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

    const slider = this.$(".slider") as HTMLInputElement;
    const filled = this.$(".filled") as HTMLElement;

    if (slider && !this._sliderHandlerAdded) {
      this._sliderHandlerAdded = true;
      this.addHandler("input", () => {
        const val = parseFloat(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        filled.style.width = `${pct}%`;
        this.value = val;
        this.dispatchEventTyped("input", { value: val });
      }, { internal: true, element: slider });
    }
  }

  static get observedAttributes() {
    return ["value", "min", "max", "size"];
  }

  attributeChangedCallback() {
    this.render();
  }
}
