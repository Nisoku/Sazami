// Sazami main entry point.

export { tokenize } from "./parser/tokenizer";
export { parseSakko, Parser } from "./parser/parser";
export type {
  RootNode,
  ElementNode,
  InlineNode,
  ListNode,
  ASTNode,
  Modifier,
} from "./parser/parser";
export type { Token } from "./parser/tokenizer";

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

import { parseSakko } from "./parser/parser";
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
    requestAnimationFrame(() => {
      target.querySelectorAll("[curved]").forEach((el) => {
        if (el instanceof HTMLElement) {
          enableCurvomorphism(el, {
            radius: el.getAttribute("radius") || undefined,
          });
        }
      });
    });
  }
}
