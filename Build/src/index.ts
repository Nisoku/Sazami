// Sazami main entry point.

export { defaultTokens } from "./config/tokens";
export {
  generateCSSVariables,
  generateThemeCSS,
  getTokenValue,
} from "./config/generator";

export { parseModifiers, MODIFIER_MAP } from "./primitives/modifier-map";
export { registerComponents, COMPONENT_REGISTRY } from "./primitives/registry";

export { transformAST } from "./runtime/transformer";
export type { VNode } from "./runtime/transformer";

export { render } from "./runtime/renderer";

export { applyCurvomorphism, enableCurvomorphism } from "./curvomorphism/index";

export { ICON_SVGS } from "./icons/index";

export { escapeHtml, unescapeHtml, escapeUrl, escapeCss } from "./escape";

import { parseSakko } from "@nisoku/sakko";
import {
  transformAST,
  VNode,
  getTag as getTagName,
} from "./runtime/transformer";
import { render } from "./runtime/renderer";
import { generateThemeCSS } from "./config/generator";
import { enableCurvomorphism } from "./curvomorphism/index";
import { registerComponents } from "./primitives/registry";
import { parseModifiers as pmParseModifiers } from "./primitives/modifier-map";

let themeInjected = false;

export function injectThemeCSS(customTokens?: Record<string, string>): void {
  if (typeof document === "undefined") return;

  const existing = document.querySelector("style[data-sazami-theme]");
  const themeCSS = generateThemeCSS(customTokens);

  if (existing) {
    existing.textContent = themeCSS;
  } else {
    const style = document.createElement("style");
    style.setAttribute("data-sazami-theme", "");
    style.textContent = themeCSS;
    document.head.appendChild(style);
  }
  themeInjected = true;
}

export function compileSakko(
  source: string,
  target: HTMLElement,
  options?: { tokens?: Record<string, string> },
): void {
  if (typeof customElements !== "undefined") {
    registerComponents();
  }

  if (!themeInjected) {
    injectThemeCSS(options?.tokens);
  }

  // Auto-wrap source in angle brackets if not already wrapped.
  const trimmed = source.trim();
  const wrapped =
    trimmed.startsWith("<") && trimmed.endsWith(">") ? trimmed : `<${trimmed}>`;

  const ast = parseSakko(wrapped);

  // Always render the root element as a component wrapper.
  const rootVNode: VNode = {
    type: getTagName(ast.name),
    props: ast.modifiers ? pmParseModifiers(ast.modifiers) : {},
    children: [],
  };
  for (const child of ast.children) {
    const result = transformAST(child);
    if (Array.isArray(result)) {
      rootVNode.children.push(...result);
    } else {
      rootVNode.children.push(result);
    }
  }
  render(rootVNode, target);

  if (typeof window !== "undefined") {
    // Disconnect any observer from a previous compileSakko call on this target
    // so re-renders (e.g. playground live preview) don't leave stale observers.
    const prev = (target as any).__sazamiRO as ResizeObserver | undefined;
    if (prev) prev.disconnect();

    // Dispose any previous curvomorphism listeners
    const prevDisposers = (target as any).__sazamiCurvoDisposers as
      | Array<() => void>
      | undefined;
    if (prevDisposers) {
      prevDisposers.forEach((d) => { d(); });
    }
    const disposers: Array<() => void> = [];

    const ro = new ResizeObserver(() => {
      const elements = Array.from(target.querySelectorAll("[curved]")).filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      );
      if (elements.length === 0) return;

      requestAnimationFrame(() => {
        // Compute a single shared center from the collective bounding box of
        // all curved elements
        const rects = elements.map((el) => el.getBoundingClientRect());
        const left = Math.min(...rects.map((r) => r.left));
        const right = Math.max(...rects.map((r) => r.right));
        const top = Math.min(...rects.map((r) => r.top));
        const bottom = Math.max(...rects.map((r) => r.bottom));
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;

        disposers.forEach((d) => { d(); });
        disposers.length = 0;

        elements.forEach((el) => {
          const dispose = enableCurvomorphism(el, {
            radius: el.getAttribute("radius") || undefined,
            centerX,
            centerY,
            groupLeft: left,
            groupRight: right,
            groupTop: top,
            groupBottom: bottom,
          });
          disposers.push(dispose);
        });
      });
    });
    (target as any).__sazamiRO = ro;
    (target as any).__sazamiCurvoDisposers = disposers;
    ro.observe(target);
  }
}
