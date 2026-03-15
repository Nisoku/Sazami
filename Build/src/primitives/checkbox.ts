import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";

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
  declare checked: boolean;
  declare disabled: boolean;

  render() {
    const label = this.textContent?.trim() || "";

    this.mount(
      STYLES,
      `
      <span class="box">
        <span class="check">${ICON_SVGS.check}</span>
      </span>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "checkbox");
    this._updateAria();

    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _handleClick = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this._updateAria();
    // TypeScript enforces: { checked: boolean }
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
