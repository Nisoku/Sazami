export { defaultTokens } from "./config/tokens";
export { generateCSSVariables, generateThemeCSS, getTokenValue, } from "./config/generator";
export { parseModifiers, MODIFIER_MAP } from "./primitives/modifier-map";
export { registerComponents, COMPONENT_REGISTRY } from "./primitives/registry";
export { transformAST } from "./runtime/transformer";
export type { VNode } from "./runtime/transformer";
export { render } from "./runtime/renderer";
export { applyCurvomorphism, enableCurvomorphism } from "./curvomorphism/index";
export { ICON_SVGS } from "./icons/index";
export { escapeHtml, unescapeHtml, escapeUrl, escapeCss } from "./escape";
export declare function injectThemeCSS(customTokens?: Record<string, string>): void;
export declare function compileSakko(source: string, target: HTMLElement, options?: {
    tokens?: Record<string, string>;
}): void;
