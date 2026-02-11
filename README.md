# Sazami

> [!WARNING]
> Sazami is currently incomplete!!! I'm still working on adding basic library functionality, but the idea and design are in place.
---

**A zero-dependency UI engine for the web.**

Write concise, readable markup in the Sakko language. Get real web components, automatic theming, and a unique directional corner-rounding effect called *[curvomorphism](https://github.com/NellowTCS/Curvomorphism/)*: all without installing a single dependency.

## What does it look like?

```sako
<card {
  heading: "Hello, world"
  text: "This compiles to real web components."
  button(primary): "Get Started"
}>
```

That is the entire source. No HTML boilerplate, no CSS classes, no imports. Sakko compiles it into a styled `<saz-card>` web component with a heading, a paragraph, and a themed button, all rendered into the DOM.

Here is a more realistic example:

```sako
<card(row center) {
  image(src "album.jpg" round): ""
  stack(gap small) {
    heading: "Midnight City"
    text(dim): "M83"
  }
  row(gap small) {
    icon-btn: "previous"
    icon-btn(accent large): "play"
    icon-btn: "next"
  }
}>
```

This produces a horizontal card with a round album cover, stacked song info, and SVG icon buttons.

## Getting started

### Install

```bash
npm install @nisoku/sazami
```

### Use

```typescript
import { compileSakko, injectThemeCSS } from "@nisoku/sazami";

// Inject the default theme (CSS variables on :root)
injectThemeCSS();

// Compile Sakko source and mount it
const source = `
  <card {
    heading: "Welcome"
    text: "Built with Sakko + Sazami"
    button(accent): "Get Started"
  }>
`;

compileSakko(source, document.getElementById("app"));
```

### Custom theme

Override any design token:

```typescript
injectThemeCSS({
  "color.primary": "#4a9eff",
  "color.accent": "#ff6b9d",
  "color.background": "#1a1a2e",
  "color.surface": "#16213e",
});
```

Tokens cover colors, spacing, typography, radii, shadows, and icon sizes. See the [theming docs](https://nisoku.github.io/Sazami/config-theming/) for the full list.

## How it works

Sakko is a three-layer system:

1. **Sakko**: a bracket-based DSL you write in `.sako` files (or inline)
2. **Sazami Primitives**: semantic web components (`saz-card`, `saz-button`, etc.)
3. **Sazami Config**: a CSS-variable theme engine driven by design tokens

The pipeline: 

```text
source text -> tokenize -> parse -> AST -> transform -> VNode tree -> render to DOM
```

Everything is compiled at runtime in the browser. No build step required. Additionally, the library ships as ESM and CJS with TypeScript declarations!

## Primitives

23 web components, grouped by purpose:

| Category | Components |
|---|---|
| Layout | `row`, `column`, `grid`, `stack`, `section` |
| Content | `card`, `text`, `heading`, `label` |
| Interactive | `button`, `icon-btn`, `input`, `checkbox`, `toggle` |
| Media | `image`, `coverart`, `icon` |
| Indicators | `badge`, `tag`, `divider`, `spacer` |
| Grouping | `details`, `controls` |

Every interactive primitive has:
- ARIA roles and `aria-*` attributes
- Keyboard navigation (Enter / Space)
- Focus-visible outlines
- Attribute reflection (`checked`, `disabled`)

## Icons

Sazami ships with 37 SVG icons. Icons inherit the current text color and scale with the `size` modifier:

```sako
<row(gap medium) {
  icon: "play"
  icon(large primary): "heart"
  icon-btn: "settings"
}>
```

Available: play, pause, stop, previous, next, skip, close, menu, search, settings, heart, star, check, plus, minus, edit, share, download, upload, refresh, home, back, forward, up, down.

## Modifiers

Modifiers are parenthesized flags or key-value pairs:

```sako
button(primary large): "Submit"
input(placeholder "Your email" type "email"): ""
grid(cols 3 gap medium): [...]
card(row center curved): { ... }
```

Flags like `primary`, `large`, `center`, `bold`, `disabled`, and `checked` map to HTML attributes. Key-value pairs like `cols 3` or `placeholder "Enter name"` set attributes directly.

## Curvomorphism

Curvomorphism rounds corners directionally based on each element's position relative to a center point. Elements closer to the center round their inward-facing corners more.

Enable it per-node with the `curved` flag, and set the center point on a parent:

```sako
<grid(cols 2 gap medium center-point) {
  card(curved) {
    text: "Top Left"
  },
  card(curved) {
    text: "Top Right"
  },
  card(curved) {
    text: "Bottom Left"
  },
  card(curved)
  {
    text: "Bottom Right"
  }
}>
```

## Playground

Open the [playground](https://nisoku.github.io/Sazami/playground/) in a browser to use the live editor. 

Type your Sakko code on the left; see the rendered output on the right. Includes example presets and error display with line/column info.

## Project structure

```text
Build/              Library source code
  src/
    parser/         Tokenizer, parser, AST types
    primitives/     Primitives (Web Components)
    config/         Design tokens and CSS variable generation
    runtime/        AST-to-VNode transformer and DOM renderer
    curvomorphism/  Directional corner rounding algorithm
    icons/          All icon stuff
      svgs/         The minimal built-in icon library
  tests/            Tests
Demo/               Live demo and interactive playground
Examples/           Example .sako source files
Docs/               Documentation (powered by DocMD)
```

## Development

```bash
cd Build
```

### Install dependencies
```bash
npm install
```

### Run tests
```bash
npm test
```

### Build
```bash
npm run build
```

### Type checking

```bash
npm run typecheck
```

## Documentation

| Document | Summary |
| --- | --- |
| [Language Reference](https://nisoku.github.io/Sazami/language-reference/) | Full Sakko syntax guide |
| [Primitives](https://nisoku.github.io/Sazami/primitives/) | Every component with examples |
| [Config & Theming](https://nisoku.github.io/Sazami/config-theming/) | Token system and custom themes |
| [Curvomorphism](https://nisoku.github.io/Sazami/curvomorphism/) | How directional rounding works |
| [API Reference](https://nisoku.github.io/Sazami/api-reference/) | Public API surface |

### Run locally

```bash
cd Docs
```

### Install dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Run dev server
```bash
npm run dev
```

## License

[Apache License v2.0](LICENSE)
