---
title: "Curvomorphism"
description: "Directional corner-rounding algorithm and usage"
order: 4
---

# Curvomorphism

Curvomorphism is a directional corner-rounding system that makes corners round toward a center point and sharp toward edges, creating a visual "pull" toward the content center.

---

## The Concept

**Traditional UI** gives all corners the same radius — every card looks identical regardless of position.

**Curvomorphism** makes corners directional:

- Corners facing the **center** of the layout → **rounded**
- Corners facing the **edges** of the viewport → **sharp**

This creates an organic visual flow that guides the user's eye toward the content center.

```
Layout with center point (C):

┌─────────┐          ╭─────────╮         ┌─────────┐
│ TL      │          │    T     │         │      TR │
│         │          │          │         │         │
└─────────╯         ╰─────────╯         └─────────┘
 Bottom-right        Bottom L+R          Bottom-left
   rounded            rounded              rounded

╭─────────╮            (C)             ╭─────────╮
│ L        │       ←─────────────→       │       R │
│          │                             │         │
╰─────────╯                            ╰─────────╯
  Right-side                            Left-side
   rounded                              rounded

┌─────────╮         ╭─────────╮         ╌─────────┐
│ BL      │          │    B     │         │      BR │
│         │          │          │         │         │
╰─────────┘         ╰─────────┘         ╰─────────╯
 Top-right            Top L+R            Top-left
   rounded            rounded             rounded
```

---

## The Algorithm

For each element, the algorithm:

1. Gets the element's bounding rect and computes its center point
2. Compares the element center to the layout center
3. For each corner, checks if both edges meeting at that corner face **inward** (toward center)
4. Rounds corners that face inward, keeps others sharp

```typescript
function applyCornerRounding(element, centerX, centerY, radiusValue) {
  const rect = element.getBoundingClientRect();
  const elCenterX = rect.left + rect.width / 2;
  const elCenterY = rect.top + rect.height / 2;

  const r = radiusValue; // rounded
  const s = "0px";       // sharp

  // Which edges face toward center?
  const leftIn  = elCenterX > centerX;
  const rightIn = elCenterX < centerX;
  const topIn   = elCenterY > centerY;
  const bottomIn = elCenterY < centerY;

  // Round only corners where BOTH meeting edges face inward
  element.style.borderTopLeftRadius     = topIn && leftIn   ? r : s;
  element.style.borderTopRightRadius    = topIn && rightIn  ? r : s;
  element.style.borderBottomLeftRadius  = bottomIn && leftIn  ? r : s;
  element.style.borderBottomRightRadius = bottomIn && rightIn ? r : s;
}
```

---

## Usage in Sakko

### Basic

```sako
card(curved) {
  text: "Auto-curvomorphic card"
}
```

### With Radius Control

```sako
card(curved soft)    // 4px radius
card(curved medium)  // 8px radius (default)
card(curved strong)  // 12px radius
```

### Explicitly Flat

```sako
card(flat) {
  text: "No curvomorphism"
}
```

---

## API

### `applyCurvomorphism(element, options?)`

Apply curvomorphism to a single element.

```typescript
import { applyCurvomorphism } from '@nisoku/sazami';

applyCurvomorphism(myElement, {
  radius: 'strong',   // Token name: 'soft', 'medium', 'strong'
  centerX: 500,       // Custom center X (default: viewport center)
  centerY: 400,       // Custom center Y (default: viewport center)
});
```

Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `radius` | `string` | `"medium"` | Radius token name |
| `centerX` | `number` | viewport center | Layout center X coordinate |
| `centerY` | `number` | viewport center | Layout center Y coordinate |

### `enableCurvomorphism(element, options?)`

Conditionally apply curvomorphism if the element has a `curved` attribute. Reads the `radius` attribute from the element.

```typescript
import { enableCurvomorphism } from '@nisoku/sazami';

// In a Web Component's connectedCallback:
connectedCallback() {
  this.render();
  enableCurvomorphism(this);
}
```

---

## Behavior

- Curvomorphism is applied after the element is rendered (via `requestAnimationFrame`)
- A `resize` event listener automatically re-applies rounding when the viewport changes
- The radius value is resolved from CSS variables (`--saz-radius-{type}`) with built-in fallbacks
- By default, the center point is the viewport center (`window.innerWidth/2`, `window.innerHeight/2`)

---

## When to Use

**Good for:**
- Cards in grids
- Sidebars and drawers
- Modal dialogs
- Floating toolbars
- Navigation panels
- Media players

**Skip for:**
- Tiny buttons (too small to notice)
- Dense control panels (looks noisy)
- Full-bleed backgrounds
- Text-only elements
