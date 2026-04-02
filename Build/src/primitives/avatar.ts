import { SazamiComponent, component } from "./base";
import { SHAPE_RULES } from "./shared";
import { Derived, isSignal, effect, type Readable } from "@nisoku/sairin";
import { bindProperty } from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
  font-weight: 600;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  font-size: 14px;
}
:host([size="tiny"])   { width: 24px; height: 24px; font-size: 10px; }
:host([size="small"])  { width: 32px; height: 32px; font-size: 12px; }
:host([size="medium"]) { width: 40px; height: 40px; font-size: 14px; }
:host([size="large"])  { width: 56px; height: 56px; font-size: 20px; }
:host([size="xlarge"]) { width: 80px; height: 80px; font-size: 28px; }
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.initials {
  text-transform: uppercase;
  user-select: none;
}
${SHAPE_RULES}
`;

const avatarConfig = {
  properties: {
    alt: { type: "string" as const, reflect: true },
    initials: { type: "string" as const, reflect: true },
    size: { type: "string" as const, reflect: true },
    shape: { type: "string" as const, reflect: true },
  },
  structuralRoots: {
    image: "img",
    initials: "span",
  },
} as const;

@component(avatarConfig)
export class SazamiAvatar extends SazamiComponent<typeof avatarConfig> {
  private _srcSignal: Readable<string> | null = null;
  private _imgElement: HTMLImageElement | null = null;
  private _initialsElement: HTMLElement | null = null;
  private _srcDisposer: (() => void) | null = null;
  private _modeEffectDisposer: (() => void) | null = null;
  private _altObserver: MutationObserver | null = null;
  private _isImageMode: boolean = false;

  protected getRenderMode(): string {
    return this._isImageMode ? "image" : "initials";
  }

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  private _disposeSrcBinding() {
    if (this._srcDisposer) {
      this._srcDisposer();
      this._srcDisposer = null;
    }
    if (this._modeEffectDisposer) {
      this._modeEffectDisposer();
      this._modeEffectDisposer = null;
    }
    if (this._altObserver) {
      this._altObserver.disconnect();
      this._altObserver = null;
    }
  }

  private _getCurrentSrc(): string {
    if (this._srcSignal) return this._srcSignal.get();
    if ((this as any)._src) return (this as any)._src;
    return this.getAttribute("src") || "";
  }

  private _isImageModeNow(): boolean {
    return !!this._getCurrentSrc();
  }

  set src(value: string | Readable<string>) {
    const wasImageMode = this._isImageMode;
    const hasReadable = this._isReadableStr(value);

    if (hasReadable) {
      this._srcSignal = value;
      (this as any)._src = undefined;
    } else {
      this._srcSignal = null;
      (this as any)._src = value;
    }

    const nowImageMode = this._isImageModeNow();

    if (this._isImageMode !== nowImageMode) {
      this._disposeSrcBinding();
      this.render();
      return;
    }

    if (nowImageMode && this._imgElement) {
      this._disposeSrcBinding();
      this._setupSrcBinding();
      if (!this._srcSignal && this._imgElement) {
        this._imgElement.src = (this as any)._src || "";
        this._imgElement.alt = this.getAttribute("alt") || "";
      }
    } else if (!nowImageMode && this._initialsElement) {
      this._disposeSrcBinding();
      this._updateDisplay();
      this._setupSignalWatcher();
    } else if (!this._imgElement && !this._initialsElement) {
      this.render();
    }
  }

  get src(): string | Readable<string> {
    return this._srcSignal || (this as any)._src || "";
  }

  private _setupSrcBinding() {
    if (!this._imgElement || !this._srcSignal) return;

    const img = this._imgElement;
    const sig = this._srcSignal;

    img.src = sig.get();
    this._srcDisposer = bindProperty(img, "src", sig);
    this.onCleanup(this._srcDisposer);

    img.alt = this.getAttribute("alt") || "";

    this._altObserver = new MutationObserver(() => {
      img.alt = this.getAttribute("alt") || "";
    });
    this._altObserver.observe(this, {
      attributes: true,
      attributeFilter: ["alt"],
    });
    this.onCleanup(() => this._altObserver?.disconnect());

    let previousSrc = sig.get();
    const checkModeChange = () => {
      const currentSrc = sig.get();
      const shouldBeImageMode = !!currentSrc;
      if (this._isImageMode !== shouldBeImageMode) {
        this._disposeSrcBinding();
        this.render();
      }
      previousSrc = currentSrc;
    };

    this._modeEffectDisposer = effect(() => {
      sig.get();
      checkModeChange();
    });
    this.onCleanup(this._modeEffectDisposer);
  }

  private _updateDisplay() {
    const currentSrc = this._getCurrentSrc();
    const alt = this.getAttribute("alt") || "";
    const textContent = this.textContent?.trim() || "";
    const initialsAttr = this.getAttribute("initials") || "";
    const initials = initialsAttr || this._getInitials(alt || textContent);

    if (this._isImageMode) {
      if (this._imgElement) {
        this._imgElement.src = currentSrc;
        this._imgElement.alt = alt;
        this._imgElement.style.display = "block";
      }
      if (this._initialsElement) {
        this._initialsElement.style.display = "none";
      }
    } else {
      if (this._initialsElement) {
        this._initialsElement.textContent = initials;
        this._initialsElement.style.display = "";
      }
      if (this._imgElement) {
        this._imgElement.style.display = "none";
      }
    }
  }

  render() {
    const currentSrc = this._getCurrentSrc();
    this._isImageMode = !!currentSrc;

    if (this._isImageMode) {
      this.mount(STYLES, `<img class="image" alt="" />`);
      this._imgElement = this.$(".image");
      this._initialsElement = null;

      if (this._srcSignal) {
        this._setupSrcBinding();
      }
    } else {
      this.mount(STYLES, `<span class="initials"></span>`);
      this._imgElement = null;
      this._initialsElement = this.$(".initials");
      this._updateDisplay();

      if (this._srcSignal) {
        this._setupSignalWatcher();
      }
    }
  }

  private _setupSignalWatcher() {
    if (!this._srcSignal) return;

    if (this._modeEffectDisposer) {
      this._modeEffectDisposer();
    }

    const sig = this._srcSignal;
    this._modeEffectDisposer = effect(() => {
      const currentSrc = sig.get();
      const shouldBeImageMode = !!currentSrc;
      if (this._isImageMode !== shouldBeImageMode) {
        this._disposeSrcBinding();
        this.render();
      }
    });
    this.onCleanup(this._modeEffectDisposer);
  }

  private _getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
  }
}
