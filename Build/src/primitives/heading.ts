import { SazamiComponent, component } from "./base";
import { SIZE_RULES, TYPO_WEIGHT, TYPO_TONE } from "./shared";
import { Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindText } from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  font-size: var(--saz-text-size-xlarge);
  font-weight: var(--saz-text-weight-bold);
  line-height: var(--saz-text-leading-tight);
  color: inherit;
  margin: 0 0 var(--saz-space-small) 0;
}
${SIZE_RULES}
${TYPO_WEIGHT}
${TYPO_TONE}
`;

const headingConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
    weight: { type: "string" as const, reflect: false },
    tone: { type: "string" as const, reflect: false },
  },
} as const;

@component(headingConfig)
export class SazamiHeading extends SazamiComponent<typeof headingConfig> {
  declare size: string;
  declare weight: string;
  declare tone: string;

  private _content: string | Readable<string> = "";
  private _contentSignal: Readable<string> | null = null;
  private _textNode: Text | null = null;

  private _isReadable(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set content(value: string | Readable<string>) {
    this._content = value;

    if (this._isReadable(value)) {
      this._contentSignal = value;
      this._setupSignalBinding();
    } else {
      this._contentSignal = null;
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

  private _setupSignalBinding() {
    const textNode = this._textNode;
    if (!textNode) return;

    const dispose = bindText(textNode, this._contentSignal!);
    this.onCleanup(dispose);
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);

    const slot = this.shadow.querySelector("slot");
    if (slot) {
      this._textNode = document.createTextNode("");
      slot.replaceWith(this._textNode);
    } else {
      this._textNode = this.shadow.appendChild(document.createTextNode(""));
    }

    if (this._contentSignal) {
      this._setupSignalBinding();
    } else {
      this._setTextContent(this._content as string);
    }
  }
}
