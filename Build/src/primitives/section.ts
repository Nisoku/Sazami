import { SazamiComponent, component } from "./base";
import { GAP_RULES } from "./shared";

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
`;

const sectionConfig = {
  properties: {
    layout: { type: "string" as const, reflect: false },
    align: { type: "string" as const, reflect: false },
    gap: { type: "string" as const, reflect: false },
    "center-point": { type: "boolean" as const, reflect: false },
  },
} as const;

@component(sectionConfig)
export class SazamiSection extends SazamiComponent<typeof sectionConfig> {
  declare layout: string;
  declare align: string;
  declare gap: string;
  declare "center-point": boolean;

  private _resizeObserver?: ResizeObserver;

  private _computeAndSetCenter() {
    if (!this.hasAttribute("center-point")) return;
    const rect = this.getBoundingClientRect();
    this.dataset.centerX = (rect.left + rect.width / 2).toString();
    this.dataset.centerY = (rect.top + rect.height / 2).toString();
  }

  connectedCallback() {
    super.connectedCallback();
    const slot = this.shadowRoot?.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", this._computeAndSetCenter);
    }
    if (this.hasAttribute("center-point")) {
      this._resizeObserver = new ResizeObserver(() => {
        this._computeAndSetCenter();
      });
      this._resizeObserver.observe(this);
    }
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
    const slot = this.shadowRoot?.querySelector("slot");
    if (slot) {
      slot.removeEventListener("slotchange", this._computeAndSetCenter);
    }
    super.disconnectedCallback();
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);

    if (this.hasAttribute("center-point")) {
      requestAnimationFrame(() => {
        this._computeAndSetCenter();
      });
    }
  }

  static get observedAttributes() {
    return ["center-point"];
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    if (name === "center-point" && oldVal !== newVal) {
      if (newVal !== null) {
        requestAnimationFrame(() => {
          this._computeAndSetCenter();
        });
        if (!this._resizeObserver) {
          this._resizeObserver = new ResizeObserver(() => {
            this._computeAndSetCenter();
          });
          this._resizeObserver.observe(this);
        }
      } else {
        if (this._resizeObserver) {
          this._resizeObserver.disconnect();
          this._resizeObserver = undefined;
        }
        delete this.dataset.centerX;
        delete this.dataset.centerY;
      }
    }
  }
}
