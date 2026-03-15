export function applyCurvomorphism(
  element: HTMLElement,
  centerX: number,
  centerY: number,
  radiusValue: string = "12px",
  groupLeft: number = centerX,
  groupRight: number = centerX,
  groupTop: number = centerY,
  groupBottom: number = centerY,
): void {
  const rect = element.getBoundingClientRect();

  const elCenterX = rect.left + rect.width / 2;
  const elCenterY = rect.top + rect.height / 2;

  const r = radiusValue;
  const s = "0px";

  // 2% of the group's half-span so it scales with layout density
  const tx = Math.max(1, ((groupRight - groupLeft) / 2) * 0.02);
  const ty = Math.max(1, ((groupBottom - groupTop) / 2) * 0.02);

  const leftIn = elCenterX > centerX + tx;
  const rightIn = elCenterX < centerX - tx;
  const topIn = elCenterY > centerY + ty;
  const bottomIn = elCenterY < centerY - ty;

  // When an element lands exactly on a center axis (within the dead zone),
  // treat both sides of that axis as inward so edge/center cards still get
  // their perpendicular corners rounded correctly.
  const xBoth = !leftIn && !rightIn;
  const yBoth = !topIn && !bottomIn;

  element.style.borderTopLeftRadius =
    (topIn || yBoth) && (leftIn || xBoth) ? r : s;
  element.style.borderTopRightRadius =
    (topIn || yBoth) && (rightIn || xBoth) ? r : s;
  element.style.borderBottomLeftRadius =
    (bottomIn || yBoth) && (leftIn || xBoth) ? r : s;
  element.style.borderBottomRightRadius =
    (bottomIn || yBoth) && (rightIn || xBoth) ? r : s;
}

function findCenter(el: HTMLElement): { x: number; y: number } {
  // First check for an explicit center-point ancestor (set by section).
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    if (node.dataset.centerX && node.dataset.centerY) {
      return {
        x: parseFloat(node.dataset.centerX),
        y: parseFloat(node.dataset.centerY),
      };
    }
    node = node.parentElement;
  }

  // Fall back to the geometric center of the nearest ancestor that has real dimensions
  let ancestor: HTMLElement | null = el.parentElement;
  while (ancestor) {
    const rect = ancestor.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    ancestor = ancestor.parentElement;
  }

  return {
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  };
}

export function enableCurvomorphism(
  element: HTMLElement,
  options: {
    radius?: string;
    centerX?: number;
    centerY?: number;
    groupLeft?: number;
    groupRight?: number;
    groupTop?: number;
    groupBottom?: number;
  } = {},
): () => void {
  const radiusType = options.radius || "medium";

  let radiusValue = "12px";
  if (typeof window !== "undefined" && window.getComputedStyle) {
    const v = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(`--saz-radius-${radiusType}`);
    if (v && v.trim()) radiusValue = v.trim();
  }

  const apply = () => {
    const cachedCenter = options.centerX === undefined && options.centerY === undefined
      ? findCenter(element)
      : { x: 0, y: 0 };
    const cx = options.centerX ?? cachedCenter.x;
    const cy = options.centerY ?? cachedCenter.y;
    applyCurvomorphism(
      element,
      cx,
      cy,
      radiusValue,
      options.groupLeft,
      options.groupRight,
      options.groupTop,
      options.groupBottom,
    );
  };

  if (typeof window !== "undefined") {
    // Apply synchronously
    apply();
    window.addEventListener("resize", apply);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", apply);
    }
  };
}
