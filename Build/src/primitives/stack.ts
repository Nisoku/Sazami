import { SazamiComponent, component } from "./base";
import { GAP_RULES } from "./shared";

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium);
}
${GAP_RULES}
:host([align="center"])  { align-items: center; }
:host([align="stretch"]) { align-items: stretch; }
`;

const stackConfig = {
  properties: {
    align: { type: "string" as const, reflect: false },
    gap: { type: "string" as const, reflect: false },
  },
} as const;

@component(stackConfig)
export class SazamiStack extends SazamiComponent<typeof stackConfig> {
  declare align: string;
  declare gap: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
