import { baseStyles } from "./shared";

export class SazamiCoverart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const src = this.getAttribute("src") || this.textContent?.trim() || "";
    const alt = this.getAttribute("alt") || "Cover art";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: block;
  width: 64px;
  height: 64px;
  border-radius: var(--saz-radius-medium, 8px);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--saz-color-border, #e0e0e0);
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
:host([shape="round"]) { border-radius: var(--saz-radius-round, 9999px); }
:host([size="small"])  { width: 40px; height: 40px; }
:host([size="medium"]) { width: 64px; height: 64px; }
:host([size="large"])  { width: 96px; height: 96px; }
`) + (src ? `<img src="${src}" alt="${alt}" />` : "");
  }
}
