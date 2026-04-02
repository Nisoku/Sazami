---
title: "Sazami Documentation"
description: "A zero-dependency UI engine with the Sakko DSL, semantic web components, and design tokens"
toc: false
---

# Sazami

A zero-dependency UI engine for the web. Write concise Sakko markup, get real web components with automatic theming and directional corner rounding.

## Quick start

```typescript
import { compileSakko, injectThemeCSS } from "@nisoku/sazami";

injectThemeCSS();

compileSakko(`
  <card {
    heading: "Hello, world"
    text: "Built with Sazami"
    button(accent): "Get Started"
  }>
`, document.getElementById("app"));
```

That renders a styled card with a heading, paragraph, and themed button into the DOM. No HTML templates, no CSS classes, no framework boilerplate.

## What you get

| Feature | Details |
| --- | --- |
| **Components** | 48 semantic web components with Shadow DOM, ARIA roles, keyboard navigation |
| **Icons** | 41 SVG icons built in, no external dependencies |
| **Tokens** | Design token system: colors, spacing, typography, radii, shadows |
| **Curvomorphism** | Directional corner rounding based on element position |
| **Signal Integration** | Reactive state binding with [Sairin](https://github.com/nisoku/sairin) signals |
| **Output** | ESM + CJS builds with full TypeScript declarations |
| **Dependencies** | Zero. The entire library ships as a single bundle. |

## Documentation

| Page | Description |
| --- | --- |
| [**Language Reference**](/Sakko/language-reference/) | Full [Sakko](https://github.com/nisoku/sakko) syntax: blocks, modifiers, lists, void elements |
| [**Primitives**](/Sazami/primitives/) | All 48 web components with usage examples |
| [**Config & Theming**](/Sazami/config-theming/) | Design tokens, custom themes, CSS variable generation |
| [**Curvomorphism**](/Sazami/curvomorphism/) | How directional corner rounding works |
| [**API Reference**](/Sazami/api-reference/) | Complete public API: functions, types, exports, Sairin signal integration |

## Related Documentation

- [**Sairin Docs**](https://github.com/nisoku/sairin) - Reactive state management with signals, derived values, effects, and resources
- [**Sakko Docs**](/Sakko/language-reference/) - DSL syntax for writing component markup
