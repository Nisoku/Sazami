import { SazamiComponent, component } from "./base";
import { Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindText } from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  color: var(--saz-color-text-dim);
  margin-bottom: var(--saz-space-tiny);
  line-height: var(--saz-text-leading-normal);
  cursor: default;
  user-select: none;
}
`;

const labelConfig = {
  properties: {
    for: { type: "string" as const, reflect: true },
  },
} as const;

@component(labelConfig)
export class SazamiLabel extends SazamiComponent<typeof labelConfig> {
  declare for: string;

  private _content: string | Readable<string> = "";
  private _contentSignal: Readable<string> | null = null;
  private _textNode: Text | null = null;
  private _contentDispose: (() => void) | null = null;

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
      if (this._contentDispose) {
        this._contentDispose();
        this._contentDispose = null;
      }
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

    if (this._contentDispose) {
      this._contentDispose();
    }
    const dispose = bindText(textNode, this._contentSignal!);
    this._contentDispose = dispose;
    this.onCleanup(dispose);
  }

  render() {
    this.mount(STYLES, `<label><slot></slot></label>`);

    const label = this.shadow.querySelector("label");
    if (label) {
      if (!this._textNode) {
        this._textNode = document.createTextNode("");
        label.prepend(this._textNode);
      }

      if (this._contentSignal) {
        this._setupSignalBinding();
      } else {
        this._setTextContent(this._content as string);
      }

      if (this.hasAttribute("for")) {
        label.setAttribute("for", this.getAttribute("for") || "");
      }
    }
  }
}
