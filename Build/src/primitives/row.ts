import { SazamiComponent, component } from "./base";
import { GAP_RULES } from "./shared";

const STYLES = `
:host {
  display: flex;
  flex-direction: row;
  gap: var(--saz-space-medium);
  align-items: center;
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([justify="flex-end"])      { justify-content: flex-end; }
:host([justify="space-around"])  { justify-content: space-around; }
:host([justify="space-evenly"])  { justify-content: space-evenly; }
:host([align="center"])    { align-items: center; }
:host([align="flex-end"])  { align-items: flex-end; }
:host([align="stretch"])   { align-items: stretch; }
:host([align="baseline"])  { align-items: baseline; }
:host([wrap])              { flex-wrap: wrap; }
`;

const rowConfig = {
  properties: {
    justify: { type: "string" as const, reflect: true },
    align: { type: "string" as const, reflect: true },
    wrap: { type: "boolean" as const, reflect: true },
    gap: { type: "string" as const, reflect: true },
  },
} as const;

@component(rowConfig)
export class SazamiRow extends SazamiComponent<typeof rowConfig> {
  declare justify: string;
  declare align: string;
  declare wrap: boolean;
  declare gap: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
