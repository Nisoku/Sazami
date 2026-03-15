import { SazamiComponent, component } from "./base";
import { SHAPE_RULES, SIZE_RULES } from "./shared";
import { escapeHtml } from "../escape";

const STYLES = `
:host {
  display: block;
  overflow: hidden;
  border-radius: var(--saz-radius-medium);
  line-height: 0;
}
img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
${SHAPE_RULES}
:host([size="small"])  { max-width: 120px; }
:host([size="medium"]) { max-width: 240px; }
:host([size="large"])  { max-width: 480px; }
:host([size="xlarge"]) { max-width: 640px; }
`;

const imageConfig = {
  properties: {
    src: { type: "string" as const, reflect: false },
    alt: { type: "string" as const, reflect: false },
    size: { type: "string" as const, reflect: true },
    shape: { type: "string" as const, reflect: true },
  },
} as const;

@component(imageConfig)
export class SazamiImage extends SazamiComponent<typeof imageConfig> {
  declare src: string;
  declare alt: string;
  declare size: string;
  declare shape: string;

  render() {
    const src = this.getAttribute("src") || this.textContent?.trim() || "";
    if (!src) {
      this.mount(STYLES, "");
      return;
    }
    const alt = this.getAttribute("alt") || "";

    this.mount(
      STYLES,
      `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`,
    );
  }

  static get observedAttributes() {
    return [...super.observedAttributes, "src", "alt"];
  }
}
