import { SazamiComponent, component } from "./base";

const STYLES = `
:host { display: block; flex: 1; }
:host([size="small"])  { flex: none; width: var(--saz-space-small); height: var(--saz-space-small); }
:host([size="medium"]) { flex: none; width: var(--saz-space-medium); height: var(--saz-space-medium); }
:host([size="large"])  { flex: none; width: var(--saz-space-large); height: var(--saz-space-large); }
:host([size="xlarge"]) { flex: none; width: var(--saz-space-xlarge); height: var(--saz-space-xlarge); }
`;

const spacerConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
  },
} as const;

@component(spacerConfig)
export class SazamiSpacer extends SazamiComponent<typeof spacerConfig> {
  declare size: string;

  render() {
    this.mount(STYLES, "");
  }
}
