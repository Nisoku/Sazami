import { SazamiComponent, component } from "./base";
import { VARIANT_TEXT_RULES } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";
import {
  Signal,
  Derived,
  isSignal,
  effect,
  type Readable,
} from "@nisoku/sairin";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium);
  height: var(--saz-icon-size-medium);
  color: inherit;
  line-height: 1;
}
:host([size="small"]) {
  width: var(--saz-icon-size-small);
  height: var(--saz-icon-size-small);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large);
  height: var(--saz-icon-size-large);
}
:host([size="xlarge"]) {
  width: var(--saz-icon-size-xlarge);
  height: var(--saz-icon-size-xlarge);
}
${VARIANT_TEXT_RULES}
svg { width: 100%; height: 100%; }
`;

const iconConfig = {
  properties: {
    icon: { type: "string" as const, reflect: true },
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
  },
} as const;

@component(iconConfig)
export class SazamiIcon extends SazamiComponent<typeof iconConfig> {
  declare size: string;
  declare variant: string;

  private _iconSignal: Readable<string> | null = null;
  private _iconElement: HTMLElement | null = null;
  private _iconEffectDispose: (() => void) | null = null;

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set icon(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._iconSignal = value;
      if (this._iconElement) {
        this._setupIconBinding();
      }
    } else {
      this._iconSignal = null;
      if (this._iconEffectDispose) {
        this._iconEffectDispose();
        this._iconEffectDispose = null;
      }
      (this as any)._icon = value;
      this._updateIcon(value);
    }
  }

  get icon(): string | Readable<string> {
    return this._iconSignal || (this as any)._icon || "";
  }

  private _updateIcon(iconName: string) {
    if (!this._iconElement) return;
    const svg = ICON_SVGS[iconName];
    const isSvg = !!svg;
    const currentIsSvg = this._iconElement.tagName.toLowerCase() === "svg";

    if (isSvg !== currentIsSvg) {
      const parent = this._iconElement.parentNode;
      let newElement: HTMLElement;
      if (svg) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = svg;
        newElement = wrapper.firstElementChild as HTMLElement;
      } else {
        newElement = document.createElement("span");
        newElement.textContent = iconName;
      }
      parent?.replaceChild(newElement, this._iconElement);
      this._iconElement = newElement;
    } else if (svg) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = svg;
      const newSvg = wrapper.firstElementChild as HTMLElement;
      this._iconElement.innerHTML = newSvg.innerHTML;
    } else {
      this._iconElement.textContent = iconName;
    }
  }

  private _setupIconBinding() {
    if (!this._iconElement || !this._iconSignal) return;

    if (this._iconEffectDispose) {
      this._iconEffectDispose();
    }

    const sig = this._iconSignal;
    const el = this._iconElement;
    const dispose = effect(() => {
      const iconName = sig.get();
      const svg = ICON_SVGS[iconName];
      const isSvg = !!svg;
      const currentIsSvg = el.tagName.toLowerCase() === "svg";

      if (isSvg !== currentIsSvg) {
        const parent = el.parentNode;
        let newElement: HTMLElement;
        if (svg) {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = svg;
          newElement = wrapper.firstElementChild as HTMLElement;
        } else {
          newElement = document.createElement("span");
          newElement.textContent = iconName;
        }
        parent?.replaceChild(newElement, el);
        this._iconElement = newElement;
      } else if (svg) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = svg;
        const newSvg = wrapper.firstElementChild as HTMLElement;
        el.innerHTML = newSvg.innerHTML;
      } else {
        el.textContent = iconName;
      }
    });
    this._iconEffectDispose = dispose;
    this.onCleanup(dispose);
  }

  render() {
    const iconName = this._iconSignal
      ? this._iconSignal.get()
      : (this as any)._icon ||
        this.getAttribute("icon") ||
        this.textContent?.trim() ||
        "";
    const svg = ICON_SVGS[iconName];

    if (svg) {
      this.mountSync(STYLES, svg);
    } else {
      this.mountSync(STYLES, `<span>${escapeHtml(iconName)}</span>`);
    }

    this._iconElement = (this.shadowRoot?.querySelector("svg") ||
      this.shadowRoot?.querySelector("span")) as HTMLElement | null;

    if (this._iconSignal) {
      this._setupIconBinding();
    }
  }
}
