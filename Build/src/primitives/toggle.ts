import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";

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
  declare checked: boolean;
  declare disabled: boolean;
  declare variant: string;

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
    if (this.disabled) return;
    this.checked = !this.checked;
    this._updateAria();
    this.dispatchEventTyped("change", { checked: this.checked });
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };

  private _updateAria() {
    this.setAttribute("aria-checked", this.checked ? "true" : "false");
    if (this.disabled) {
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
