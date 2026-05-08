# TODO

- [ ] more sizes and configurability (xsmall, custom sizes, px, percent, etc)
      - while i'm at it, make it easier to make a primitive and not have to copy same stuff multiple times (for example for custom sizes)
- [ ] custom colors (rgb, hex, hsl, rgba, named, etc)
- [ ] custom primitives and configuring primitives

## Bugs

- [ ] Full re-render on attribute change causes focus loss and flicker
  - render() does shadow.innerHTML = ... which destroys all internal state/focus
  - Interactive components (input, slider, etc.) lose focus on any attribute change
  - Accordion works around this with manual DOM reuse (_itemElements), but paths drift
  - Needs partial updates to fix properly (NO DOM)
- [ ] Several components add event handlers in render() without deduplication:
- [ ] Modal doesn't open (need Sairin)
- [ ] Move toast reactivity to Sairin
