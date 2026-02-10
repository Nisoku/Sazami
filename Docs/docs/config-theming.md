---
title: "Config & Theming"
description: "Design token system, CSS custom properties, and custom theme configuration"
order: 3
---

# Sazami Config & Theming

The Sazami Config system provides design tokens that drive all visual styling through CSS custom properties.

---

## Overview

Design tokens are defined in JavaScript objects, converted to CSS variables, and injected into the document. All primitives reference these variables, making the entire UI themeable by changing token values.

```
Token Definition  →  CSS Variable Generation  →  :root injection  →  Components consume
```

---

## Token Categories

### Colors

| Token | Default | CSS Variable |
|-------|---------|-------------|
| `color.background` | `#ffffff` | `--saz-color-background` |
| `color.surface` | `#f8f9fa` | `--saz-color-surface` |
| `color.border` | `#e0e0e0` | `--saz-color-border` |
| `color.primary` | `#2563eb` | `--saz-color-primary` |
| `color.accent` | `#ff4d8a` | `--saz-color-accent` |
| `color.success` | `#10b981` | `--saz-color-success` |
| `color.danger` | `#ef4444` | `--saz-color-danger` |
| `color.text` | `#1f2937` | `--saz-color-text` |
| `color.text-dim` | `#6b7280` | `--saz-color-text-dim` |
| `color.text-dimmer` | `#9ca3af` | `--saz-color-text-dimmer` |
| `color.on-primary` | `#ffffff` | `--saz-color-on-primary` |
| `color.on-accent` | `#ffffff` | `--saz-color-on-accent` |
| `color.on-success` | `#ffffff` | `--saz-color-on-success` |
| `color.on-danger` | `#ffffff` | `--saz-color-on-danger` |

### Spacing

| Token | Default | CSS Variable |
|-------|---------|-------------|
| `space.tiny` | `4px` | `--saz-space-tiny` |
| `space.small` | `8px` | `--saz-space-small` |
| `space.medium` | `12px` | `--saz-space-medium` |
| `space.large` | `16px` | `--saz-space-large` |
| `space.xlarge` | `24px` | `--saz-space-xlarge` |
| `space.xxlarge` | `32px` | `--saz-space-xxlarge` |

### Typography

| Token | Default | CSS Variable |
|-------|---------|-------------|
| `font.family` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | `--saz-font-family` |
| `text.size.small` | `12px` | `--saz-text-size-small` |
| `text.size.medium` | `14px` | `--saz-text-size-medium` |
| `text.size.large` | `16px` | `--saz-text-size-large` |
| `text.size.xlarge` | `20px` | `--saz-text-size-xlarge` |
| `text.weight.light` | `300` | `--saz-text-weight-light` |
| `text.weight.normal` | `400` | `--saz-text-weight-normal` |
| `text.weight.medium` | `500` | `--saz-text-weight-medium` |
| `text.weight.bold` | `700` | `--saz-text-weight-bold` |
| `text.leading.tight` | `1.25` | `--saz-text-leading-tight` |
| `text.leading.normal` | `1.5` | `--saz-text-leading-normal` |
| `text.leading.loose` | `1.75` | `--saz-text-leading-loose` |

### Radii

| Token | Default | CSS Variable |
|-------|---------|-------------|
| `radius.none` | `0px` | `--saz-radius-none` |
| `radius.soft` | `4px` | `--saz-radius-soft` |
| `radius.medium` | `8px` | `--saz-radius-medium` |
| `radius.strong` | `12px` | `--saz-radius-strong` |
| `radius.round` | `9999px` | `--saz-radius-round` |

### Shadows

| Token | Default | CSS Variable |
|-------|---------|-------------|
| `shadow.soft` | `0 1px 3px rgba(0,0,0,0.1)` | `--saz-shadow-soft` |
| `shadow.medium` | `0 4px 6px rgba(0,0,0,0.1)` | `--saz-shadow-medium` |
| `shadow.strong` | `0 10px 15px rgba(0,0,0,0.1)` | `--saz-shadow-strong` |

### Icon Sizes

| Token | Default | CSS Variable |
|-------|---------|-------------|
| `icon.size.small` | `16px` | `--saz-icon-size-small` |
| `icon.size.medium` | `20px` | `--saz-icon-size-medium` |
| `icon.size.large` | `24px` | `--saz-icon-size-large` |
| `icon.size.xlarge` | `32px` | `--saz-icon-size-xlarge` |

---

## Custom Themes

Override any token by passing custom values to `injectThemeCSS` or `generateThemeCSS`:

```typescript
import { injectThemeCSS } from '@nisoku/sazami';

// Dark theme override
injectThemeCSS({
  'color.background': '#1a1a2e',
  'color.surface': '#16213e',
  'color.border': '#2a2a4a',
  'color.text': '#e0e0e0',
  'color.text-dim': '#a0a0b0',
  'color.primary': '#4a9eff',
  'color.accent': '#ff6b9d',
});
```

Custom tokens are merged with defaults — only specify what you want to change.

---

## Programmatic Access

### `generateThemeCSS(customTokens?)`

Returns the complete CSS string for injection:

```typescript
import { generateThemeCSS } from '@nisoku/sazami';

const css = generateThemeCSS({ 'color.primary': '#ff0000' });
// Returns: ":root { --saz-color-primary: #ff0000; --saz-color-accent: ... }"
```

### `generateCSSVariables(tokens)`

Converts a token map to CSS variable declarations (without `:root` wrapper):

```typescript
import { generateCSSVariables } from '@nisoku/sazami';

const vars = generateCSSVariables({ 'color.primary': '#ff0000' });
// Returns: "  --saz-color-primary: #ff0000;"
```

### `getTokenValue(key, customTokens?)`

Look up a token's resolved value:

```typescript
import { getTokenValue } from '@nisoku/sazami';

getTokenValue('color.primary');                          // "#2563eb"
getTokenValue('color.primary', { 'color.primary': '#ff0000' }); // "#ff0000"
getTokenValue('nonexistent');                             // undefined
```

### `defaultTokens`

The complete default token map, useful for inspection or cloning:

```typescript
import { defaultTokens } from '@nisoku/sazami';

console.log(Object.keys(defaultTokens).length); // 40+
```

---

## How Components Consume Tokens

Primitives reference CSS variables in their Shadow DOM styles with fallback values:

```css
:host {
  background: var(--saz-color-surface, #f8f9fa);
  padding: var(--saz-space-medium, 12px);
  border-radius: var(--saz-radius-medium, 8px);
  font-size: var(--saz-text-size-medium, 14px);
}
```

This means components work even without theme injection (using fallback values), but theming gives centralized control over the entire UI.
