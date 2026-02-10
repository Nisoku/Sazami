export { tokenize } from './parser/tokenizer';
export { parseSakko, Parser } from './parser/parser';
export type { RootNode, ElementNode, InlineNode, ListNode, ASTNode, Modifier, } from './parser/parser';
export type { Token } from './parser/tokenizer';
export { defaultTokens } from './config/tokens';
export { generateCSSVariables, generateThemeCSS, getTokenValue, } from './config/generator';
export { parseModifiers, MODIFIER_MAP } from './primitives/modifier-map';
export { registerComponents, COMPONENT_REGISTRY } from './primitives/registry';
export { transformAST } from './runtime/transformer';
export type { VNode } from './runtime/transformer';
export { render } from './runtime/renderer';
export { applyCurvomorphism, enableCurvomorphism } from './curvomorphism/index';
export { ICON_SVGS } from './icons/index';
export declare function injectThemeCSS(customTokens?: Record<string, string>): void;
export declare function compileSakko(source: string, target: HTMLElement, options?: {
    tokens?: Record<string, string>;
}): void;
