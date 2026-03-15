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
    layout: { type: "string" as const, reflect: true },
    align: { type: "string" as const, reflect: true },
    gap: { type: "string" as const, reflect: true },
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
  private _boundComputeAndSetCenter = this._computeAndSetCenter.bind(this);
  private _slot?: HTMLSlotElement;

  private _computeAndSetCenter() {
    if (!this.hasAttribute("center-point")) return;
    const rect = this.getBoundingClientRect();
    this.dataset.centerX = (rect.left + rect.width / 2).toString();
    this.dataset.centerY = (rect.top + rect.height / 2).toString();
  }

  private _attachSlotListener() {
    const slot = this.shadowRoot?.querySelector(
      "slot",
    ) as HTMLSlotElement | null;
    if (this._slot) {
      this._slot.removeEventListener(
        "slotchange",
        this._boundComputeAndSetCenter,
      );
    }
    if (slot) {
      slot.addEventListener("slotchange", this._boundComputeAndSetCenter);
      this._slot = slot;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._attachSlotListener();
    this._setupResizeObserver();
  }

  private _setupResizeObserver() {
    if (!this.hasAttribute("center-point")) return;
    if (this._resizeObserver) return;
    this._resizeObserver = new ResizeObserver(() => {
      this._computeAndSetCenter();
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
    if (this._slot) {
      this._slot.removeEventListener(
        "slotchange",
        this._boundComputeAndSetCenter,
      );
      this._slot = undefined;
    }
    super.disconnectedCallback();
  }

  render() {
    this.mount(STYLES, `<slot></slot>`);
    this._attachSlotListener();

    if (this.hasAttribute("center-point")) {
      requestAnimationFrame(() => {
        this._computeAndSetCenter();
      });
    }
  }

  static get observedAttributes() {
    return ["center-point"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "center-point" && oldVal !== newVal) {
      if (newVal !== null) {
        requestAnimationFrame(() => {
          this._computeAndSetCenter();
        });
        this._setupResizeObserver();
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
