import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_HOVER, VARIANT_BG_RULES } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-tiny);
  padding: var(--saz-space-tiny) var(--saz-space-small);
  border-radius: var(--saz-radius-round);
  font-size: var(--saz-text-size-small);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;
}
:host([size="small"]) {
  padding: 2px var(--saz-space-tiny);
  font-size: 10px;
}
:host([size="large"]) {
  padding: var(--saz-space-small) var(--saz-space-medium);
  font-size: var(--saz-text-size-medium);
}
:host([size="xlarge"]) {
  padding: var(--saz-space-medium) var(--saz-space-large);
  font-size: var(--saz-text-size-large);
}
:host([variant="default"]) {
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
}
:host([variant="primary"]) {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
:host([variant="accent"]) {
  background: var(--saz-color-accent);
  color: var(--saz-color-on-accent);
}
:host([variant="success"]) {
  background: var(--saz-color-success);
  color: #fff;
}
:host([variant="warning"]) {
  background: #fef3c7;
  color: #92400e;
}
:host([variant="danger"]) {
  background: var(--saz-color-danger);
  color: #fff;
}
:host([selected]) {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
${INTERACTIVE_HOVER}
${STATE_DISABLED}
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.remove-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
.remove-btn svg {
  width: 16px;
  height: 16px;
}
`;

const chipConfig = {
  properties: {
    label: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
    removable: { type: "boolean" as const, reflect: false },
    selected: { type: "boolean" as const, reflect: true },
    disabled: { type: "boolean" as const, reflect: true },
    size: { type: "string" as const, reflect: false },
  },
  events: {
    change: { name: "saz-change", detail: { selected: "selected" } },
    remove: { name: "saz-remove", detail: {} },
  },
} as const;

@component(chipConfig)
export class SazamiChip extends SazamiComponent<typeof chipConfig> {
  declare label: string;
  declare variant: string;
  declare removable: boolean;
  declare selected: boolean;
  declare disabled: boolean;
  declare size: string;

  render() {
    const label = this.getAttribute("label") || this.textContent?.trim() || "";
    const removable = this.hasAttribute("removable");

    this.mount(
      STYLES,
      `
      <span class="chip-label">${escapeHtml(label)}</span>${removable ? `<button class="remove-btn" aria-label="Remove">${ICON_SVGS.close}</button>` : ""}
    `,
    );

    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    this.setAttribute("aria-pressed", String(this.selected));
    this._updateTabIndex();

    if (removable) {
      const btn = this.$(".remove-btn") as HTMLButtonElement;
      this.addHandler(
        "click",
        (e: Event) => {
          e.stopPropagation();
          this.dispatchEventTyped("remove", {});
          this.remove();
        },
        { internal: true, element: btn },
      );
    }

    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }

  private _updateTabIndex() {
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
    this.selected = !this.selected;
    this.setAttribute("aria-pressed", String(this.selected));
    this.dispatchEventTyped("change", { selected: this.selected });
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };
}
