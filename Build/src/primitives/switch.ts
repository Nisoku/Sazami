import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { escapeHtml } from "../escape";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
}
.switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--saz-color-border);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
:host([checked]) .switch {
  background: var(--saz-color-primary);
}
:host([checked]) .thumb {
  transform: translateX(20px);
}
:host([variant="accent"]) .switch {
  background: var(--saz-color-border);
}
:host([variant="accent"][checked]) .switch {
  background: var(--saz-color-accent);
}
:host([variant="success"]) .switch {
  background: var(--saz-color-border);
}
:host([variant="success"][checked]) .switch {
  background: var(--saz-color-success);
}
.label {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;

// Config
const switchConfig = {
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

@component(switchConfig)
export class SazamiSwitch extends SazamiComponent<typeof switchConfig> {
  declare checked: boolean;
  declare disabled: boolean;
  declare variant: string;

  render() {
    const label = this.textContent?.trim() || "";

    this.mount(
      STYLES,
      `
      <div class="switch"><div class="thumb"></div></div>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "switch");
    this._updateAria();

    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _updateAria() {
    this.setAttribute("aria-checked", String(this.checked));
    if (this.disabled) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
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
}
