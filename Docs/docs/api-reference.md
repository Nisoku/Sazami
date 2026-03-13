---
title: "API Reference"
description: "Complete public API for compileSakko, transformer, config, and curvomorphism"
order: 5
---

# API Reference

Complete public API for Sazami. 

> Note: The parser (`parseSakko`, `tokenize`) is now in the separate `@nisoku/sakko` package.

---

## Core

### `compileSakko(source, target)`

The main entry point. Parses a `.sako` source string, transforms it to a component tree, and renders it into a target DOM element.

```typescript
import { compileSakko } from '@nisoku/sazami';

const source = `
<page {
  card {
    text(bold): "Hello World"
    button(accent): "Click Me"
  }
}>
`;

compileSakko(source, document.getElementById('app'));
```

**Parameters:**
- `source: string` - Sakko DSL source code (angle brackets are auto-added if missing)
- `target: HTMLElement` - DOM element to render into
- `options?: { tokens?: Record<string, string> }` - Optional custom token overrides

**Behavior:**
1. Registers all Sazami Web Components
2. Injects theme CSS variables into `<head>`
3. Parses source → AST (uses `@nisoku/sakko`)
4. Transforms AST → VNode tree
5. Renders VNode tree → DOM
6. Applies curvomorphism to `[curved]` elements

---

## Transformer

### `transformAST(node)`

Transform an AST node into a VNode (virtual DOM node) or array of VNodes.

```typescript
import { parseSakko } from '@nisoku/sakko';
import { transformAST } from '@nisoku/sazami';

const ast = parseSakko('<page { button(accent): Save }>');
const vnodes = ast.children.map(transformAST).flat();
// Returns: [{ type: "saz-button", props: { variant: "accent" }, children: ["Save"] }]
```

### `render(vnode, parent)`

Render a VNode tree into a DOM element.

```typescript
import { render } from '@nisoku/sazami';

render(vnode, document.getElementById('app'));
```

---

## Config

### `injectThemeCSS(customTokens?)`

Inject theme CSS variables into the document `<head>`. Idempotent, updates existing theme if already injected.

```typescript
import { injectThemeCSS } from '@nisoku/sazami';

// Use defaults
injectThemeCSS();

// Override specific tokens
injectThemeCSS({ 'color.primary': '#ff0000' });
```

### `generateThemeCSS(customTokens?)`

Generate the complete theme CSS string without injecting it.

```typescript
import { generateThemeCSS } from '@nisoku/sazami';

const css = generateThemeCSS();
// Returns: ":root { --saz-color-primary: #2563eb; ... }"
```

### `generateCSSVariables(tokens)`

Convert a token map to CSS variable declarations.

```typescript
import { generateCSSVariables } from '@nisoku/sazami';

generateCSSVariables({ 'color.primary': '#2563eb' });
// Returns: "  --saz-color-primary: #2563eb;"
```

### `getTokenValue(key, customTokens?)`

Look up a resolved token value.

```typescript
import { getTokenValue } from '@nisoku/sazami';

getTokenValue('color.primary');  // "#2563eb"
```

### Token Maps

Importable token maps for each category:

```typescript
import { defaultTokens, colors, spacing, typography, radii, shadows, iconSizes } from '@nisoku/sazami';
```

---

## Curvomorphism

### `applyCurvomorphism(element, options?)`

Apply directional corner rounding to an element.

```typescript
import { applyCurvomorphism } from '@nisoku/sazami';

applyCurvomorphism(element, {
  radius: 'strong',
  centerX: 500,
  centerY: 400,
});
```

### `enableCurvomorphism(element, options?)`

Conditionally apply curvomorphism if the element has the `curved` attribute.

```typescript
import { enableCurvomorphism } from '@nisoku/sazami';

enableCurvomorphism(element);
```

---

## Primitives

### `registerComponents()`

Register all Sazami Web Components with the browser's custom elements registry. Called automatically by `compileSakko`.

```typescript
import { registerComponents } from '@nisoku/sazami';

registerComponents();
```

### `parseModifiers(modifiers)`

Convert an array of AST modifier nodes into a props object.

```typescript
import { parseModifiers } from '@nisoku/sazami';

parseModifiers([
  { type: 'flag', value: 'accent' },
  { type: 'pair', key: 'gap', value: 'large' },
]);
// Returns: { variant: 'accent', gap: 'large' }
```

### `COMPONENT_REGISTRY`

The component registry mapping custom element tags to Web Component classes:

```typescript
import { COMPONENT_REGISTRY } from '@nisoku/sazami';

// Maps tag names to component classes, e.g.:
// { "saz-card": SazamiCard, "saz-button": SazamiButton, ... }
```

### `MODIFIER_MAP`

The modifier flag mapping:

```typescript
import { MODIFIER_MAP } from '@nisoku/sazami';

MODIFIER_MAP['accent'];  // { variant: 'accent' }
MODIFIER_MAP['bold'];    // { weight: 'bold' }
```

### `ICON_SVGS`

A record mapping icon names to SVG markup strings. All 41 built-in icons use `currentColor` and scale to their container.

```typescript
import { ICON_SVGS } from '@nisoku/sazami';

// Available: play, pause, stop, previous, next, skip, close, menu,
// search, settings, heart, star, check, plus, minus, edit, share,
// download, upload, refresh, home, back, forward, up, down,
// mail, phone, calendar, clock, user, users, folder, file, image,
// camera, bell, lock, link, trash, copy, bookmark, pin, globe
ICON_SVGS['play'];  // '<svg ...>...</svg>'
```

---

## Types

All TypeScript types are exported:

```typescript
import type {
  VNode,
  ComponentDefinition,
  CurvomorphismOptions,
} from '@nisoku/sazami';
```

Note: AST types (`Token`, `Modifier`, `ASTNode`, `RootNode`, `ElementNode`, `InlineNode`, `ListNode`) are exported from `@nisoku/sakko`.
