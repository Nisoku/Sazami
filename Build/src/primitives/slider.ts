import { baseStyles } from "./shared";

export class SazamiSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const min = parseFloat(this.getAttribute("min") || "0");
    const max = parseFloat(this.getAttribute("max") || "100");
    const value = parseFloat(this.getAttribute("value") || "50");
    const step = parseFloat(this.getAttribute("step") || "1");
    const disabled = this.hasAttribute("disabled");
    const size = this.getAttribute("size") || "medium";

    const percent = ((value - min) / (max - min)) * 100;

    const sizes: Record<string, { track: string; thumb: string }> = {
      tiny: { track: "4px", thumb: "16px" },
      small: { track: "6px", thumb: "18px" },
      medium: { track: "8px", thumb: "20px" },
      large: { track: "10px", thumb: "24px" },
      xlarge: { track: "14px", thumb: "28px" },
    };
    const trackHeight = sizes[size]?.track || sizes.medium.track;
    const thumbSize = sizes[size]?.thumb || sizes.medium.thumb;

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  width: 100%;
  padding: 8px 0;
  box-sizing: border-box;
}
.slider-container {
  position: relative;
  width: 100%;
  height: ${thumbSize};
  display: flex;
  align-items: center;
}
.track {
  position: absolute;
  width: 100%;
  height: ${trackHeight};
  background: var(--saz-color-border, #e0e0e0);
  border-radius: 999px;
  overflow: hidden;
}
.filled {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--saz-color-primary, #2563eb);
  border-radius: 999px;
}
.slider {
  position: relative;
  width: 100%;
  height: ${thumbSize};
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: ${thumbSize};
  height: ${thumbSize};
  border-radius: 50%;
  background: var(--saz-color-primary, #2563eb);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}
.slider::-moz-range-thumb {
  width: ${thumbSize};
  height: ${thumbSize};
  border: none;
  border-radius: 50%;
  background: var(--saz-color-primary, #2563eb);
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
  margin-top: var(--saz-space-small, 8px);
  font-size: var(--saz-text-size-small, 12px);
  color: var(--saz-color-text-dim, #6b7280);
}
:host([disabled]) .slider {
  opacity: 0.5;
  cursor: not-allowed;
}
:host([disabled]) .slider::-webkit-slider-thumb {
  cursor: not-allowed;
}
`) +
      `<div class="slider-container">
         <div class="track">
           <div class="filled" style="width: ${percent}%"></div>
         </div>
         <input type="range" class="slider" min="${min}" max="${max}" step="${step}" value="${value}" ${disabled ? "disabled" : ""} />
       </div>
       <div class="labels">
         <span>${min}</span>
         <span>${max}</span>
       </div>`;

    const slider = this.shadowRoot!.querySelector(
      ".slider",
    ) as HTMLInputElement;
    const filled = this.shadowRoot!.querySelector(".filled") as HTMLElement;

    slider?.addEventListener("input", () => {
      const val = parseFloat(slider.value);
      const pct = ((val - min) / (max - min)) * 100;
      filled.style.width = `${pct}%`;
      this.dispatchEvent(
        new CustomEvent("saz-input", {
          detail: { value: val },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  static get observedAttributes() {
    return ["value", "min", "max", "size"];
  }

  attributeChangedCallback() {
    this.connectedCallback();
  }
}
