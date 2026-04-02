import { SazamiComponent, component } from "./base";
import { VARIANT_BG_RULES } from "./shared";
import { Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindText } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-small) var(--saz-space-medium);
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
  border: 1px solid var(--saz-color-border);
}
${VARIANT_BG_RULES}
`;

const tagConfig = {
  properties: {
    variant: { type: "string" as const, reflect: true },
  },
} as const;

@component(tagConfig)
export class SazamiTag extends SazamiComponent<typeof tagConfig> {
  private _content: string | Readable<string> = "";
  private _contentSignal: Readable<string> | null = null;
  private _textNode: Text | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set content(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._contentSignal = value;
      this._setupContentBinding();
    } else {
      this._contentSignal = null;
      this._content = value;
      this._updateContent(value);
    }
  }

  get content(): string | Readable<string> {
    return this._contentSignal || this._content;
  }

  private _updateContent(value: string) {
    if (this._textNode) {
      this._textNode.textContent = value ?? "";
    }
  }

  private _setupContentBinding() {
    if (!this._textNode) return;

    const dispose = bindText(this._textNode, this._contentSignal!);
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
      this._setupContentBinding();
    } else {
      this._updateContent(this._content as string);
    }
  }
}
