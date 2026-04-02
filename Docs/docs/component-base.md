---
title: "Component Base"
description: "Base component system, handler management, and events"
order: 6
---

# Component Base

Sazami provides a declarative base component system with typed properties, events, and handler management.

---

## `@component(config)`

Decorator that registers component metadata (properties, events, bindings) for the base class.

```typescript
import { component, SazamiComponent } from '@nisoku/sazami';

@component({
  properties: {
    variant: { type: 'string', reflect: true, default: 'default' },
    disabled: { type: 'boolean', reflect: true },
  },
  events: {
    change: { name: 'variant-change', detail: { variant: 'variant' } },
  },
  binds: {
    variant: 'attribute',
  },
})
export class MyComponent extends SazamiComponent {
  render() {
    this.mount(styles, template);
  }
}
```

### Config Options

| Option | Type | Description |
| -------- | ------ | ------------- |
| `properties` | `Record<string, PropertyConfig>` | Observable properties |
| `events` | `Record<string, EventConfig>` | Custom events |
| `binds` | `Record<string, BindingType>` | Auto-binding config |
| `observedAttributes` | `string[]` | Attributes to observe |

### PropertyConfig

```typescript
{
  type: 'string' | 'number' | 'boolean';
  reflect?: boolean;      // Mirror to attribute
  default?: string | number | boolean;
}
```

### EventConfig

```typescript
{
  name: string;                    // DOM event name
  detail?: Record<string, string> // Type-safe detail mapping
}
```

---

## SazamiComponent

Base class for all Sazami web components. Extends `HTMLElement`.

```typescript
import { SazamiComponent } from '@nisoku/sazami';

class MyComponent extends SazamiComponent {
  render() {
    this.mount(styles, template);
  }
}
```

### Lifecycle

- `connectedCallback()` - Called when element is added to DOM
- `disconnectedCallback()` - Called when element is removed (runs cleanup)
- `render()` - Override in subclass to render content

---

## Handler Management

All components have built-in handler tracking for proper cleanup:

### `addHandler(type, handler, options?)`

Add an event handler with automatic tracking. Returns an ID for later removal.

```typescript
// Basic usage
const handlerId = this.addHandler('click', this.handleClick);

// Track internal handlers (auto-removed on disconnect)
this.addHandler('keydown', this.handleKeydown, { internal: true });

// Track handlers on child elements
this.addHandler('change', this.handleChange, { element: this.$('input') });
```

**Parameters:**

- `type: string` - Event type (e.g., 'click', 'keydown')
- `handler: Function` - Event handler function
- `options.internal?: boolean` - Mark as internal handler
- `options.element?: EventTarget` - Target element (defaults to component)

### `removeHandler(typeOrId, idOrFn?)`

Remove handlers by ID, function reference, or type.

```typescript
// Remove by ID
this.removeHandler(handlerId);

// Remove by type and ID
this.removeHandler('click', handlerId);

// Remove by function reference
this.removeHandler('click', this.handleClick);
```

### `removeAllHandlers(options?)`

Remove all handlers, optionally filtered.

```typescript
// Remove all handlers
this.removeAllHandlers();

// Remove all click handlers
this.removeAllHandlers({ type: 'click' });

// Remove only internal handlers
this.removeAllHandlers({ source: 'internal' });
```

---

## Event Dispatch

### `dispatch(name, detail, options)`

Dispatch a custom event.

```typescript
this.dispatch('my-event', { data: 123 });
this.dispatch('my-event', { data: 123 }, { bubbles: false, composed: false });
```

### `dispatchEventTyped(event, detail)`

Dispatch a typed event based on component metadata.

```typescript
// With config: events: { change: { name: 'variant-change', detail: { variant: 'variant' } } }
this.dispatchEventTyped('change', { variant: 'primary' });
```

### `onCleanup(fn)`

Register cleanup functions for Sairin bindings. Called on disconnect. This integrates with [Sairin's `effect()`](https://github.com/nisoku/sairin) cleanup system.

```typescript
this.onCleanup(() => {
  // Cleanup logic
});
```

---

## Utility Methods

### `mount(styles, template)`

Render template with styles into Shadow DOM.

```typescript
this.mount('p { color: red }', '<p>Hello</p>');
```

### `$(selector)`

Query stable internal nodes.

```typescript
const input = this.$<HTMLInputElement>('input');
```

---

## Accessibility

All interactive primitives include full keyboard support following WAI-ARIA patterns.

| Component | Keys | Behavior |
| ----------- | ------ | ---------- |
| Select | Enter/Space | Open/close dropdown |
| Select | Escape | Close dropdown |
| Select | Arrow Up/Down | Navigate options |
| Tabs | Arrow Left/Right | Switch tabs |
| Modal | Escape | Close modal |
| Toast | Escape | Dismiss toast |
| Slider | Arrow Left/Right | Adjust value |
