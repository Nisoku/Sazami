import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
}
.track {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--saz-color-border);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
:host([checked]) .track { background: var(--saz-color-primary); }
:host([checked]) .thumb { transform: translateX(18px); }
:host([variant="accent"][checked]) .track { background: var(--saz-color-accent); }
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;

// Config
const toggleConfig = {
  properties: {
    checked: { type: "boolean" as const, reflect: true },
    disabled: { type: "boolean" as const, reflect: true },
    variant: { type: "string" as const, reflect: false },
  },
  events: {
    change: { name: "saz-change", detail: { checked: "checked" } },
  },
  binds: {
    checked: "attribute" as const,
    disabled: "attribute" as const,
  },
} as const;

@component(toggleConfig)
export class SazamiToggle extends SazamiComponent<typeof toggleConfig> {
  declare variant: string;

  private _checkedSignal: Readable<boolean> | null = null;
  private _disabledSignal: Readable<boolean> | null = null;

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
  }

  set checked(value: boolean | Readable<boolean>) {
    if (this._isReadableBool(value)) {
      this._checkedSignal = value;
      this.bindAttribute(":host", "checked", value);
    } else {
      this._checkedSignal = null;
      this._setChecked(value);
    }
  }

  get checked(): boolean | Readable<boolean> {
    return this._checkedSignal || (this as any)._checked || false;
  }

  private _setChecked(value: boolean) {
    (this as any)._checked = value;
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
    this._updateAria();
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
    this._updateAria();
  }

  private _getIsDisabled(): boolean {
    if (this._disabledSignal) return this._disabledSignal.get();
    if ((this as any)._disabled !== undefined) return !!(this as any)._disabled;
    return this.hasAttribute("disabled");
  }

  render() {
    this.mount(
      STYLES,
      `
      <span class="track"><span class="thumb"></span></span>
      <slot></slot>
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "switch");
    this._updateAria();

    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _handleClick = () => {
    if (this._getIsDisabled()) return;
    const newValue = this._checkedSignal
      ? !this._checkedSignal.get()
      : !((this as any)._checked || false);
    if (this._checkedSignal) {
      if ("set" in this._checkedSignal) {
        (this._checkedSignal as Signal<boolean>).set(newValue);
        this._updateAria();
      }
    } else {
      this._setChecked(newValue);
      this._updateAria();
    }
    this.dispatchEventTyped("change", { checked: newValue });
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };

  private _updateAria() {
    const isChecked = this._checkedSignal
      ? this._checkedSignal.get()
      : !!(this as any)._checked;
    const isDisabled = this._getIsDisabled();
    this.setAttribute("aria-checked", isChecked ? "true" : "false");
    if (isDisabled) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal === newVal) return;
    if (name === "checked" || name === "disabled") {
      this._updateAria();
    }
  }
}
