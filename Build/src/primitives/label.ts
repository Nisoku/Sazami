import { SazamiComponent, component } from "./base";

const STYLES = `
:host {
  display: block;
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  color: var(--saz-color-text-dim);
  margin-bottom: var(--saz-space-tiny);
  line-height: var(--saz-text-leading-normal);
  cursor: default;
  user-select: none;
}
`;

const labelConfig = {
  properties: {
    for: { type: "string" as const, reflect: true },
  },
} as const;

@component(labelConfig)
export class SazamiLabel extends SazamiComponent<typeof labelConfig> {
  declare for: string;

  render() {
    const forAttr = this.getAttribute("for");
    const labelContent = forAttr
      ? `<label for="${forAttr}"><slot></slot></label>`
      : `<label><slot></label>`;

    this.mount(STYLES, labelContent);
  }
}
