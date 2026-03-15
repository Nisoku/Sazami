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

  render() {
    this.mount(STYLES, `<slot></slot>`);

    if (this.hasAttribute("center-point")) {
      requestAnimationFrame(() => {
        const rect = this.getBoundingClientRect();
        this.dataset.centerX = (rect.left + rect.width / 2).toString();
        this.dataset.centerY = (rect.top + rect.height / 2).toString();
      });
    }
  }
}
