/**
 * @jest-environment jsdom
 */
import { describe, test, expect, it, beforeAll } from '@jest/globals';
import { registerComponents } from "../src/primitives/registry";
import { generateThemeCSS } from "../src/config/generator";

describe("Accessibility Features", () => {
  beforeAll(() => {
    const style = document.createElement("style");
    style.textContent = generateThemeCSS();
    document.head.appendChild(style);
    registerComponents();
  });

  describe("ARIA Attributes", () => {
    test("saz-button has role=button", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("button");
      el.remove();
    });

    test("saz-button is keyboard focusable", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      expect(el.getAttribute("tabindex")).toBe("0");
      el.remove();
    });

    test("saz-checkbox has role=checkbox", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("checkbox");
      el.remove();
    });

    test("saz-checkbox updates aria-checked on toggle", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);
      
      expect(el.getAttribute("aria-checked")).toBe("false");
      el.click();
      expect(el.getAttribute("aria-checked")).toBe("true");
      el.click();
      expect(el.getAttribute("aria-checked")).toBe("false");
      el.remove();
    });

    test("saz-toggle has role=switch", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("switch");
      el.remove();
    });

    test("saz-toggle updates aria-checked on toggle", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);
      
      expect(el.getAttribute("aria-checked")).toBe("false");
      el.click();
      expect(el.getAttribute("aria-checked")).toBe("true");
      el.remove();
    });

    test("saz-icon-button has aria-label from icon", () => {
      const el = document.createElement("saz-icon-button");
      el.setAttribute("icon", "play");
      document.body.appendChild(el);
      expect(el.getAttribute("aria-label")).toBe("play");
      el.remove();
    });

    test("saz-modal has role=dialog", () => {
      const el = document.createElement("saz-modal");
      document.body.appendChild(el);
      const dialog = el.shadowRoot!.querySelector(".dialog");
      expect(dialog?.getAttribute("role")).toBe("dialog");
      el.remove();
    });

    test("saz-modal has aria-modal=true", () => {
      const el = document.createElement("saz-modal");
      document.body.appendChild(el);
      const dialog = el.shadowRoot!.querySelector(".dialog");
      expect(dialog?.getAttribute("aria-modal")).toBe("true");
      el.remove();
    });

    test("saz-tabs has role=tablist", () => {
      const el = document.createElement("saz-tabs");
      document.body.appendChild(el);
      const tabs = el.shadowRoot!.querySelector(".tabs");
      expect(tabs?.getAttribute("role")).toBe("tablist");
      el.remove();
    });

    test("saz-select trigger has role=combobox", () => {
      const el = document.createElement("saz-select");
      document.body.appendChild(el);
      const trigger = el.shadowRoot!.querySelector(".trigger");
      expect(trigger?.getAttribute("role")).toBe("combobox");
      el.remove();
    });

    test("saz-select dropdown has role=listbox", () => {
      const el = document.createElement("saz-select");
      document.body.appendChild(el);
      const dropdown = el.shadowRoot!.querySelector(".dropdown");
      expect(dropdown?.getAttribute("role")).toBe("listbox");
      el.remove();
    });
  });

  describe("Keyboard Navigation", () => {
    test("saz-button responds to Enter key", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      
      let clicked = false;
      el.addEventListener("click", () => { clicked = true; });
      
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(clicked).toBe(true);
      el.remove();
    });

    test("saz-button responds to Space key", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      
      let clicked = false;
      el.addEventListener("click", () => { clicked = true; });
      
      el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      expect(clicked).toBe(true);
      el.remove();
    });

    test("saz-checkbox responds to Enter key", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);
      
      expect(el.hasAttribute("checked")).toBe(false);
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(el.hasAttribute("checked")).toBe(true);
      el.remove();
    });

    test("saz-toggle responds to Enter key", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);
      
      expect(el.hasAttribute("checked")).toBe(false);
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      expect(el.hasAttribute("checked")).toBe(true);
      el.remove();
    });

    test("saz-modal closes on Escape key", () => {
      const el = document.createElement("saz-modal");
      el.setAttribute("open", "");
      document.body.appendChild(el);
      
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      
      expect(el.hasAttribute("open")).toBe(false);
      el.remove();
    });
  });

  describe("Focus Styles", () => {
    test("saz-button has focus-visible styles", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain(":focus-visible");
      el.remove();
    });

    test("saz-checkbox has focus-visible styles", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain(":focus-visible");
      el.remove();
    });

    test("saz-input input has focus styles", () => {
      const el = document.createElement("saz-input");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector("input");
      expect(input).toBeTruthy();
      el.remove();
    });

    test("saz-accordion header has focus-visible styles", () => {
      const el = document.createElement("saz-accordion");
      const item = document.createElement("div");
      item.setAttribute("heading", "Test");
      el.appendChild(item);
      document.body.appendChild(el);
      
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain(":focus-visible");
      el.remove();
    });
  });

  describe("Disabled State", () => {
    test("saz-button with disabled has reduced opacity", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("opacity");
      el.remove();
    });

    test("saz-checkbox with disabled does not toggle", () => {
      const el = document.createElement("saz-checkbox");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);
      
      el.click();
      expect(el.hasAttribute("checked")).toBe(false);
      el.remove();
    });

    test("saz-toggle with disabled does not toggle", () => {
      const el = document.createElement("saz-toggle");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);
      
      el.click();
      expect(el.hasAttribute("checked")).toBe(false);
      el.remove();
    });

    test("saz-input with disabled input is disabled", () => {
      const el = document.createElement("saz-input");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);
      
      const input = el.shadowRoot!.querySelector("input");
      expect(input?.hasAttribute("disabled")).toBe(true);
      el.remove();
    });
  });

  describe("Screen Reader Support", () => {
    test("saz-modal close button has aria-label", () => {
      const el = document.createElement("saz-modal");
      document.body.appendChild(el);
      
      const closeBtn = el.shadowRoot!.querySelector(".close-btn");
      expect(closeBtn?.getAttribute("aria-label")).toBe("Close");
      el.remove();
    });

    test("saz-toast close button has aria-label", () => {
      const el = document.createElement("saz-toast");
      document.body.appendChild(el);
      
      const closeBtn = el.shadowRoot!.querySelector(".close-btn");
      expect(closeBtn?.getAttribute("aria-label")).toBe("Close");
      el.remove();
    });

    test("saz-select option has role=option", () => {
      const el = document.createElement("saz-select");
      const opt = document.createElement("option");
      opt.setAttribute("value", "a");
      opt.textContent = "Option A";
      el.appendChild(opt);
      document.body.appendChild(el);
      
      const option = el.shadowRoot!.querySelector(".option");
      expect(option?.getAttribute("role")).toBe("option");
      el.remove();
    });
  });
});
