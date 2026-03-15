import { SazamiComponent, component } from "./base";
import { SIZE_RULES, TYPO_WEIGHT, TYPO_TONE } from "./shared";

const STYLES = `
:host {
  display: block;
  font-size: var(--saz-text-size-medium);
  font-weight: var(--saz-text-weight-normal);
  line-height: var(--saz-text-leading-normal);
  color: inherit;
}
${SIZE_RULES}
${TYPO_WEIGHT}
${TYPO_TONE}
:host([leading="tight"])  { line-height: var(--saz-text-leading-tight); }
:host([leading="normal"]) { line-height: var(--saz-text-leading-normal); }
:host([leading="loose"])  { line-height: var(--saz-text-leading-loose); }
`;

const textConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
    weight: { type: "string" as const, reflect: false },
    tone: { type: "string" as const, reflect: false },
    leading: { type: "string" as const, reflect: false },
  },
} as const;

@component(textConfig)
export class SazamiText extends SazamiComponent<typeof textConfig> {
  declare size: string;
  declare weight: string;
  declare tone: string;
  declare leading: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
