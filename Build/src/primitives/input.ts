import { SazamiComponent, component } from "./base";
import { SIZE_PADDING_RULES, STATE_DISABLED } from "./shared";

const STYLES = `
:host { display: block; }
input {
  width: 100%;
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-medium);
  font-family: inherit;
  color: var(--saz-color-text);
  background: var(--saz-color-background);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}
input:focus {
  border-color: var(--saz-color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
input::placeholder { color: var(--saz-color-text-dimmer); }
${SIZE_PADDING_RULES}
${STATE_DISABLED}
:host([variant="accent"]) input:focus {
  border-color: var(--saz-color-accent);
  box-shadow: 0 0 0 3px rgba(255, 77, 138, 0.15);
}
`;

// Config
const inputConfig = {
  properties: {
    value: { type: "string" as const, reflect: true },
    placeholder: { type: "string" as const, reflect: false },
    type: { type: "string" as const, reflect: false },
    disabled: { type: "boolean" as const, reflect: true },
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
  },
  events: {
    input: { name: "saz-input", detail: { value: "value" } },
  },
} as const;

@component(inputConfig)
export class SazamiInput extends SazamiComponent<typeof inputConfig> {
  declare value: string;
  declare placeholder: string;
  declare type: string;
  declare disabled: boolean;
  declare size: string;
  declare variant: string;

  render() {
    // Read attributes directly for non-reflected properties
    const placeholder = this.getAttribute("placeholder") || "";
    const type = this.getAttribute("type") || "text";

    this.mount(
      STYLES,
      `
      <input type="${type}" placeholder="${placeholder}" value="${this.value || ""}" ${this.disabled ? "disabled" : ""} />
    `,
    );

    const input = this.$("input") as HTMLInputElement;
    if (input) {
      input.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        this.value = target.value;
        this.dispatchEventTyped("input", { value: target.value });
      });
    }
  }
}
