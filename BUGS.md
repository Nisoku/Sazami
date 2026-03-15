# Bugs

- [x] `icon-btn` renders weird, due to padding and size conflicts
- [x] xlarge should work
- [x] comments outside a root `<>` don't work in the playground
- [x] more built in elements
- [x] more icons
- [x] modifiers not applying for progress bars

- [ ] Full re-render on attribute change causes focus loss and flicker
  - render() does shadow.innerHTML = ... which destroys all internal state/focus
  - Interactive components (input, slider, etc.) lose focus on any attribute change
  - Accordion works around this with manual DOM reuse (_itemElements), but paths drift
  - Needs partial updates or virtual DOM diffing to fix properly
- [ ] Checkbox misaligned
- [ ] Fix curvomorphism not working properly and only the bottom left corner being rounded
- [ ] more sizes and configurability (xsmall, custom sizes, px, percent, etc)
      - while i'm at it, make it easier to make a primitive and not have to copy same stuff multiple times (for example for custom sizes)
- [ ] custom colors (rgb, hex, hsl, rgba, named, etc)
- [ ] custom primitives and configuring primitives
- [ ] Modal doesn't open (need Sairin)
- [ ] Move toast reactivity to Sairin
