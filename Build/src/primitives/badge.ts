import { SazamiComponent, component } from "./base";
import { SIZE_PADDING_RULES, VARIANT_BG_RULES, SHAPE_RULES } from "./shared";
import { Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindText } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-tiny) var(--saz-space-small);
  border-radius: var(--saz-radius-round);
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  line-height: 1;
  white-space: nowrap;
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
  border: 1px solid var(--saz-color-border);
}
${SIZE_PADDING_RULES}
${VARIANT_BG_RULES}
${SHAPE_RULES}
`;

// Config
const badgeConfig = {
  properties: {
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
    shape: { type: "string" as const, reflect: true },
  },
} as const;

@component(badgeConfig)
export class SazamiBadge extends SazamiComponent<typeof badgeConfig> {
  declare size: string;
  declare variant: string;
  declare shape: string;

  private _contentSignal: Readable<string> | null = null;
  private _textNode: Text | null = null;
  private _textContent: string = "";
  private _contentDispose: (() => void) | null = null;

  private _isReadable(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set content(value: string | Readable<string>) {
    if (this._contentDispose) {
      this._contentDispose();
      this._contentDispose = null;
    }
    if (this._isReadable(value)) {
      this._contentSignal = value;
      if (this._textNode) {
        const dispose = bindText(this._textNode, value);
        this._contentDispose = dispose;
        this.onCleanup(dispose);
      }
    } else {
      this._contentSignal = null;
      this._textContent = value;
      if (this._textNode) {
        this._textNode.textContent = value ?? "";
      }
    }
  }

  get content(): string | Readable<string> | undefined {
    return this._contentSignal || this._textContent;
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);

    const slot = this.shadow.querySelector("slot");
    if (slot) {
      const initialText = this._contentSignal
        ? this._contentSignal.get()
        : (this._textContent ?? "");
      this._textNode = document.createTextNode(initialText);
      slot.replaceWith(this._textNode);
    }

    if (this._contentSignal && !this._contentDispose) {
      const dispose = bindText(this._textNode!, this._contentSignal);
      this._contentDispose = dispose;
      this.onCleanup(dispose);
    }
  }
}
