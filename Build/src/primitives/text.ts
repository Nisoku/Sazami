import { SazamiComponent, component } from "./base";
import { SIZE_RULES, TYPO_WEIGHT, TYPO_TONE } from "./shared";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindText } from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  font-size: var(--saz-text-size-medium);
  font-weight: var(--saz-text-weight-normal);
  line-height: var(--saz-text-leading-normal);
  color: inherit;
}
${SIZE_RULES}
${TYPO_WEIGHT}
${TYPO_TONE}
:host([leading="tight"])  { line-height: var(--saz-text-leading-tight); }
:host([leading="normal"]) { line-height: var(--saz-text-leading-normal); }
:host([leading="loose"])  { line-height: var(--saz-text-leading-loose); }
`;

const textConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
    weight: { type: "string" as const, reflect: false },
    tone: { type: "string" as const, reflect: false },
    leading: { type: "string" as const, reflect: false },
  },
} as const;

@component(textConfig)
export class SazamiText extends SazamiComponent<typeof textConfig> {
  declare size: string;
  declare weight: string;
  declare tone: string;
  declare leading: string;

  private _content: string | Readable<string> = "";
  private _textNode: Text | null = null;

  private _isReadable(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set content(value: string | Readable<string>) {
    this._content = value;

    if (this._isReadable(value)) {
      this._bindContentSignal(value);
    } else {
      this._setTextContent(value);
    }
  }

  get content(): string | Readable<string> {
    return this._content;
  }

  private _setTextContent(value: string) {
    if (this._textNode) {
      this._textNode.textContent = value ?? "";
    }
  }

  private _bindContentSignal(sig: Readable<string>) {
    const textNode = this._textNode;
    if (!textNode) return;

    const dispose = bindText(textNode, sig);
    this.onCleanup(dispose);
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);
    
    const slot = this.shadow.querySelector("slot");
    if (slot) {
      this._textNode = document.createTextNode("");
      slot.replaceWith(this._textNode);
    } else {
      this._textNode = this.shadow.appendChild(
        document.createTextNode("")
      );
    }

    if (this._isReadable(this._content)) {
      this._bindContentSignal(this._content);
    } else {
      this._setTextContent(this._content as string);
    }
  }
}
