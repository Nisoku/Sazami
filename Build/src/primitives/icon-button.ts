import { SazamiComponent, component } from "./base";
import {
  STATE_DISABLED,
  STATE_ACTIVE,
  INTERACTIVE_FOCUS,
  VARIANT_TEXT_RULES,
} from "./shared";
import { ICON_SVGS } from "../icons/index";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";

const STYLES = `
:host {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--saz-space-small);
  border: none;
  border-radius: var(--saz-radius-round);
  background: transparent;
  color: var(--saz-color-text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  line-height: 1;
}
:host(:hover) {
  background: var(--saz-color-surface-hover);
}
:host(:active) {
  background: var(--saz-color-surface-active);
  transform: scale(0.75);
}
${VARIANT_TEXT_RULES}
${STATE_DISABLED}
${STATE_ACTIVE}
${INTERACTIVE_FOCUS}
:host([size="small"]) { padding: var(--saz-space-tiny); }
:host([size="large"]) { padding: var(--saz-space-medium); }
:host([size="xlarge"]) { padding: var(--saz-space-large); }
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium);
  height: var(--saz-icon-size-medium);
}
:host([size="small"]) .icon {
  width: var(--saz-icon-size-small);
  height: var(--saz-icon-size-small);
}
:host([size="large"]) .icon {
  width: var(--saz-icon-size-large);
  height: var(--saz-icon-size-large);
}
:host([size="xlarge"]) .icon {
  width: var(--saz-icon-size-xlarge);
  height: var(--saz-icon-size-xlarge);
}
.icon svg { width: 100%; height: 100%; pointer-events: none; }
`;

// Config
const iconButtonConfig = {
  properties: {
    icon: { type: "string" as const, reflect: true },
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
  },
  events: {
    click: { name: "saz-click", detail: {} },
  },
} as const;

@component(iconButtonConfig)
export class SazamiIconButton extends SazamiComponent<typeof iconButtonConfig> {
  declare icon: string;
  declare size: string;
  declare variant: string;

  private _handlersAdded = false;
  private _autoAriaLabel = false;
  private _disabledSignal: Readable<boolean> | null = null;

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
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

  render() {
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];

    if (svg) {
      this.mount(
        STYLES,
        `
        <div class="icon">${svg}</div>
      `,
      );
    } else {
      this.mount(STYLES, `<div class="icon"><span class="glyph"></span></div>`);
      const glyph = this.$(".glyph");
      if (glyph) glyph.textContent = icon;
    }

    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    this._updateTabIndex();
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", icon);
      this._autoAriaLabel = true;
    } else {
      this._autoAriaLabel = false;
    }

    if (!this._handlersAdded) {
      this._handlersAdded = true;
      this.addHandler("click", this._handleClick, { internal: true });
      this.addHandler("keydown", this._handleKeydown, { internal: true });
    }
  }

  private _updateTabIndex() {
    if (this._getIsDisabled()) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }

  static get observedAttributes() {
    return ["disabled", "icon", "size", "variant"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (oldVal === newVal) return;
    if (name === "disabled") {
      this._updateTabIndex();
    }
    if (name === "icon") {
      if (this._autoAriaLabel) {
        this.removeAttribute("aria-label");
      }
      this.render();
    } else if (name === "size" || name === "variant") {
      this.render();
    }
  }

  private _handleClick = () => {
    if (this._getIsDisabled()) return;
    this.dispatchEventTyped("click", {});
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this._handlersAdded = false;
  }
}
