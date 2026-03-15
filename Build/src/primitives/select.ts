import { SazamiComponent, component } from "./base";
import { STATE_DISABLED, INTERACTIVE_FOCUS } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";

const STYLES = `
:host {
  display: block;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  background: var(--saz-color-background);
  color: var(--saz-color-text);
  font-size: var(--saz-text-size-medium);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.trigger:hover {
  border-color: var(--saz-color-primary);
}
.trigger:focus {
  outline: none;
  border-color: var(--saz-color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.trigger svg {
  width: 16px;
  height: 16px;
  color: var(--saz-color-text-dim);
  transition: transform 0.2s ease;
}
.trigger svg {
  fill: none;
  stroke: currentColor;
}
:host([open]) .trigger svg {
  transform: rotate(180deg);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--saz-color-background);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
  max-height: 200px;
  overflow-y: auto;
}
:host([open]) .dropdown {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}
.option {
  padding: var(--saz-space-small) var(--saz-space-large);
  cursor: pointer;
  transition: background 0.1s ease;
  box-sizing: border-box;
}
.option:hover:not(.selected) {
  background: var(--saz-color-surface);
}
.option.selected {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
.option.selected:hover {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
`;

const selectConfig = {
  properties: {
    placeholder: { type: "string" as const, reflect: true },
    value: { type: "string" as const, reflect: true },
    disabled: { type: "boolean" as const, reflect: true },
    open: { type: "boolean" as const, reflect: true },
  },
  events: {
    change: { name: "saz-change", detail: { value: "value" } },
  },
  binds: {
    value: "attribute" as const,
    disabled: "attribute" as const,
  },
} as const;

@component(selectConfig)
export class SazamiSelect extends SazamiComponent<typeof selectConfig> {
  declare placeholder: string;
  declare value: string;
  declare disabled: boolean;
  declare open: boolean;

  private _options: Array<{ value: string; label: string }> = [];
  private _handleDocumentClick = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this.open = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._handleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._handleDocumentClick);
    super.disconnectedCallback();
  }

  render() {
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const value = this.getAttribute("value") || "";

    this._options = Array.from(this.querySelectorAll("option")).map((opt) => ({
      value: opt.getAttribute("value") || opt.textContent || "",
      label: opt.textContent || "",
    }));

    const selectedOption = this._options.find((o) => o.value === value);

    this.mount(
      STYLES,
      `
      <div class="trigger" role="combobox" tabindex="${this.disabled ? "-1" : "0"}" aria-haspopup="listbox" aria-expanded="${this.hasAttribute("open") ? "true" : "false"}">
        <span class="value">${escapeHtml(selectedOption?.label || placeholder)}</span>
        ${ICON_SVGS["chevron-down"] || ""}
      </div>
      <div class="dropdown" role="listbox">
        ${this._options.map((opt, i) => `<div class="option${opt.value === value ? " selected" : ""}" role="option" data-value="${escapeHtml(opt.value)}" aria-selected="${opt.value === value}">${escapeHtml(opt.label)}</div>`).join("")}
      </div>
    `,
    );

    this._updateTabIndex();
    this._wireHandlers();
  }

  private _wireHandlers() {
    if (this.disabled) return;

    const trigger = this.$(".trigger");
    const dropdown = this.$(".dropdown");

    this.addHandler("click", () => this.toggleOpen(), {
      internal: true,
      element: trigger as HTMLElement,
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (this._options.length === 0) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleOpen();
      } else if (e.key === "Escape" && this.hasAttribute("open")) {
        e.preventDefault();
        this.open = false;
      } else if (
        this.hasAttribute("open") &&
        (e.key === "ArrowDown" || e.key === "ArrowUp")
      ) {
        e.preventDefault();
        this._navigateOption(e.key === "ArrowDown" ? 1 : -1);
      }
    };
    this.addHandler("keydown", handleKeydown, {
      internal: true,
      element: trigger as HTMLElement,
    });

    const handleDropdownClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("option")) {
        const newValue = target.getAttribute("data-value") || "";
        this.value = newValue;
        this.open = false;
        this.dispatchEventTyped("change", { value: newValue });
      }
    };
    this.addHandler("click", handleDropdownClick, {
      internal: true,
      element: dropdown as HTMLElement,
    });
  }

  private toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  private _navigateOption(delta: number) {
    if (!this._options || this._options.length === 0) return;
    const currentIndex = this._options.findIndex((o) => o.value === this.value);
    let newIndex = currentIndex + delta;
    if (newIndex < 0) newIndex = this._options.length - 1;
    if (newIndex >= this._options.length) newIndex = 0;
    this.value = this._options[newIndex].value;
    this._updateSelectedState();
    this.dispatchEventTyped("change", { value: this.value });
  }

  private _updateSelectedState() {
    const options = this.shadow.querySelectorAll(".option");
    options.forEach((opt) => {
      const optValue = opt.getAttribute("data-value");
      const isSelected = optValue === this.value;
      opt.classList.toggle("selected", isSelected);
      opt.setAttribute("aria-selected", String(isSelected));
    });
  }

  private _updateDisplay() {
    const trigger = this.$(".trigger") as HTMLElement;
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const selectedOption = this._options.find((o) => o.value === this.value);
    const valueEl = trigger?.querySelector(".value");
    if (valueEl) {
      valueEl.textContent = selectedOption?.label || placeholder;
    }
  }

  private _updateTabIndex() {
    const trigger = this.$(".trigger") as HTMLElement;
    if (trigger) {
      trigger.setAttribute("tabindex", this.disabled ? "-1" : "0");
    }
  }

  static get observedAttributes() {
    return ["open", "value", "disabled", "placeholder"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (oldVal === newVal) return;
    if (name === "open") {
      const trigger = this.$(".trigger");
      const dropdown = this.$(".dropdown");
      if (trigger) {
        trigger.setAttribute(
          "aria-expanded",
          newVal !== null ? "true" : "false",
        );
      }
    }
    if (name === "value") {
      this._updateDisplay();
      this._updateSelectedState();
    }
    if (name === "placeholder") {
      this._updateDisplay();
    }
    if (name === "disabled") {
      this.removeAllHandlers({ type: "click" });
      this.removeAllHandlers({ type: "keydown" });
      this._updateTabIndex();
      this._wireHandlers();
    }
  }
}
