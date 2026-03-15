import { SazamiComponent, component } from "./base";
import {
  STATE_DISABLED,
  INTERACTIVE_FOCUS,
  INTERACTIVE_HOVER,
  VARIANT_TEXT_RULES,
} from "./shared";
import { ICON_SVGS } from "../icons/index";

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
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
  line-height: 1;
}
${INTERACTIVE_HOVER}
${VARIANT_TEXT_RULES}
${STATE_DISABLED}
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
    icon: { type: "string" as const, reflect: false },
    disabled: { type: "boolean" as const, reflect: true },
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
  },
  events: {
    click: { name: "saz-click", detail: {} },
  },
} as const;

@component(iconButtonConfig)
export class SazamiIconButton extends SazamiComponent<typeof iconButtonConfig> {
  declare icon: string;
  declare disabled: boolean;
  declare size: string;
  declare variant: string;

  render() {
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];

    this.mount(
      STYLES,
      `
      <div class="icon">${svg || `<span class="glyph">${icon}</span>`}</div>
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", icon);
    }

    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.click();
    }
  };
}
