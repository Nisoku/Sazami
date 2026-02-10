/**
 * @jest-environment jsdom
 */
import { applyCurvomorphism } from "../src/curvomorphism/index";

function mockElement(
  left: number,
  top: number,
  width: number,
  height: number,
): HTMLElement {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON() {},
  });
  return el;
}

describe("Curvomorphism - applyCurvomorphism", () => {
  test("element to the top-left of center: only bottom-right corner rounds", () => {
    const el = mockElement(0, 0, 100, 100);
    applyCurvomorphism(el, 500, 500, "12px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("12px");
  });

  test("element to the top-right of center: only bottom-left corner rounds", () => {
    const el = mockElement(600, 0, 100, 100);
    applyCurvomorphism(el, 500, 500, "12px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomLeftRadius).toBe("12px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("element to the bottom-left of center: only top-right corner rounds", () => {
    const el = mockElement(0, 600, 100, 100);
    applyCurvomorphism(el, 500, 500, "12px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
    expect(el.style.borderTopRightRadius).toBe("12px");
    expect(el.style.borderBottomLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("element to the bottom-right of center: only top-left corner rounds", () => {
    const el = mockElement(600, 600, 100, 100);
    applyCurvomorphism(el, 500, 500, "12px");
    expect(el.style.borderTopLeftRadius).toBe("12px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("element exactly at center: no corners round (not strictly > or <)", () => {
    const el = mockElement(450, 450, 100, 100);
    applyCurvomorphism(el, 500, 500, "8px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("element directly above center: bottom-left and bottom-right round", () => {
    const el = mockElement(450, 0, 100, 100);
    applyCurvomorphism(el, 500, 500, "8px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("element to the left of center, vertically centered: right-side corners round", () => {
    const el = mockElement(0, 200, 100, 100);
    applyCurvomorphism(el, 500, 250, "10px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("uses default radius of 12px when not specified", () => {
    const el = mockElement(0, 0, 100, 100);
    applyCurvomorphism(el, 500, 500);
    expect(el.style.borderBottomRightRadius).toBe("12px");
  });

  test("uses custom radius value", () => {
    const el = mockElement(0, 0, 100, 100);
    applyCurvomorphism(el, 500, 500, "24px");
    expect(el.style.borderBottomRightRadius).toBe("24px");
  });

  test("handles very large coordinate values", () => {
    const el = mockElement(10000, 10000, 100, 100);
    applyCurvomorphism(el, 500, 500, "8px");
    expect(el.style.borderTopLeftRadius).toBe("8px");
    expect(el.style.borderTopRightRadius).toBe("0px");
    expect(el.style.borderBottomLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("0px");
  });

  test("handles negative coordinate values", () => {
    const el = mockElement(-200, -200, 100, 100);
    applyCurvomorphism(el, 0, 0, "8px");
    // Element center is (-150, -150), center is (0,0)
    // Element is above-left, so bottom-right corner faces inward
    expect(el.style.borderBottomRightRadius).toBe("8px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
  });

  test("handles zero-sized element", () => {
    const el = mockElement(100, 100, 0, 0);
    applyCurvomorphism(el, 500, 500, "8px");
    expect(el.style.borderTopLeftRadius).toBe("0px");
    expect(el.style.borderBottomRightRadius).toBe("8px");
  });
});
