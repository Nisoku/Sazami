import { SazamiComponent, component } from "./base";
import { SHAPE_RULES, SIZE_RULES } from "./shared";
import { escapeHtml } from "../escape";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";
import { bindProperty } from "@nisoku/sairin";

const STYLES = `
:host {
  display: block;
  overflow: hidden;
  border-radius: var(--saz-radius-medium);
  line-height: 0;
}
img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
${SHAPE_RULES}
:host([size="small"])  { max-width: 120px; }
:host([size="medium"]) { max-width: 240px; }
:host([size="large"])  { max-width: 480px; }
:host([size="xlarge"]) { max-width: 640px; }
`;

const imageConfig = {
  properties: {
    alt: { type: "string" as const, reflect: true },
    size: { type: "string" as const, reflect: true },
    shape: { type: "string" as const, reflect: true },
  },
} as const;

@component(imageConfig)
export class SazamiImage extends SazamiComponent<typeof imageConfig> {
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
      : (this._pendingSrc || (this as any)._src || this.getAttribute("src") || "");
    if (!currentSrc) {
      this.mount(STYLES, "");
      return;
    }
    const alt = this.alt || "";

    this.mount(
      STYLES,
      `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />`,
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
