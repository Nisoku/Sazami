import { SazamiComponent, component } from "./base";
import { SIZE_RULES, TYPO_WEIGHT, TYPO_TONE } from "./shared";

const STYLES = `
:host {
  display: block;
  font-size: var(--saz-text-size-xlarge);
  font-weight: var(--saz-text-weight-bold);
  line-height: var(--saz-text-leading-tight);
  color: inherit;
  margin: 0 0 var(--saz-space-small) 0;
}
${SIZE_RULES}
${TYPO_WEIGHT}
${TYPO_TONE}
`;

const headingConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
    weight: { type: "string" as const, reflect: false },
    tone: { type: "string" as const, reflect: false },
  },
} as const;

@component(headingConfig)
export class SazamiHeading extends SazamiComponent<typeof headingConfig> {
  declare size: string;
  declare weight: string;
  declare tone: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
