import { baseStyles } from "./shared";

export class SazamiImage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const src = this.getAttribute("src") || this.textContent?.trim() || "";
    const alt = this.getAttribute("alt") || "";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  overflow: hidden;
  border-radius: var(--saz-radius-medium, 8px);
  line-height: 0;
}
img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
:host([shape="round"]) { border-radius: var(--saz-radius-round, 9999px); }
:host([shape="square"]) { border-radius: var(--saz-radius-none, 0); }
:host([size="small"])  { max-width: 120px; }
:host([size="medium"]) { max-width: 240px; }
:host([size="large"])  { max-width: 480px; }
`) + `<img src="${src}" alt="${alt}" />`;
  }
}
