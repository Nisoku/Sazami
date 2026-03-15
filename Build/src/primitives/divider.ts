import { SazamiComponent, component } from "./base";
import { VARIANT_BG_RULES } from "./shared";

const STYLES = `
:host {
  display: block;
  border: none;
  background: var(--saz-color-border);
  margin: var(--saz-space-medium) 0;
}
:host(:not([vertical])) { height: 1px; width: 100%; }
:host([vertical]) {
  width: 1px;
  height: 100%;
  margin: 0 var(--saz-space-medium);
  align-self: stretch;
}
:host([size="small"]) { margin: var(--saz-space-small) 0; }
:host([size="large"]) { margin: var(--saz-space-large) 0; }
:host([size="xlarge"]) { margin: var(--saz-space-xlarge) 0; }
:host([variant="dim"]) { background: var(--saz-color-surface); }
`;

const dividerConfig = {
  properties: {
    vertical: { type: "boolean" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
  },
} as const;

@component(dividerConfig)
export class SazamiDivider extends SazamiComponent<typeof dividerConfig> {
  declare vertical: boolean;
  declare size: string;
  declare variant: string;

  render() {
    this.mount(STYLES, "");
  }
}
