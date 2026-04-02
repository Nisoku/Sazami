import { SazamiComponent, component } from "./base";
import { SHAPE_RULES } from "./shared";
import { escapeHtml } from "../escape";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindProperty } from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  width: 64px;
  height: 64px;
  border-radius: var(--saz-radius-medium);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--saz-color-border);
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
${SHAPE_RULES}
:host([size="small"])  { width: 40px; height: 40px; }
:host([size="medium"]) { width: 64px; height: 64px; }
:host([size="large"])  { width: 96px; height: 96px; }
:host([size="xlarge"]) { width: 128px; height: 128px; }
`;

const coverartConfig = {
  properties: {
    alt: { type: "string" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    shape: { type: "string" as const, reflect: false },
  },
} as const;

@component(coverartConfig)
export class SazamiCoverart extends SazamiComponent<typeof coverartConfig> {
  declare alt: string;
  declare size: string;
  declare shape: string;

  private _srcSignal: Readable<string> | null = null;
  private _imgElement: HTMLImageElement | null = null;
  private _pendingSrc: string | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set src(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._srcSignal = value;
      this._pendingSrc = null;
      this._setupSrcBinding();
    } else {
      this._srcSignal = null;
      this._pendingSrc = value;
      (this as any)._src = value;
      this._updateSrc(value);
    }
  }

  get src(): string | Readable<string> {
    return this._srcSignal || (this as any)._src || "";
  }

  private _updateSrc(value: string) {
    if (this._imgElement) {
      this._imgElement.src = value;
    }
  }

  private _setupSrcBinding() {
    if (!this._imgElement) return;

    const dispose = bindProperty(this._imgElement, "src", this._srcSignal!);
    this.onCleanup(dispose);
  }

  render() {
    const currentSrc = this._srcSignal 
      ? this._srcSignal.get() 
      : (this._pendingSrc || (this as any)._src || this.getAttribute("src") || this.textContent?.trim() || "");
    const alt = this.getAttribute("alt") || "Cover art";

    this.mount(
      STYLES,
      currentSrc ? `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />` : "",
    );

    this._imgElement = this.$("img");

    if (this._pendingSrc) {
      this._updateSrc(this._pendingSrc);
      this._pendingSrc = null;
    }

    if (this._srcSignal) {
      this._setupSrcBinding();
    }
  }
}
