/**
 * @jest-environment jest-fixed-jsdom
 */
import { describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import { compileSakko, injectThemeCSS } from "../src/index";
import { __resetRegistryForTesting } from "@nisoku/sairin";

function defineOnce(name: string, cls: any) {
  if (!customElements.get(name)) {
    customElements.define(name, cls);
  }
}

beforeEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  __resetRegistryForTesting();
});

beforeAll(() => {
  defineOnce("saz-text", require("../src/primitives/text").SazamiText);
  defineOnce("saz-badge", require("../src/primitives/badge").SazamiBadge);
  defineOnce("saz-heading", require("../src/primitives/heading").SazamiHeading);
  defineOnce("saz-label", require("../src/primitives/label").SazamiLabel);
  defineOnce("saz-button", require("../src/primitives/button").SazamiButton);
  defineOnce("saz-input", require("../src/primitives/input").SazamiInput);
  defineOnce("saz-checkbox", require("../src/primitives/checkbox").SazamiCheckbox);
  defineOnce("saz-card", require("../src/primitives/card").SazamiCard);
  defineOnce("saz-row", require("../src/primitives/row").SazamiRow);
  defineOnce("saz-column", require("../src/primitives/column").SazamiColumn);
  defineOnce("saz-grid", require("../src/primitives/grid").SazamiGrid);
  defineOnce("saz-stack", require("../src/primitives/stack").SazamiStack);
  defineOnce("saz-section", require("../src/primitives/section").SazamiSection);
  defineOnce("saz-icon", require("../src/primitives/icon").SazamiIcon);
  defineOnce("saz-divider", require("../src/primitives/divider").SazamiDivider);
  defineOnce("saz-spacer", require("../src/primitives/spacer").SazamiSpacer);
  defineOnce("saz-spinner", require("../src/primitives/spinner").SazamiSpinner);
});

describe("Reactive Pipeline - @state/@derived/@effect", () => {
  test("@state creates a signal and interpolated value updates reactively", async () => {
    const source = `<player {
      @state { name = "World" }
      text: "Hello {name}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text).toBeTruthy();
    expect(text!.shadowRoot?.textContent).toContain("Hello World");
  });

  test("@state with multiple variables", async () => {
    const source = `<player {
      @state { first = "John"; last = "Doe" }
      text: "{first} {last}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot?.textContent).toContain("John Doe");
  });

  test("@derived computes from state signals", async () => {
    const source = `<player {
      @state { a = 10; b = 20 }
      @derived { sum = a + b }
      text: "Sum: {sum}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot?.textContent).toContain("Sum: 30");
  });

  test("@effect runs and can be triggered by state changes", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const source = `<player {
      @state { count = 0 }
      @effect {
        console.log("count is", count)
      }
      text: "App"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    expect(logSpy).toHaveBeenCalledWith("count is", 0);

    logSpy.mockRestore();
  });

  test("@on:click fires event handler", async () => {
    const source = `<player {
      @state { count = 0 }
      button @on:click { count = count + 1 }: "Count: {count}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const button = container.querySelector("saz-button");
    expect(button).toBeTruthy();

    button!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();

    expect(button!.textContent).toContain("Count: 1");
  });

  test("@on:click with increment operator", async () => {
    const source = `<player {
      @state { count = 0 }
      button @on:click { count++ }: "{count}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const button = container.querySelector("saz-button");
    button!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();

    expect(button!.textContent).toContain("1");

    button!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();

    expect(button!.textContent).toContain("2");
  });

  test("@state with number values", async () => {
    const source = `<player {
      @state { count = 42 }
      text: "{count}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot?.textContent).toContain("42");
  });

  test("@state with boolean values", async () => {
    const source = `<player {
      @state { isActive = true }
      text: "{isActive}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot?.textContent).toContain("true");
  });

  test("interpolation with multiple expressions", async () => {
    const source = `<player {
      @state { first = "Hello"; second = "World" }
      text: "{first}, {second}!"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot?.textContent).toContain("Hello, World!");
  });

  test("static text without expressions still works", async () => {
    const source = `<player {
      text: "Just static text"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot?.textContent).toContain("Just static text");
  });

  test("no declarations still compiles", async () => {
    const source = `<player {
      text: "Hello"
      button(primary): "Click"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);

    expect(container.querySelector("saz-text")).toBeTruthy();
    expect(container.querySelector("saz-button")).toBeTruthy();
  });
});
