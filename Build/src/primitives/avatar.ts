import { SazamiComponent, component } from "./base";
import { SHAPE_RULES } from "./shared";

const STYLES = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
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
${SHAPE_RULES}
`;

const avatarConfig = {
  properties: {
    src: { type: "string" as const, reflect: false },
    alt: { type: "string" as const, reflect: false },
    initials: { type: "string" as const, reflect: false },
    size: { type: "string" as const, reflect: false },
    shape: { type: "string" as const, reflect: false },
  },
} as const;

@component(avatarConfig)
export class SazamiAvatar extends SazamiComponent<typeof avatarConfig> {
  declare src: string;
  declare alt: string;
  declare initials: string;
  declare size: string;
  declare shape: string;

  render() {
    const src = this.getAttribute("src") || "";
    const alt = this.getAttribute("alt") || "";
    const initialsAttr = this.getAttribute("initials") || "";
    const textContent = this.textContent?.trim() || "";
    const initials = initialsAttr || this._getInitials(alt || textContent);

    this.mount(
      STYLES,
      src
        ? `<img class="image" src="${src}" alt="${alt}" />`
        : `<span class="initials">${initials}</span>`,
    );
  }

  private _getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
  }
}
