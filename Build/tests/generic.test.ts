/**
 * @jest-environment jsdom
 */
import { registerComponents } from "../src/primitives/registry";
import { generateThemeCSS } from "../src/config/generator";

describe("Generic Component Factory", () => {
  beforeAll(() => {
    const style = document.createElement("style");
    style.textContent = generateThemeCSS();
    document.head.appendChild(style);
    registerComponents();
  });

  test("saz-details has Shadow DOM", () => {
    const el = document.createElement("saz-details");
    document.body.appendChild(el);
    expect(el.shadowRoot).toBeTruthy();
    el.remove();
  });

  test("saz-details renders slot content", () => {
    const el = document.createElement("saz-details");
    el.textContent = "Hello World";
    document.body.appendChild(el);
    
    const slot = el.shadowRoot!.querySelector("slot");
    expect(slot).toBeTruthy();
    el.remove();
  });

  test("saz-details supports layout=row attribute", () => {
    const el = document.createElement("saz-details");
    el.setAttribute("layout", "row");
    document.body.appendChild(el);
    
    const style = el.shadowRoot!.querySelector("style")?.textContent || "";
    expect(style).toContain('layout="row"');
    el.remove();
  });

  test("saz-details supports gap attribute", () => {
    const el = document.createElement("saz-details");
    el.setAttribute("gap", "large");
    document.body.appendChild(el);
    
    const style = el.shadowRoot!.querySelector("style")?.textContent || "";
    expect(style).toContain('gap="large"');
    el.remove();
  });

  test("saz-details supports align attribute", () => {
    const el = document.createElement("saz-details");
    el.setAttribute("align", "center");
    document.body.appendChild(el);
    
    const style = el.shadowRoot!.querySelector("style")?.textContent || "";
    expect(style).toContain("align-items: center");
    el.remove();
  });

  test("saz-details supports justify attribute", () => {
    const el = document.createElement("saz-details");
    el.setAttribute("justify", "space-between");
    document.body.appendChild(el);
    
    const style = el.shadowRoot!.querySelector("style")?.textContent || "";
    expect(style).toContain("justify-content: space-between");
    el.remove();
  });

  test("saz-controls has Shadow DOM", () => {
    const el = document.createElement("saz-controls");
    document.body.appendChild(el);
    expect(el.shadowRoot).toBeTruthy();
    el.remove();
  });

  test("saz-controls supports layout=row", () => {
    const el = document.createElement("saz-controls");
    el.setAttribute("layout", "row");
    document.body.appendChild(el);
    
    const style = el.shadowRoot!.querySelector("style")?.textContent || "";
    expect(style).toContain('layout="row"');
    el.remove();
  });

  test("saz-details uses flex column layout by default", () => {
    const el = document.createElement("saz-details");
    document.body.appendChild(el);
    
    const style = el.shadowRoot!.querySelector("style")?.textContent || "";
    expect(style).toContain("flex-direction: column");
    el.remove();
  });
});
