import { SazamiComponent, component } from "./base";
import { GAP_RULES, VARIANT_BG_RULES } from "./shared";
import { Signal, Derived, isSignal, type Readable } from "@nisoku/sairin";

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
  background: var(--saz-color-surface);
  border: 1px solid var(--saz-color-border);
  padding: var(--saz-space-large);
  border-radius: var(--saz-radius-medium);
  box-shadow: var(--saz-shadow-soft);
  color: var(--saz-color-text);
  transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.2s ease;
  gap: var(--saz-space-large);
}
:host(:hover) { box-shadow: var(--saz-shadow-medium); }
${GAP_RULES}
:host([layout="row"])    { flex-direction: row; }
:host([layout="column"]) { flex-direction: column; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([size="small"])  { padding: var(--saz-space-small); }
:host([size="medium"]) { padding: var(--saz-space-medium); }
:host([size="large"])  { padding: var(--saz-space-large); }
:host([size="xlarge"]) { padding: var(--saz-space-xlarge); }
${VARIANT_BG_RULES}
`;

const cardConfig = {
  properties: {
    layout: { type: "string" as const, reflect: false },
    align: { type: "string" as const, reflect: false },
    justify: { type: "string" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
    gap: { type: "string" as const, reflect: false },
  },
} as const;

@component(cardConfig)
export class SazamiCard extends SazamiComponent<typeof cardConfig> {
  declare layout: string;
  declare align: string;
  declare justify: string;
  declare size: string;
  declare variant: string;
  declare gap: string;

  private _loadingSignal: Readable<boolean> | null = null;
  private _contentSlot: HTMLElement | null = null;

  private _isReadableBool(value: unknown): value is Readable<boolean> {
    return isSignal(value) || value instanceof Derived;
  }

  set loading(value: boolean | Readable<boolean>) {
    if (this._isReadableBool(value)) {
      this._loadingSignal = value;
      this.bindDisabled(":host", value);
    } else {
      this._loadingSignal = null;
      if (value) {
        this.setAttribute("loading", "");
      } else {
        this.removeAttribute("loading");
      }
    }
  }

  get loading(): boolean | Readable<boolean> {
    return this._loadingSignal || this.hasAttribute("loading");
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);
    this._contentSlot = this.shadowRoot?.querySelector("slot") || null;
  }
}
