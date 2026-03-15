import { SazamiComponent, component } from "./base";
import { VARIANT_BG_RULES } from "./shared";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-small) var(--saz-space-medium);
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
  border: 1px solid var(--saz-color-border);
}
${VARIANT_BG_RULES}
`;

const tagConfig = {
  properties: {
    variant: { type: "string" as const, reflect: true },
  },
} as const;

@component(tagConfig)
export class SazamiTag extends SazamiComponent<typeof tagConfig> {
  declare variant: string;

  render() {
    this.mount(STYLES, `<slot></slot>`);
  }
}
