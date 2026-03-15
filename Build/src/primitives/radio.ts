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
    checked: { type: "boolean" as const, reflect: true },
    disabled: { type: "boolean" as const, reflect: true },
    name: { type: "string" as const, reflect: false },
    value: { type: "string" as const, reflect: false },
  },
  events: {
    change: { name: "saz-change", detail: { value: "value" } },
  },
} as const;

@component(radioConfig)
export class SazamiRadio extends SazamiComponent<typeof radioConfig> {
  declare checked: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;

  private _handlersInstalled = false;

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
    if (this.checked) return;

    const name = this.getAttribute("name") || "";
    const value = this.getAttribute("value") || "";

    const root = this.getRootNode() as ParentNode;
    if (root) {
      const escapedName = CSS.escape(name);
      root
        .querySelectorAll(`saz-radio[name="${escapedName}"]`)
        .forEach((el) => {
          if (el === this) return;
          el.removeAttribute("checked");
        });
    }

    this.checked = true;
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
