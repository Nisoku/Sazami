import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";
import {
  Signal,
  Derived,
  isSignal,
  effect,
  onCleanup,
  type Readable,
} from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  background: var(--saz-color-background);
  color: var(--saz-color-text);
  font-size: var(--saz-text-size-medium);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.trigger:hover {
  border-color: var(--saz-color-primary);
}
.trigger:focus {
  outline: none;
  border-color: var(--saz-color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.trigger svg {
  width: 16px;
  height: 16px;
  color: var(--saz-color-text-dim);
  transition: transform 0.2s ease;
}
.trigger svg {
  fill: none;
  stroke: currentColor;
}
:host([open]) .trigger svg {
  transform: rotate(180deg);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--saz-color-background);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
  max-height: 200px;
  overflow-y: auto;
}
:host([open]) .dropdown {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}
.option {
  padding: var(--saz-space-small) var(--saz-space-large);
  cursor: pointer;
  transition: background 0.1s ease;
  box-sizing: border-box;
}
.option:hover:not(.selected) {
  background: var(--saz-color-surface);
}
.option.selected {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
.option.selected:hover {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
`;

const selectConfig = {
  properties: {
    placeholder: { type: "string" as const, reflect: true },
    open: { type: "boolean" as const, reflect: true },
  },
  events: {
    change: { name: "saz-change", detail: { value: "value" } },
  },
  binds: {
    value: "attribute" as const,
    disabled: "attribute" as const,
  },
} as const;

@component(selectConfig)
export class SazamiSelect extends SazamiComponent<typeof selectConfig> {
  declare open: boolean;

  private _options: Array<{ value: string; label: string }> = [];
  private _valueSignal: Readable<string> | null = null;
  private _valueEffectDisposer: (() => void) | null = null;
  private _disabledSignal: Readable<boolean> | null = null;
  private _disabledEffectDisposer: (() => void) | null = null;
  private _handleDocumentClick = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this.open = false;
    }
  };

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
  }

  set value(valueOrSignal: string | Readable<string>) {
    if (this._isReadableStr(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
      this._setupValueBinding();
    } else {
      this._valueSignal = null;
      if (this._valueEffectDisposer) {
        this._valueEffectDisposer();
        this._valueEffectDisposer = null;
      }
      (this as any)._value = valueOrSignal;
      this._updateDisplay();
      this._updateSelectedState();
    }
  }

  get value(): string | Readable<string> {
    return this._valueSignal || (this as any)._value || "";
  }

  private _getValue(): string {
    if (this._valueSignal) return this._valueSignal.get();
    return (this as any)._value || this.getAttribute("value") || "";
  }

  private _setupValueBinding() {
    if (this._valueEffectDisposer) {
      this._valueEffectDisposer();
    }
    const sig = this._valueSignal as Readable<string>;
    const self = this;
    const dispose = effect(() => {
      const val = sig.get();
      (self as any)._value = val;
      self._updateDisplay();
      self._updateSelectedState();
    });
    this._valueEffectDisposer = dispose;
    this.onCleanup(dispose);
  }

  set disabled(value: boolean | Readable<boolean>) {
    if (this._disabledEffectDisposer) {
      this._disabledEffectDisposer();
      this._disabledEffectDisposer = null;
    }
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = effect(() => {
        const disabled = value.get();
        if (disabled) {
          this.setAttribute("disabled", "");
        } else {
          this.removeAttribute("disabled");
        }
        this._updateTabIndex();
      });
      this._disabledEffectDisposer = dispose;
      this.onCleanup(dispose);
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
    this._updateTabIndex();
    this._wireHandlers();
  }

  private _getIsDisabled(): boolean {
    if (this._disabledSignal) return this._disabledSignal.get();
    if ((this as any)._disabled !== undefined) return !!(this as any)._disabled;
    return this.hasAttribute("disabled");
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._handleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._handleDocumentClick);
    super.disconnectedCallback();
  }

  render() {
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const currentValue = this._getValue();

    this._options = Array.from(this.querySelectorAll("option")).map((opt) => ({
      value: opt.getAttribute("value") || opt.textContent || "",
      label: opt.textContent || "",
    }));

    const selectedOption = this._options.find((o) => o.value === currentValue);

    this.mount(
      STYLES,
      `
      <div class="trigger" role="combobox" tabindex="${this._getIsDisabled() ? "-1" : "0"}" aria-haspopup="listbox" aria-expanded="${this.hasAttribute("open") ? "true" : "false"}">
        <span class="value">${escapeHtml(selectedOption?.label || placeholder)}</span>
        ${ICON_SVGS["chevron-down"] || ""}
      </div>
      <div class="dropdown" role="listbox">
        ${this._options.map((opt, i) => `<div class="option${opt.value === currentValue ? " selected" : ""}" role="option" data-value="${escapeHtml(opt.value)}" aria-selected="${opt.value === currentValue}">${escapeHtml(opt.label)}</div>`).join("")}
      </div>
    `,
    );

    this._updateTabIndex();
    this._wireHandlers();

    if (this._valueSignal) {
      this._setupValueBinding();
    }
  }

  private _wireHandlers() {
    if (this._getIsDisabled()) return;

    const trigger = this.$(".trigger");
    const dropdown = this.$(".dropdown");

    this.addHandler("click", () => this.toggleOpen(), {
      internal: true,
      element: trigger as HTMLElement,
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (this._options.length === 0) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleOpen();
      } else if (e.key === "Escape" && this.hasAttribute("open")) {
        e.preventDefault();
        this.open = false;
      } else if (
        this.hasAttribute("open") &&
        (e.key === "ArrowDown" || e.key === "ArrowUp")
      ) {
        e.preventDefault();
        this._navigateOption(e.key === "ArrowDown" ? 1 : -1);
      }
    };
    this.addHandler("keydown", handleKeydown, {
      internal: true,
      element: trigger as HTMLElement,
    });

    const handleDropdownClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("option")) {
        const newValue = target.getAttribute("data-value") || "";
        if (this._valueSignal) {
          if ("set" in this._valueSignal) {
            (this._valueSignal as Signal<string>).set(newValue);
          } else {
            (this as any)._value = newValue;
            this._updateDisplay();
            this._updateSelectedState();
          }
        } else {
          (this as any)._value = newValue;
          this._updateDisplay();
          this._updateSelectedState();
        }
        this.open = false;
        (this.dispatchEventTyped as any)("change", { value: newValue });
      }
    };
    this.addHandler("click", handleDropdownClick, {
      internal: true,
      element: dropdown as HTMLElement,
    });
  }

  private toggleOpen() {
    if (this._getIsDisabled()) return;
    this.open = !this.open;
  }

  private _navigateOption(delta: number) {
    if (!this._options || this._options.length === 0) return;
    const currentValue = this._getValue();
    const currentIndex = this._options.findIndex(
      (o) => o.value === currentValue,
    );
    let newIndex = currentIndex + delta;
    if (newIndex < 0) newIndex = this._options.length - 1;
    if (newIndex >= this._options.length) newIndex = 0;
    const newValue = this._options[newIndex].value;
    if (this._valueSignal) {
      if ("set" in this._valueSignal) {
        (this._valueSignal as Signal<string>).set(newValue);
      } else {
        (this as any)._value = newValue;
        this._updateDisplay();
        this._updateSelectedState();
      }
    } else {
      (this as any)._value = newValue;
      this._updateDisplay();
      this._updateSelectedState();
    }
    (this.dispatchEventTyped as any)("change", { value: newValue });
  }

  private _updateSelectedState() {
    const currentValue = this._getValue();
    const options = this.shadow.querySelectorAll(".option");
    options.forEach((opt) => {
      const optValue = opt.getAttribute("data-value");
      const isSelected = optValue === currentValue;
      opt.classList.toggle("selected", isSelected);
      opt.setAttribute("aria-selected", String(isSelected));
    });
  }

  private _updateDisplay() {
    const trigger = this.$(".trigger") as HTMLElement;
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const currentValue = this._getValue();
    const selectedOption = this._options.find((o) => o.value === currentValue);
    const valueEl = trigger?.querySelector(".value");
    if (valueEl) {
      valueEl.textContent = selectedOption?.label || placeholder;
    }
  }

  private _updateTabIndex() {
    const trigger = this.$(".trigger") as HTMLElement;
    if (trigger) {
      trigger.setAttribute("tabindex", this._getIsDisabled() ? "-1" : "0");
    }
  }

  static get observedAttributes() {
    return ["open", "value", "disabled", "placeholder"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (oldVal === newVal) return;
    if (name === "open") {
      const trigger = this.$(".trigger");
      const dropdown = this.$(".dropdown");
      if (trigger) {
        trigger.setAttribute(
          "aria-expanded",
          newVal !== null ? "true" : "false",
        );
      }
    }
    if (name === "value") {
      this._updateDisplay();
      this._updateSelectedState();
    }
    if (name === "placeholder") {
      this._updateDisplay();
    }
    if (name === "disabled") {
      this.removeAllHandlers({ type: "click" });
      this.removeAllHandlers({ type: "keydown" });
      this._updateTabIndex();
      this._wireHandlers();
    }
  }
}
