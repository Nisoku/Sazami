/**
 * @jest-environment jsdom
 */
import { SazamiComponent, component } from "../src/primitives/base";
import { registerComponents } from "../src/primitives/registry";
import { generateThemeCSS } from "../src/config/generator";

describe("SazamiComponent Base Class", () => {
  beforeAll(() => {
    const style = document.createElement("style");
    style.textContent = generateThemeCSS();
    document.head.appendChild(style);
    registerComponents();
  });

  test("attaches shadow DOM on construction", () => {
    const el = document.createElement("saz-button");
    expect(el.shadow).toBeDefined();
    expect(el.shadowRoot).toBeTruthy();
    el.remove();
  });

  test("mount sets innerHTML in shadow root", () => {
    const el = document.createElement("saz-button");
    document.body.appendChild(el);
    
    expect(el.shadowRoot?.innerHTML).toContain("<slot>");
    expect(el.shadowRoot?.innerHTML).toContain("<style>");
    el.remove();
  });

  test("$ querySelector works in shadow root", () => {
    const el = document.createElement("saz-card");
    document.body.appendChild(el);
    
    const slot = el.$("slot");
    expect(slot).toBeTruthy();
    el.remove();
  });

  test("dispatch creates bubbling custom event", () => {
    const el = document.createElement("saz-button");
    document.body.appendChild(el);
    
    let received = false;
    el.addEventListener("test-event", () => { received = true; });
    
    el.dispatch("test-event", { foo: "bar" });
    expect(received).toBe(true);
    el.remove();
  });

  test("dispatch with detail", () => {
    const el = document.createElement("saz-button");
    document.body.appendChild(el);
    
    let detail: any = null;
    el.addEventListener("test-event", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    
    el.dispatch("test-event", { foo: "bar" });
    expect(detail).toEqual({ foo: "bar" });
    el.remove();
  });

  test("onCleanup registers cleanup function", () => {
    const el = document.createElement("saz-button");
    let cleaned = false;
    el.onCleanup(() => { cleaned = true; });
    
    el.disconnectedCallback();
    expect(cleaned).toBe(true);
  });

  test("observedAttributes is defined on base class", () => {
    expect(SazamiComponent.observedAttributes).toBeDefined();
  });
});

describe("Component Decorator", () => {
  test("observedAttributes for checkbox derives from reflected properties", () => {
    // Import the checkbox config indirectly by checking the class
    const el = document.createElement("saz-checkbox");
    const attrs = (el.constructor as any).observedAttributes;
    expect(attrs).toContain("checked");
    expect(attrs).toContain("disabled");
    el.remove();
  });

  test("observedAttributes for toggle derives from reflected properties", () => {
    const el = document.createElement("saz-toggle");
    const attrs = (el.constructor as any).observedAttributes;
    expect(attrs).toContain("checked");
    expect(attrs).toContain("disabled");
    el.remove();
  });

  test("observedAttributes for modal derives from reflected properties", () => {
    const el = document.createElement("saz-modal");
    const attrs = (el.constructor as any).observedAttributes;
    expect(attrs).toContain("open");
    el.remove();
  });
});
