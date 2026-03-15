import { SazamiComponent, component } from "./base";
import { GAP_RULES } from "./shared";

const STYLES = `
:host {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--saz-space-medium);
}
${GAP_RULES}
:host([cols="1"]) { grid-template-columns: repeat(1, minmax(0, 1fr)); }
:host([cols="2"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
:host([cols="3"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
:host([cols="4"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
:host([cols="5"]) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
:host([cols="6"]) { grid-template-columns: repeat(6, minmax(0, 1fr)); }

@media (min-width: 768px) {
  :host([md\\:cols="1"]) { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  :host([md\\:cols="2"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  :host([md\\:cols="3"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  :host([md\\:cols="4"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  :host([md\\:cols="5"]) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  :host([md\\:cols="6"]) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  :host([lg\\:cols="1"]) { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  :host([lg\\:cols="2"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  :host([lg\\:cols="3"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  :host([lg\\:cols="4"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  :host([lg\\:cols="5"]) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  :host([lg\\:cols="6"]) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
`;

const gridConfig = {
  properties: {
    cols: { type: "string" as const, reflect: false },
    "md:cols": { type: "string" as const, reflect: false },
    "lg:cols": { type: "string" as const, reflect: false },
    gap: { type: "string" as const, reflect: false },
  },
} as const;

@component(gridConfig)
export class SazamiGrid extends SazamiComponent<typeof gridConfig> {
  declare cols: string;
  declare "md:cols": string;
  declare "lg:cols": string;
  declare gap: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
