import { SazamiComponent, component } from "./base";
import { SIZE_PADDING_RULES, VARIANT_BG_RULES, SHAPE_RULES } from "./shared";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-tiny) var(--saz-space-small);
  border-radius: var(--saz-radius-round);
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  line-height: 1;
  white-space: nowrap;
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
  border: 1px solid var(--saz-color-border);
}
${SIZE_PADDING_RULES}
${VARIANT_BG_RULES}
${SHAPE_RULES}
`;

// Config
const badgeConfig = {
  properties: {
    size: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
    shape: { type: "string" as const, reflect: false },
  },
} as const;

@component(badgeConfig)
export class SazamiBadge extends SazamiComponent<typeof badgeConfig> {
  declare size: string;
  declare variant: string;
  declare shape: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
