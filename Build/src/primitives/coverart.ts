import { SazamiComponent, component } from "./base";
import { SHAPE_RULES } from "./shared";
import { escapeHtml } from "../escape";

const STYLES = `
:host {
  display: block;
  width: 64px;
  height: 64px;
  border-radius: var(--saz-radius-medium);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--saz-color-border);
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
${SHAPE_RULES}
:host([size="small"])  { width: 40px; height: 40px; }
:host([size="medium"]) { width: 64px; height: 64px; }
:host([size="large"])  { width: 96px; height: 96px; }
:host([size="xlarge"]) { width: 128px; height: 128px; }
`;

const coverartConfig = {
  properties: {
    src: { type: "string" as const, reflect: false },
    alt: { type: "string" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    shape: { type: "string" as const, reflect: false },
  },
} as const;

@component(coverartConfig)
export class SazamiCoverart extends SazamiComponent<typeof coverartConfig> {
  declare src: string;
  declare alt: string;
  declare size: string;
  declare shape: string;

  render() {
    const src = this.getAttribute("src") || this.textContent?.trim() || "";
    const alt = this.getAttribute("alt") || "Cover art";

    this.mount(STYLES, src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />` : "");
  }
}
