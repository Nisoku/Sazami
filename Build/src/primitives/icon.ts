import { SazamiComponent, component } from "./base";
import { VARIANT_TEXT_RULES } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";
import { Signal, Derived, isSignal, effect, type Readable } from "@nisoku/sairin";

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

  private _isReadableStr(value: unknown): value is Readable<string> {
    return isSignal(value) || value instanceof Derived;
  }

  set icon(value: string | Readable<string>) {
    if (this._isReadableStr(value)) {
      this._iconSignal = value;
      this._setupIconBinding();
    } else {
      this._iconSignal = null;
      (this as any)._icon = value;
      this._updateIcon(value);
    }
  }

  get icon(): string | Readable<string> {
    return this._iconSignal || (this as any)._icon || "";
  }

  private _updateIcon(iconName: string) {
    if (this._iconElement) {
      const svg = ICON_SVGS[iconName];
      if (svg) {
        this._iconElement.innerHTML = svg;
      } else {
        this._iconElement.innerHTML = `<span>${escapeHtml(iconName)}</span>`;
      }
    }
  }

  private _setupIconBinding() {
    if (!this._iconElement) return;

    const sig = this._iconSignal!;
    const el = this._iconElement;
    this.onCleanup(
      effect(() => {
        const iconName = sig.get();
        const svg = ICON_SVGS[iconName];
        if (svg) {
          el.innerHTML = svg;
        } else {
          el.innerHTML = `<span>${escapeHtml(iconName)}</span>`;
        }
      })
    );
  }

  render() {
    const iconName = this._iconSignal ? this._iconSignal.get() : ((this as any)._icon || this.getAttribute("icon") || this.textContent?.trim() || "");
    const svg = ICON_SVGS[iconName];

    if (svg) {
      this.mount(STYLES, svg);
    } else {
      this.mount(STYLES, `<span>${escapeHtml(iconName)}</span>`);
    }

    this._iconElement = (this.shadowRoot?.querySelector("svg") || this.shadowRoot?.querySelector("span")) as HTMLElement | null;

    if (this._iconSignal) {
      this._setupIconBinding();
    }
  }
}
