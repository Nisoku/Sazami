import { SazamiComponent, component } from "./base";
import { SIZE_PADDING_RULES, STATE_DISABLED } from "./shared";
import { escapeHtml } from "../escape";
import {
  Signal,
  Derived,
  isSignal,
  effect,
  type Readable,
} from "@nisoku/sairin";
import { bindInputValue } from "@nisoku/sairin";

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
    placeholder: { type: "string" as const, reflect: false },
    type: { type: "string" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
    disabled: { type: "boolean" as const, reflect: false },
  },
  events: {
    input: { name: "saz-input", detail: { value: "value" } },
  },
} as const;

@component(inputConfig)
export class SazamiInput extends SazamiComponent<typeof inputConfig> {
  declare placeholder: string;
  declare type: string;
  declare disabled: boolean;
  declare size: string;
  declare variant: string;

  private _valueSignal: Readable<string> | null = null;
  private _input: HTMLInputElement | null = null;
  private _valueEffectDisposer: (() => void) | null = null;
  private _inputHandler: ((e: Event) => void) | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set value(valueOrSignal: string | Readable<string>) {
    if (this._isReadableStr(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
    } else {
      this._disposeValueBindings();
      this._valueSignal = null;
      (this as any)._value = valueOrSignal;
      if (this._input && this._input.value !== valueOrSignal) {
        this._input.value = valueOrSignal || "";
      }
    }
  }

  private _disposeValueBindings() {
    if (this._valueEffectDisposer) {
      this._valueEffectDisposer();
      this._valueEffectDisposer = null;
    }
    if (this._inputHandler && this._input) {
      this._input.removeEventListener("input", this._inputHandler);
      this._inputHandler = null;
    }
  }

  get value(): string | Readable<string> {
    if (this._valueSignal) return this._valueSignal.get();
    if ((this as any)._value) return (this as any)._value;
    if (this._input) return this._input.value;
    return this.getAttribute("value") || "";
  }

  render() {
    this._disposeValueBindings();

    const placeholder = this.getAttribute("placeholder") || "";
    const type = this.getAttribute("type") || "text";
    const initialValue = this._valueSignal
      ? this._valueSignal.get()
      : this.getAttribute("value") || (this as any)._value || "";

    this.mount(
      STYLES,
      `
      <input type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(initialValue)}" ${this.disabled ? "disabled" : ""} />
    `,
    );

    this._input = this.$("input") as HTMLInputElement;
    if (this._input) {
      this.removeAllHandlers({ type: "input", source: "internal" });

      if (this._valueSignal) {
        this._valueEffectDisposer = effect(() => {
          const val = this._valueSignal!.get();
          if (this._input && this._input.value !== val) {
            this._input.value = val;
          }
        });
        this.onCleanup(this._valueEffectDisposer);

        this._inputHandler = (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (isSignal(this._valueSignal)) {
            (this._valueSignal as Signal<string>).set(target.value);
          }
          (this.dispatchEventTyped as any)("input", { value: target.value });
        };
        this._input.addEventListener("input", this._inputHandler);
        this.onCleanup(() => {
          if (this._input && this._inputHandler) {
            this._input.removeEventListener("input", this._inputHandler);
          }
        });
      } else {
        this.addHandler(
          "input",
          (e: Event) => {
            const target = e.target as HTMLInputElement;
            (this as any)._value = target.value;
            (this.dispatchEventTyped as any)("input", { value: target.value });
          },
          { internal: true, element: this._input },
        );
      }
    }
  }

  static get observedAttributes() {
    return ["value", "disabled", "placeholder", "type"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (!this._input) return;

    if (name === "value") {
      if (this._valueSignal) return;
      if (newVal === null) {
        if (this._input.value !== "") this._input.value = "";
      } else if (this._input.value !== newVal) {
        this._input.value = newVal;
      }
    } else if (name === "disabled") {
      this._input.disabled = newVal !== null;
    } else if (name === "placeholder") {
      this._input.placeholder = newVal ?? "";
    } else if (name === "type") {
      this._input.type = newVal ?? "text";
    }
  }
}
