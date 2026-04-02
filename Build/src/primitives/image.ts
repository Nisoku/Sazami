import { SazamiComponent, component } from "./base";
import { SHAPE_RULES, SIZE_RULES } from "./shared";
import { escapeHtml } from "../escape";
import { Derived, isSignal, type Readable } from "@nisoku/sairin";
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
  private _srcDispose: (() => void) | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set src(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._srcSignal = value;
      this._pendingSrc = null;
      if (!this._imgElement) {
        this._createImageElement();
      }
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
    if (!value) {
      if (this._srcDispose) {
        this._srcDispose();
        this._srcDispose = null;
      }
      this._imgElement = null;
      return;
    }
    if (!this._imgElement) {
      this._createImageElement();
    }
    if (this._imgElement) {
      this._imgElement.src = value;
    }
  }

  private _createImageElement() {
    const alt = this.alt || "";
    const currentSrc = this._getCurrentSrc();
    this.mountSync(
      STYLES,
      `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />`,
    );
    this._imgElement = this.$("img");
  }

  private _setupSrcBinding() {
    if (!this._imgElement) return;

    if (this._srcDispose) {
      this._srcDispose();
    }
    const dispose = bindProperty(this._imgElement, "src", this._srcSignal!);
    this._srcDispose = dispose;
  }

  private _getCurrentSrc(): string {
    if (this._srcSignal) return this._srcSignal.get();
    if (this._pendingSrc) return this._pendingSrc;
    if ((this as any)._src) return (this as any)._src;
    return this.getAttribute("src") || "";
  }

  render() {
    const currentSrc = this._getCurrentSrc();
    if (!currentSrc) {
      if (this._srcDispose) {
        this._srcDispose();
        this._srcDispose = null;
      }
      this._imgElement = null;
      this.mountSync(STYLES, "");
      return;
    }
    const alt = this.alt || "";

    this.mountSync(
      STYLES,
      `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />`,
    );

    this._imgElement = this.$("img");

    if (this._srcSignal) {
      this._setupSrcBinding();
    }
  }
}
