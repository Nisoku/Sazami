export function applyCurvomorphism(
  element: HTMLElement,
  centerX: number,
  centerY: number,
  radiusValue: string = "12px",
): void {
  const rect = element.getBoundingClientRect();

  const elCenterX = rect.left + rect.width / 2;
  const elCenterY = rect.top + rect.height / 2;

  const r = radiusValue;
  const s = "0px";

  const leftIn = elCenterX > centerX;
  const rightIn = elCenterX < centerX;
  const topIn = elCenterY > centerY;
  const bottomIn = elCenterY < centerY;

  element.style.borderTopLeftRadius = topIn && leftIn ? r : s;
  element.style.borderTopRightRadius = topIn && rightIn ? r : s;
  element.style.borderBottomLeftRadius = bottomIn && leftIn ? r : s;
  element.style.borderBottomRightRadius = bottomIn && rightIn ? r : s;
}

function findCenter(el: HTMLElement): { x: number; y: number } {
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
  return {
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  };
}

export function enableCurvomorphism(
  element: HTMLElement,
  options: { radius?: string; centerX?: number; centerY?: number } = {},
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
    const cx = options.centerX ?? findCenter(element).x;
    const cy = options.centerY ?? findCenter(element).y;
    applyCurvomorphism(element, cx, cy, radiusValue);
  };

  if (typeof window !== "undefined") {
    requestAnimationFrame(apply);
    window.addEventListener("resize", apply);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", apply);
    }
  };
}
