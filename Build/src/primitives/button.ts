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
    tone: { type: "string" as const, reflect: false },
  },
  events: {
    click: { name: "saz-click", detail: {} },
  },
} as const;

@component(buttonConfig)
export class SazamiButton extends SazamiComponent<typeof buttonConfig> {
  declare disabled: boolean;
  declare loading: boolean;
  declare active: boolean;
  declare size: string;
  declare variant: string;
  declare shape: string;
  declare tone: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);

    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");

    this.removeHandler("click", this._handleClick);
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _handleClick = () => {
    if (this.disabled || this.loading) return;
    this.dispatchEventTyped("click", {});
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (this.disabled || this.loading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.click();
    }
  };
}
