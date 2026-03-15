import { SazamiComponent, component } from "./base";
import { VARIANT_TEXT_RULES } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium);
  height: var(--saz-icon-size-medium);
  color: inherit;
  line-height: 1;
}
:host([size="small"]) {
  width: var(--saz-icon-size-small);
  height: var(--saz-icon-size-small);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large);
  height: var(--saz-icon-size-large);
}
:host([size="xlarge"]) {
  width: var(--saz-icon-size-xlarge);
  height: var(--saz-icon-size-xlarge);
}
${VARIANT_TEXT_RULES}
svg { width: 100%; height: 100%; }
`;

const iconConfig = {
  properties: {
    icon: { type: "string" as const, reflect: true },
    size: { type: "string" as const, reflect: true },
    variant: { type: "string" as const, reflect: true },
  },
} as const;

@component(iconConfig)
export class SazamiIcon extends SazamiComponent<typeof iconConfig> {
  declare icon: string;
  declare size: string;
  declare variant: string;

  render() {
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];

    if (svg) {
      this.mount(STYLES, svg);
    } else {
      this.mount(STYLES, `<span>${escapeHtml(icon)}</span>`);
    }
  }
}
