import { SazamiComponent, component } from "./base";
import {
  SIZE_PADDING_RULES,
  VARIANT_BG_RULES,
  SHAPE_RULES,
  STATE_DISABLED,
  STATE_LOADING,
  STATE_ACTIVE,
  INTERACTIVE_FOCUS,
  INTERACTIVE_HOVER,
  TYPO_TONE,
} from "./shared";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindDisabled } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small);
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid transparent;
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-medium);
  font-weight: var(--saz-text-weight-medium);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease,
              box-shadow 0.2s ease, opacity 0.2s ease,
              transform 0.15s ease;
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
${SIZE_PADDING_RULES}
${VARIANT_BG_RULES}
${SHAPE_RULES}
${STATE_DISABLED}
${STATE_LOADING}
${STATE_ACTIVE}
${INTERACTIVE_FOCUS}
${INTERACTIVE_HOVER}
${TYPO_TONE}
`;

// Config
const buttonConfig = {
  properties: {
    disabled: { type: "boolean" as const, reflect: true },
    loading: { type: "boolean" as const, reflect: true },
    active: { type: "boolean" as const, reflect: true },
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
    shape: { type: "string" as const, reflect: true },
    tone: { type: "string" as const, reflect: true },
  },
  events: {
    click: { name: "saz-click", detail: {} },
  },
} as const;

@component(buttonConfig)
export class SazamiButton extends SazamiComponent<typeof buttonConfig> {
  private _disabledSignal: Readable<boolean> | null = null;

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
  }

  set disabled(value: boolean | Readable<boolean>) {
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = bindDisabled(this, value);
      this.onCleanup(dispose);
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }

  get disabled(): boolean | Readable<boolean> {
    return this._disabledSignal || (this as any)._disabled;
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
    if (this.hasAttribute("disabled")) return true;
    return !!(this as any).loading;
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);

    if (!this.hasAttribute("role")) this.setAttribute("role", "button");

    const isInert = this._getIsDisabled();
    if (isInert) {
      this.setAttribute("aria-disabled", "true");
      this.setAttribute("tabindex", "-1");
    } else {
      this.removeAttribute("aria-disabled");
      const currentTabindex = this.getAttribute("tabindex");
      if (currentTabindex === "-1" || !this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }
    }

    this.removeHandler("click", this._handleClick);
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _handleClick = () => {
    if (this._getIsDisabled()) return;
    this.dispatchEventTyped("click", {});
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (this._getIsDisabled()) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.click();
    }
  };
}
