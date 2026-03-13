import { baseStyles } from "./shared";

export class SazamiAvatar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const src = this.getAttribute("src") || "";
    const alt = this.getAttribute("alt") || "";
    const initialsAttr = this.getAttribute("initials") || "";
    const size = this.getAttribute("size") || "medium";
    const textContent = this.textContent?.trim() || "";
    const initials = initialsAttr || this.getInitials(alt || textContent);

    const sizeMap: Record<string, string> = {
      tiny: "24px",
      small: "32px",
      medium: "40px",
      large: "56px",
      xlarge: "80px",
    };

    const fontSize =
      {
        tiny: "10px",
        small: "12px",
        medium: "14px",
        large: "20px",
        xlarge: "28px",
      }[size] || "14px";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
  font-weight: 600;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  font-size: 14px;
}
:host([size="tiny"])   { width: 24px; height: 24px; font-size: 10px; }
:host([size="small"])  { width: 32px; height: 32px; font-size: 12px; }
:host([size="medium"]) { width: 40px; height: 40px; font-size: 14px; }
:host([size="large"])  { width: 56px; height: 56px; font-size: 20px; }
:host([size="xlarge"]) { width: 80px; height: 80px; font-size: 28px; }
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.initials {
  text-transform: uppercase;
  user-select: none;
}
:host([shape="square"]) { border-radius: var(--saz-radius-medium, 8px); }
:host([shape="rounded"]) { border-radius: var(--saz-radius-soft, 4px); }
`) +
      (src
        ? `<img class="image" src="${src}" alt="${alt}" />`
        : `<span class="initials">${initials}</span>`);
  }

  private getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
  }
}
