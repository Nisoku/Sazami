import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { escapeHtml } from "../escape";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
}
.radio {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
  align-self: center;
  background: var(--saz-color-background);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--saz-color-primary);
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
:host([checked]) .radio {
  border-color: var(--saz-color-primary);
}
:host([checked]) .dot {
  opacity: 1;
  transform: scale(1);
}
.label {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;

// Config
const radioConfig = {
  properties: {
    name: { type: "string" as const, reflect: false },
    value: { type: "string" as const, reflect: false },
  },
  events: {
    change: { name: "saz-change", detail: { value: "value" } },
  },
} as const;

@component(radioConfig)
export class SazamiRadio extends SazamiComponent<typeof radioConfig> {
  declare name: string;
  declare value: string;

  private _handlersInstalled = false;
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

  private _getIsChecked(): boolean {
    return this._checkedSignal
      ? this._checkedSignal.get()
      : !!(this as any)._checked;
  }

  render() {
    const label = this.textContent?.trim() || "";

    this.mount(
      STYLES,
      `
      <div class="radio"><div class="dot"></div></div>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "radio");
    this._updateAria();

    if (!this._handlersInstalled) {
      this._handlersInstalled = true;
      this.addHandler("click", this._handleClick, { internal: true });
      this.addHandler("keydown", this._handleKeydown, { internal: true });
    }
  }

  private _updateAria() {
    this.setAttribute("aria-checked", String(this._getIsChecked()));
    if (this._getIsDisabled()) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }

  private _handleClick = () => {
    if (this._getIsDisabled()) return;
    if (this._getIsChecked()) return;

    const name = this.getAttribute("name") || "";
    const value = this.getAttribute("value") || "";

    const root = this.getRootNode() as ParentNode;
    if (root) {
      const escapedName = CSS.escape(name);
      root
        .querySelectorAll(`saz-radio[name="${escapedName}"]`)
        .forEach((el) => {
          if (el === this) return;
          (el as any).checked = false;
        });
    }

    if (this._checkedSignal && "set" in this._checkedSignal) {
      (this._checkedSignal as Signal<boolean>).set(true);
    } else {
      this._setChecked(true);
    }
    this._updateAria();
    this.dispatchEventTyped("change", { value });
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };

  static get observedAttributes() {
    return ["checked", "disabled"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (oldVal === newVal) return;
    if (name === "checked" || name === "disabled") {
      this._updateAria();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._handlersInstalled = false;
  }
}
