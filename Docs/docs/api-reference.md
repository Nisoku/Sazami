---
title: "API Reference"
description: "Complete public API for compileSakko, transformer, config, and curvomorphism"
order: 5
---

# API Reference

Complete public API for Sazami.

> **Note:** The Sakko parser is now in the separate [`@nisoku/sakko`](https://github.com/nisoku/sakko) package. For the full Sakko syntax, see the [Sakko Language Reference](https://github.com/nisoku/sakko).

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
3. Parses source -> AST (uses `@nisoku/sakko`)
4. Transforms AST -> VNode tree
5. Renders VNode tree -> DOM
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

## Primitives API

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

A record mapping icon names to SVG markup strings. All 43 built-in icons use `currentColor` and scale to their container.

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

## Base Component System

Sazami provides a declarative component system with typed properties, events, and handler management. See [Component Base](/docs/component-base.md) for full documentation.

- `@component(config)` - Decorator for component metadata
- `SazamiComponent` - Base class for all components
- `addHandler()` / `removeHandler()` / `removeAllHandlers()` - Handler tracking
- `dispatch()` / `dispatchEventTyped()` / `onCleanup()` - Event utilities

---

## Sairin Signal Integration

Sazami primitives integrate with [Sairin](https://github.com/nisoku/sairin) signals for reactive state management. Components can accept both static values and Sairin `Signal` or `Derived` values.

> **Note:** For full details on Sairin's signal system, see the [Sairin documentation](https://github.com/nisoku/sairin). Key concepts:
> - [`signal(path, initial)`](https://github.com/nisoku/sairin) - Creates a reactive value
> - [`derived(path, fn)`](https://github.com/nisoku/sairin) - Creates a computed value
> - [`effect(fn)`](https://github.com/nisoku/sairin) - Runs side effects reactively
> - [`resource(loader, initial)`](https://github.com/nisoku/sairin) - Async data fetching

### Signal-Bound Properties

Most component properties support binding to signals:

| Component | Signal Properties |
| --------- | ------------------ |
| `text`, `badge`, `heading`, `label` | `content` |
| `button`, `icon-button` | `disabled` |
| `checkbox`, `switch`, `toggle`, `radio` | `checked`, `disabled` |
| `input`, `select`, `slider`, `progress` | `value` |
| `avatar`, `coverart`, `image` | `src` |

### Basic Usage

```typescript
import { signal, path } from '@nisoku/sairin';

// Create a signal
const text = signal(path("app", "message"), "Hello");

// Pass signal to component property
const el = document.createElement('saz-text');
el.content = text;
document.body.appendChild(el);

// Update signal - component re-renders automatically
text.set("World");
```

### Derived Signals

```typescript
import { signal, derived, path } from '@nisoku/sairin';

const firstName = signal(path("app", "firstName"), "John");
const lastName = signal(path("app", "lastName"), "Doe");

// Create derived signal
const fullName = derived(path("app", "fullName"), () => 
  `${firstName.get()} ${lastName.get()}`
);

// Pass derived to component
const el = document.createElement('saz-text');
el.content = fullName;
```

### Two-Way Binding

For form controls, changes in the UI automatically update the signal:

```typescript
import { signal, path } from '@nisoku/sairin';

const inputValue = signal(path("app", "inputValue"), "");

// Input updates the signal on every keystroke
const input = document.createElement('saz-input');
input.value = inputValue;
document.body.appendChild(input);

// Programmatic updates also work
inputValue.set("Hello");
```

### Boolean State

```typescript
import { signal, path } from '@nisoku/sairin';

const isDisabled = signal(path("app", "disabled"), false);

const button = document.createElement('saz-button');
button.disabled = isDisabled;

// Disable the button
isDisabled.set(true);
```

### Resource Integration

```typescript
import { signal, path, effect, resource } from '@nisoku/sairin';

const userData = resource(
  () => fetch('/api/user').then(r => r.json()),
  null
);

// Derive a string value from the resource
const userName = signal(path("app", "userName"), '');
effect(() => {
  userName.set(userData.value.get()?.name ?? '');
});

const el = document.createElement('saz-text');
el.content = userName;
```

### Reactivity Model

Sazami uses Sairin's `effect()` for reactive bindings:

- **One-way**: Signal changes propagate to component properties
- **Two-way**: Form inputs also write back to the signal
- **Automatic cleanup**: Bindings are cleaned up when the component is removed from the DOM

---

## Error Handling

Sazami uses [Satori](https://github.com/nisoku/satori) for structured logging. Errors are logged with context and suggestions.

### Error Functions

```typescript
import {
  propertyError,
  eventError,
  renderError,
  bindingError,
  unknownComponentError,
} from '@nisoku/sazami';

// Property configuration errors
propertyError('Invalid property value', {
  tag: 'saz-button',
  suggestion: 'Use a valid variant: default, accent, or ghost',
});

// Event dispatch errors
eventError('Event not defined in metadata', {
  tag: 'saz-input',
  suggestion: 'Add the event to your @component config',
});

// Render errors
renderError('Failed to render component', {
  suggestion: 'Check template syntax and styles',
});

// Binding errors
bindingError('Invalid binding', {
  property: 'value',
  suggestion: 'Use bind:value for two-way binding',
});

// Unknown component warning
unknownComponentError('my-component', 'Use saz- prefix');
```

### Integration with Sakko

Sakko (parser) also uses Satori for structured errors:

```typescript
import {
  tokenizerError,
  parserError,
} from '@nisoku/sakko';

tokenizerError('Invalid syntax', {
  suggestion: 'Check for missing quotes',
});

parserError('Unexpected token', {
  cause: 'missing closing tag',
});
```

---

## Accessibility

All interactive primitives include full keyboard support following WAI-ARIA patterns.

For component-specific props and methods, see [Component Base](/docs/component-base.md) and the [Primitives](/docs/primitives.md) reference.

### Keyboard Navigation

| Component | Keys | Behavior |
| ----------- | ------ | ---------- |
| Select | Enter/Space | Open/close dropdown |
| Select | Escape | Close dropdown |
| Select | Arrow Up/Down | Navigate options |
| Select | Home/End | First/last option |
| Tabs | Arrow Left/Right | Switch tabs |
| Tabs | Enter/Space | Activate focused tab |
| Modal | Escape | Close modal |
| Toast | Escape | Dismiss toast |
| Button | Enter/Space | Activate (native) |
| Checkbox | Enter/Space | Toggle (native) |
| Toggle | Enter/Space | Toggle (native) |
| Slider | Arrow Left/Right | Adjust value |

### Focus Management

- Focus is properly managed when opening/closing modals and selects
- Tab order follows visual layout
- Focus indicators are visible

---

## Types

All TypeScript types are exported:

```typescript
import type {
  VNode,
  ComponentDefinition,
  CurvomorphismOptions,
  SazamiComponentConfig,
  PropertyConfig,
  EventConfig,
} from '@nisoku/sazami';
```
