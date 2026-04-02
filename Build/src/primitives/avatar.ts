import { SazamiComponent, component } from "./base";
import { SHAPE_RULES } from "./shared";
import { Derived, isSignal, type Readable } from "@nisoku/sairin";
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
} as const;

@component(avatarConfig)
export class SazamiAvatar extends SazamiComponent<typeof avatarConfig> {
  private _srcSignal: Readable<string> | null = null;
  private _imgElement: HTMLImageElement | null = null;
  private _initialsElement: HTMLElement | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set src(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._srcSignal = value;
      if (!this._imgElement && !this._initialsElement) {
        this.render();
      } else if (this._imgElement) {
        this._setupSrcBinding();
      }
    } else {
      this._srcSignal = null;
      (this as any)._src = value;
      if (!this._imgElement) {
        this.render();
      } else {
        this._updateDisplay();
      }
    }
  }

  get src(): string | Readable<string> {
    return this._srcSignal || (this as any)._src || "";
  }

  private _setupSrcBinding() {
    if (!this._imgElement) return;

    const img = this._imgElement;
    const sig = this._srcSignal!;

    this.onCleanup(bindProperty(img, "src", sig));

    img.alt = this.getAttribute("alt") || "";

    const observer = new MutationObserver(() => {
      img.alt = this.getAttribute("alt") || "";
    });
    observer.observe(this, { attributes: true, attributeFilter: ["alt"] });
    this.onCleanup(() => observer.disconnect());
  }

  private _updateDisplay() {
    const currentSrc = this._srcSignal
      ? this._srcSignal.get()
      : (this as any)._src || "";
    const alt = this.getAttribute("alt") || "";
    const textContent = this.textContent?.trim() || "";
    const initialsAttr = this.getAttribute("initials") || "";
    const initials = initialsAttr || this._getInitials(alt || textContent);

    if (currentSrc) {
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
    const currentSrc = this._srcSignal
      ? this._srcSignal.get()
      : (this as any)._src || "";

    if (currentSrc) {
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
    }
  }

  private _getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
  }
}
