/**
 * @jest-environment jsdom
 */
import { render } from "../src/runtime/renderer";
import { VNode } from "../src/runtime/transformer";

describe("Renderer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
  });

  test("renders a text string node", () => {
    render("Hello World", container);
    expect(container.textContent).toBe("Hello World");
    expect(container.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
  });

  test("renders a simple VNode element", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: ["Hello"],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.textContent).toBe("Hello");
  });

  test("sets string attributes on element", () => {
    const vnode: VNode = {
      type: "div",
      props: { variant: "accent", size: "large" },
      children: [],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("variant")).toBe("accent");
    expect(el.getAttribute("size")).toBe("large");
  });

  test("sets boolean true attributes as empty string", () => {
    const vnode: VNode = {
      type: "div",
      props: { disabled: true, curved: true },
      children: [],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("disabled")).toBe("");
    expect(el.hasAttribute("curved")).toBe(true);
  });

  test("does not set boolean false attributes", () => {
    const vnode: VNode = {
      type: "div",
      props: { disabled: false },
      children: [],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  test("does not set undefined or null attributes", () => {
    const vnode: VNode = {
      type: "div",
      props: { a: undefined, b: null },
      children: [],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.hasAttribute("a")).toBe(false);
    expect(el.hasAttribute("b")).toBe(false);
  });

  test("renders nested VNode children", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: [
        {
          type: "span",
          props: { variant: "accent" },
          children: ["Child text"],
        },
      ],
    };
    render(vnode, container);
    const div = container.firstChild as HTMLElement;
    const span = div.firstChild as HTMLElement;
    expect(span.tagName).toBe("SPAN");
    expect(span.getAttribute("variant")).toBe("accent");
    expect(span.textContent).toBe("Child text");
  });

  test("renders multiple children", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: [
        { type: "span", props: {}, children: ["A"] },
        { type: "span", props: {}, children: ["B"] },
        { type: "span", props: {}, children: ["C"] },
      ],
    };
    render(vnode, container);
    const div = container.firstChild as HTMLElement;
    expect(div.children).toHaveLength(3);
  });

  test("handles array children (from list nodes)", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: [
        [
          { type: "span", props: {}, children: ["X"] },
          { type: "span", props: {}, children: ["Y"] },
        ] as any,
      ],
    };
    render(vnode, container);
    const div = container.firstChild as HTMLElement;
    expect(div.children).toHaveLength(2);
  });

  test("renders deeply nested structure", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: [
        {
          type: "section",
          props: {},
          children: [
            {
              type: "article",
              props: {},
              children: [
                {
                  type: "p",
                  props: {},
                  children: ["Deep text"],
                },
              ],
            },
          ],
        },
      ],
    };
    render(vnode, container);
    const p = container.querySelector("p");
    expect(p).toBeTruthy();
    expect(p?.textContent).toBe("Deep text");
  });

  test("renders numeric attribute values as strings", () => {
    const vnode: VNode = {
      type: "div",
      props: { cols: 3 },
      children: [],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("cols")).toBe("3");
  });

  test("renders empty children array", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: [],
    };
    render(vnode, container);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.childNodes).toHaveLength(0);
  });

  test("renders mixed text and element children", () => {
    const vnode: VNode = {
      type: "div",
      props: {},
      children: [
        "Before ",
        { type: "strong", props: {}, children: ["bold"] },
        " after",
      ],
    };
    render(vnode, container);
    const div = container.firstChild as HTMLElement;
    expect(div.textContent).toBe("Before bold after");
    expect(div.childNodes).toHaveLength(3);
  });
});
