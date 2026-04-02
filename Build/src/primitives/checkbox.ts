import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  align-self: center;
  vertical-align: middle;
  height: fit-content;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
}
.box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border);
  border-radius: var(--saz-radius-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  align-self: center;
  background: var(--saz-color-background);
}
:host([checked]) .box {
  background: var(--saz-color-primary);
  border-color: var(--saz-color-primary);
}
.check {
  color: #fff;
  width: 12px;
  height: 12px;
  opacity: 0;
  transition: opacity 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
.check svg { width: 100%; height: 100%; display: block; }
:host([checked]) .check { opacity: 1; }
.label {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;

// Config as constant for type inference
const checkboxConfig = {
  // observedAttributes auto-derived from properties with reflect: true
  properties: {
    checked: { type: "boolean" as const, reflect: true },
    disabled: { type: "boolean" as const, reflect: true },
  },
  events: {
    change: { name: "saz-change", detail: { checked: "checked" } },
  },
  binds: {
    checked: "attribute" as const,
    disabled: "attribute" as const,
  },
} as const;

@component(checkboxConfig)
export class SazamiCheckbox extends SazamiComponent<typeof checkboxConfig> {
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
    const label = this.textContent?.trim() || "";

    this.mount(
      STYLES,
      `
      <span class="box">
        <span class="check">${ICON_SVGS.check || ""}</span>
      </span>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "checkbox");
    this._updateAria();

    this.removeHandler("click", this._handleClick);
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _handleClick = () => {
    if (this._getIsDisabled()) return;
    if (this._checkedSignal) {
      if ("set" in this._checkedSignal) {
        const newValue = !this._checkedSignal.get();
        (this._checkedSignal as Signal<boolean>).set(newValue);
        this._updateAria(newValue);
        this.dispatchEventTyped("change", { checked: newValue });
      } else {
        this._updateAria();
      }
    } else {
      const newValue = !((this as any)._checked || false);
      this._setChecked(newValue);
      this._updateAria(newValue);
      this.dispatchEventTyped("change", { checked: newValue });
    }
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };

  private _updateAria(checked?: boolean) {
    const isChecked =
      checked !== undefined
        ? checked
        : this._checkedSignal
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
}
