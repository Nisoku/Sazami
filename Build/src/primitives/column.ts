import { SazamiComponent, component } from "./base";
import { GAP_RULES } from "./shared";

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium);
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
`;

const columnConfig = {
  properties: {
    justify: { type: "string" as const, reflect: false },
    align: { type: "string" as const, reflect: false },
    gap: { type: "string" as const, reflect: false },
  },
} as const;

@component(columnConfig)
export class SazamiColumn extends SazamiComponent<typeof columnConfig> {
  declare justify: string;
  declare align: string;
  declare gap: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
