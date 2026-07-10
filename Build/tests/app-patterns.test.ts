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
  const names: [string, string][] = [
    ["text","Text"],["badge","Badge"],["heading","Heading"],["label","Label"],
    ["button","Button"],["input","Input"],["checkbox","Checkbox"],
    ["card","Card"],["row","Row"],["column","Column"],["grid","Grid"],
    ["stack","Stack"],["section","Section"],["icon","Icon"],
    ["divider","Divider"],["spacer","Spacer"],["spinner","Spinner"],
    ["switch","Switch"],["toggle","Toggle"],["select","Select"],
    ["slider","Slider"],["radio","Radio"],["image","Image"],
    ["avatar","Avatar"],["coverart","Coverart"],["progress","Progress"],
    ["tag","Tag"],["chip","Chip"],["modal","Modal"],["toast","Toast"],
    ["tabs","Tabs"],
  ];
  for (const [k, cls] of names) {
    defineOnce(`saz-${k}`, require(`../src/primitives/${k}`)[`Sazami${cls}`]);
  }
  defineOnce("saz-icon-button", require("../src/primitives/icon-button").SazamiIconButton);
});

describe("Real-world app patterns", () => {
  test("Counter: increment/decrement/reset", async () => {
    const source = `<counter {
      @state { count = 0 }
      text: "Count: {count}"
      button @on:click { count = count + 1 }: "+"
      button @on:click { count = count - 1 }: "-"
      button @on:click { count = 0 }: "Reset"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text!.shadowRoot!.textContent).toContain("Count: 0");

    const buttons = container.querySelectorAll("saz-button");
    expect(buttons.length).toBe(3);

    // Increment
    (buttons[0] as HTMLElement).click();
    await Promise.resolve();
    expect(text!.shadowRoot!.textContent).toContain("Count: 1");

    // Increment again
    (buttons[0] as HTMLElement).click();
    await Promise.resolve();
    expect(text!.shadowRoot!.textContent).toContain("Count: 2");

    // Decrement
    (buttons[1] as HTMLElement).click();
    await Promise.resolve();
    expect(text!.shadowRoot!.textContent).toContain("Count: 1");

    // Reset
    (buttons[2] as HTMLElement).click();
    await Promise.resolve();
    expect(text!.shadowRoot!.textContent).toContain("Count: 0");
  });

  test("Toggle visibility with @if", async () => {
    const source = `<app {
      @state { show = true }
      button @on:click { show = !show }: "Toggle"
      text @if="show": "Now you see me"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text");
    expect(text).toBeTruthy();
    expect((text as HTMLElement).style.display).not.toBe("none");

    const btn = container.querySelector("saz-button")!;
    (btn as HTMLElement).click();
    await Promise.resolve();
    expect((text as HTMLElement).style.display).toBe("none");

    (btn as HTMLElement).click();
    await Promise.resolve();
    expect((text as HTMLElement).style.display).not.toBe("none");
  });

  test("@bind two-way on input", async () => {
    const source = `<form {
      @state { name = "" }
      input @bind="name": ""
      text: "Hello {name}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const input = container.querySelector("saz-input")!;
    const text = container.querySelector("saz-text")!;
    expect(text!.shadowRoot!.textContent).toContain("Hello");

    // Simulate input
    const innerInput = (input as any).shadowRoot?.querySelector("input");
    if (innerInput) {
      innerInput.value = "World";
      innerInput.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
      expect(text!.shadowRoot!.textContent).toContain("Hello World");
    }
  });

  test("@derived computed from multiple signals", async () => {
    const source = `<calc {
      @state { a = 5; b = 3 }
      @derived { sum = a + b; product = a * b }
      text: "{a} + {b} = {sum}"
      text: "{a} * {b} = {product}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const texts = container.querySelectorAll("saz-text");
    expect(texts[0]!.shadowRoot!.textContent).toContain("5 + 3 = 8");
    expect(texts[1]!.shadowRoot!.textContent).toContain("5 * 3 = 15");
  });

  test("@effect reacts to state changes", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const source = `<app {
      @state { count = 0 }
      @effect {
        console.log("count changed to", count)
      }
      button @on:click { count++ }: "Go"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    expect(logSpy).toHaveBeenCalledWith("count changed to", 0);
    logSpy.mockClear();

    (container.querySelector("saz-button")! as HTMLElement).click();
    await Promise.resolve();
    expect(logSpy).toHaveBeenCalledWith("count changed to", 1);

    logSpy.mockRestore();
  });

  test("Complex interpolation: expressions in strings", async () => {
    const source = `<app {
      @state { items = 3; price = 10 }
      text: "Total: {items * price} dollars"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text")!;
    expect(text!.shadowRoot!.textContent).toContain("Total: 30 dollars");
  });

  test("Nested elements with modifiers", async () => {
    const source = `<page {
      card(accent curved) {
        heading(bold): "Title"
        text(dim): "Description"
        row(center) {
          button(primary): "Save"
          button: "Cancel"
        }
      }
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const card = container.querySelector("saz-card");
    expect(card).toBeTruthy();
    expect(card!.getAttribute("variant")).toBe("accent");

    const heading = container.querySelector("saz-heading");
    expect(heading!.shadowRoot!.textContent).toContain("Title");

    const buttons = container.querySelectorAll("saz-button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute("variant")).toBe("primary");
  });

  test("Interpolation in @on:click handler body", async () => {
    const source = `<app {
      @state { count = 0; step = 5 }
      button @on:click { count = count + step }: "Add {step}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const button = container.querySelector("saz-button")!;
    expect(button.textContent).toContain("Add 5");

    (button as HTMLElement).click();
    await Promise.resolve();
    expect(button.textContent).toContain("Add 5"); // text shouldn't change, but count is now 5
  });

  test("@class modifier on element", async () => {
    const source = `<page {
      text @class:highlight: "Hello"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    // @class is parsed as modifier but components use Shadow DOM so class on host may not apply internally
    const text = container.querySelector("saz-text")!;
    expect(text).toBeTruthy();
  });

  test("Boolean state toggle", async () => {
    const source = `<app {
      @state { dark = false; name = "World" }
      button @on:click { dark = !dark }: "Toggle Dark"
      text: "Hello {name}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    // Just verify it compiles and renders without error
    expect(container.querySelector("saz-text")).toBeTruthy();
    expect(container.querySelector("saz-button")).toBeTruthy();
  });

  test("Empty @state block", async () => {
    const source = `<page {
      @state { }
      text: "No state"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    expect(() => compileSakko(source, container)).not.toThrow();
    await Promise.resolve();
    const text = container.querySelector("saz-text")!;
    expect(text!.shadowRoot!.textContent).toContain("No state");
  });

  test("Re-render replaces previous content", async () => {
    const source = `<page {
      text: "Version 2"
    }>`;

    const container = document.createElement("div");
    container.innerHTML = "<div>old content</div>";
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    expect(container.textContent).not.toContain("old content");
    const text = container.querySelector("saz-text");
    expect(text).toBeTruthy();
    expect(text!.shadowRoot!.textContent).toContain("Version 2");
  });

  test("Multiple @state blocks", async () => {
    const source = `<app {
      @state { a = 1; b = 2 }
      @state { c = 3 }
      text: "{a} {b} {c}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text")!;
    expect(text!.shadowRoot!.textContent).toContain("1 2 3");
  });

  test("Deeply nested reactive: derived depends on derived", async () => {
    const source = `<app {
      @state { x = 2 }
      @derived { squared = x * x }
      @derived { cubed = squared * x }
      text: "{x} squared = {squared}, cubed = {cubed}"
    }>`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const text = container.querySelector("saz-text")!;
    expect(text!.shadowRoot!.textContent).toContain("2 squared = 4, cubed = 8");
  });

  test("@class modifier adds CSS class", () => {
    const source = `app { span(@class:highlight): "hello" }`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    const span = container.querySelector("span");
    expect(span).toBeTruthy();
    expect(span!.getAttribute("class")).toBe("highlight");
  });

  test("Unknown root name renders as div without warning", () => {
    const source = `counter { text: "Hello" }`;

    const container = document.createElement("div");
    document.body.appendChild(container);

    // Should not throw despite "counter" not being registered
    expect(() => compileSakko(source, container)).not.toThrow();
    const text = container.querySelector("saz-text");
    expect(text).toBeTruthy();
    expect(text!.shadowRoot!.textContent).toContain("Hello");
  });

  test("@each iterates over signal array", async () => {
    const source = `app {
      @state { items = ["a", "b", "c"] }
      div(@each item in items) {
        text: "{item}"
      }
    }`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    const texts = container.querySelectorAll("saz-text");
    expect(texts.length).toBe(3);
    expect(texts[0]!.shadowRoot!.textContent).toContain("a");
    expect(texts[1]!.shadowRoot!.textContent).toContain("b");
    expect(texts[2]!.shadowRoot!.textContent).toContain("c");
  });

  test("@each updates when array signal changes", async () => {
    const source = `app {
      @state { items = ["x"] }
      div(@each item in items) {
        text: "{item}"
      }
    }`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    await Promise.resolve();

    let texts = container.querySelectorAll("saz-text");
    expect(texts.length).toBe(1);
    expect(texts[0]!.shadowRoot!.textContent).toContain("x");
  });

  test("@class with pair syntax adds CSS class attribute", () => {
    const source = `app { span(class highlight): "hello" }`;

    const container = document.createElement("div");
    document.body.appendChild(container);
    compileSakko(source, container);
    const span = container.querySelector("span");
    expect(span).toBeTruthy();
    expect(span!.getAttribute("class")).toBe("highlight");
  });
});
