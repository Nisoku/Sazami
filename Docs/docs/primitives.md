---
title: "Sazami Primitives"
description: "All 48 semantic Web Components with attributes, modifiers, and examples"
order: 2
---

# Sazami Primitives

Sazami primitives are semantic Web Components that the [Sakko](https://github.com/nisoku/sakko) compiler targets. Each primitive is a custom element (`<saz-*>`) with Shadow DOM encapsulation and theme-driven styling.

> **Tip:** See the [Sakko Language Reference](/Sakko/language-reference/) for how to use these components in Sakko markup syntax.

All interactive primitives have ARIA roles, keyboard navigation (Enter/Space), focus-visible outlines, and attribute reflection.

---

## Layout Primitives

### `row`

Horizontal flex container.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `gap` | `small`, `medium`, `large`, `xlarge` | `medium` | Space between children |
| `justify` | `flex-start`, `space-between`, `space-around`, `center` | `flex-start` | Main axis alignment |
| `align` | `flex-start`, `center`, `flex-end` | `flex-start` | Cross axis alignment |
| `wrap` | `wrap`, `nowrap` | `nowrap` | Wrap behavior |

```sako
row(center gap large): [button: A, button: B]
row(space-between gap medium) { text: Left; text: Right }
```

### `column`

Vertical flex container.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `gap` | `small`, `medium`, `large`, `xlarge` | `medium` | Space between children |
| `justify` | `flex-start`, `space-between`, `center` | `flex-start` | Main axis alignment |
| `align` | `stretch`, `center`, `flex-start`, `flex-end` | `stretch` | Cross axis alignment |

```sako
column(gap small) { text: Line 1; text: Line 2 }
```

### `grid`

CSS grid container with responsive column support.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `cols` | Any number | `1` | Number of columns |
| `gap` | `small`, `medium`, `large`, `xlarge` | `medium` | Gap between cells |
| `md:cols` | Any number | - | Columns at ≥768px |
| `lg:cols` | Any number | - | Columns at ≥1024px |

```sako
<grid(cols 3 gap large) {
  card { text: "1" },
  card { text: "2" },
  card { text: "3" }
}>
```

### `stack`

Overlapping layers using CSS grid stacking (all children occupy the same grid cell).

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `align` | `center`, etc. | `center` | Content alignment |

```sako
<stack {
  image: "background.jpg"
  text(bold): "Overlay Text"
}>
```

---

## Content Primitives

### `card`

Panel/container with background, border, and shadow.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `variant` | `default`, `accent`, `primary`, `secondary`, `dim` | `default` | Color variant |
| `layout` | `row`, `column` | `column` | Flex direction |
| `gap` | `small`, `medium`, `large` | `small` | Child spacing |
| `align` | `center`, etc. | - | Cross axis alignment |
| `justify` | `space-between`, etc. | - | Main axis alignment |
| `curved` | (boolean) | - | Enable curvomorphism |
| `radius` | `soft`, `medium`, `strong` | `medium` | Curvomorphism radius |

```sako
<card(row center curved) {
  text(bold): "Title"
  button(accent): "Action"
}>
```

### `text`

Text display with size, weight, and tone control.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `size` | `small`, `medium`, `large`, `xlarge` | `medium` | Font size |
| `weight` | `light`, `normal`, `medium`, `bold` | `normal` | Font weight |
| `tone` | `default`, `dim`, `dimmer` | `default` | Text color |

```sako
text(bold large): "Title"
text(dim small): "Caption"
```

### `heading`

Heading text - bold and larger by default.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `size` | `medium`, `large`, `xlarge` | `large` | Font size |
| `weight` | `normal`, `bold` | `bold` | Font weight |

```sako
heading: "Welcome"
heading(xlarge): "Big Title"
```

### `label`

Form label - small, medium-weight, uppercase, dimmed.

```sako
label: "Email Address"
```

---

## Interactive Primitives

### `button`

Clickable button with variant styling and hover/active states.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `variant` | `primary`, `accent`, `secondary`, `danger`, `dim` | `primary` | Color variant |
| `size` | `small`, `medium`, `large` | `medium` | Padding and font size |
| `disabled` | (boolean) | - | Disable interaction |

```sako
button(accent large): "Save"
button(secondary): "Cancel"
button(danger disabled): "Delete"
```

### `icon-btn`

Icon-only button with built-in SVG icons.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `icon` | `play`, `pause`, `stop`, `previous`, `next`, `skip`, `close`, `menu`, `search` | - | Icon name |
| `variant` | `primary`, `accent`, `secondary`, `dim` | `secondary` | Color variant |
| `size` | `small`, `medium`, `large` | `medium` | Icon and padding size |
| `disabled` | (boolean) | - | Disable interaction |

```sako
icon-btn: play
icon-btn(accent large): play
```

### `input`

Text input field with focus states.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `size` | `small`, `medium`, `large` | `medium` | Input size |
| `placeholder` | any string | - | Placeholder text |
| `type` | `text`, `password`, `email`, etc. | `text` | Input type |
| `disabled` | (boolean) | - | Disable input |

```sako
label: "Email"
input(placeholder "you@example.com" type email): ""

label: "Password"
input(type password placeholder "Enter password"): ""
```

### `checkbox`

Checkbox with label support.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `checked` | (boolean) | - | Checked state |
| `disabled` | (boolean) | - | Disable interaction |

```sako
row(space-between) {
  text: "Accept terms"
  checkbox: ""
}
row(space-between) {
  text: "Subscribe to newsletter"
  checkbox(checked): ""
}
```

### `toggle`

Toggle switch with animated thumb.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `checked` | (boolean) | - | On/off state |
| `disabled` | (boolean) | - | Disable interaction |

```sako
row(space-between) {
  text: "Dark mode"
  toggle: ""
}
row(space-between) {
  text: "Notifications"
  toggle(checked): ""
}
```

### `radio`

Radio button with group support.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `name` | string | - | Group name |
| `value` | string | - | Radio value |
| `checked` | (boolean) | - | Checked state |
| `disabled` | (boolean) | - | Disable interaction |

```sako
radio(name "color" value "red"): "Red"
radio(name "color" value "blue" checked): "Blue"
```

### `switch`

Toggle switch with variant support.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `checked` | (boolean) | - | On/off state |
| `variant` | `default`, `accent`, `success` | `default` | Color variant |
| `disabled` | (boolean) | - | Disable interaction |

```sako
switch: "WiFi"
switch(checked): "Bluetooth"
switch(checked variant "accent"): "Notifications"
```

### `slider`

Range slider with value display.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `value` | number | `50` | Current value |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `step` | number | `1` | Step increment |
| `size` | `small`, `medium`, `large`, `xlarge` | `medium` | Track height |
| `disabled` | (boolean) | - | Disable interaction |

```sako
slider(value 50 min 0 max 100 step 1): ""
```

### `select`

Dropdown select with options.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `value` | string | - | Selected value |
| `placeholder` | string | "Select..." | Placeholder text |
| `disabled` | (boolean) | - | Disable interaction |

```sako
select(placeholder "Choose..."): [
  option(value "a"): "Option A",
  option(value "b"): "Option B"
]
```

---

## Navigation Primitives

### `tabs`

Tabbed interface with animated transitions.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `active` | number | `0` | Active tab index |

```sako
tabs(active 0): [
  tab(slot "tab" label "Tab 1"): "",
  tab(slot "tab" label "Tab 2"): "",
  div(slot "panel"): "Content 1",
  div(slot "panel"): "Content 2"
]
```

### `accordion`

Collapsible sections.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `single-open` | (boolean) | - | Only one section open at a time |

```sako
accordion: [
  div(heading "Section 1" slot "panel"): "Content 1",
  div(heading "Section 2" open slot "panel"): "Content 2"
]
```

---

## Feedback Primitives

### `spinner`

Loading spinner with size variants.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `size` | `tiny`, `small`, `medium`, `large`, `xlarge` | `medium` | Spinner size |
| `variant` | `default`, `accent`, `light` | `default` | Color variant |
| `label` | string | - | Accessible label |

```sako
spinner: ""
spinner(large): ""
spinner(xlarge accent): ""
```

### `progress`

Progress bar with customizable fill.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `value` | number | `50` | Current value |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `size` | `tiny`, `small`, `medium`, `large`, `xlarge` | `medium` | Bar height |
| `variant` | `default`, `accent`, `success`, `danger` | `default` | Color variant |
| `indeterminate` | (boolean) | - | Animated loading state |

```sako
progress(value 30 max 100): ""
progress(value 75 max 100 variant "success"): ""
progress(indeterminate): ""
```

### `toast`

Toast notification with auto-dismiss.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `message` | string | - | Toast message |
| `variant` | `default`, `success`, `error`, `warning`, `info` | `default` | Color variant |
| `duration` | number | `3000` | Auto-dismiss delay (ms) |
| `no-close` | (boolean) | - | Hide close button |

```sako
toast(message "Saved!" variant "success"): ""
```

---

## Overlay Primitives

### `modal`

Dialog with overlay and animations.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `title` | string | - | Modal title |
| `open` | (boolean) | - | Open state |

```sako
modal(title "Confirm"): [
  text: "Are you sure?"
]
```

---

## Display Primitives

### `avatar`

User avatar with image or initials.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `src` | URL string | - | Image source |
| `alt` | string | - | Alt text for image |
| `size` | `tiny`, `small`, `medium`, `large`, `xlarge` | `medium` | Avatar size |
| `shape` | `circle`, `square`, `rounded` | `circle` | Border shape |

```sako
avatar: "JD"
avatar(src "https://example.com/img.jpg"): ""
avatar(alt "John Doe" large): ""
```

### `chip`

Selectable/removable tag.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `label` | string | - | Chip text |
| `variant` | `default`, `primary`, `accent`, `success`, `danger`, `warning` | `default` | Color variant |
| `selected` | (boolean) | - | Selected state |
| `removable` | (boolean) | - | Show remove button |
| `size` | `small`, `medium`, `large`, `xlarge` | `medium` | Chip size |

```sako
chip: "Basic"
chip(selected): "Selected"
chip(accent): "Accent"
chip(removable): "Removable"
```

---

## Media Primitives

### `image`

Image display with shape variants.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `src` | URL string | - | Image source |
| `alt` | string | - | Alt text |
| `shape` | `default`, `round`, `square` | `default` | Border radius |

### `coverart`

Specialized image for album/media artwork. Fixed aspect ratio, square by default.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `src` | URL string | - | Image source |
| `shape` | `square`, `round` | `square` | Border shape |
| `size` | `small`, `medium`, `large`, `xlarge` | `medium` | Dimensions (48–160px) |

```sako
coverart(round): "album.jpg"
```

### `icon`

SVG icon display with built-in icon set.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `icon` | play, pause, stop, previous, next, skip, back, forward, close, menu, search, settings, heart, star, check, plus, minus, edit, share, download, upload, refresh, home, up, down, mail, phone, calendar, clock, user, users, folder, file, image, camera, bell, lock, link, trash, copy, bookmark, pin, globe | - | Icon name |
| `size` | `small`, `medium`, `large`, `xlarge` | `medium` | Icon size |
| `color` | `current`, or token name | `current` | Icon color |

```sako
icon: "play"
icon(accent large): "heart"
```

---

## Indicator Primitives

### `badge`

Small pill-shaped label.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `variant` | `default`, `accent`, `primary`, `success`, `danger` | `default` | Color variant |

```sako
badge(accent): "NEW"
badge(success): "Active"
```

### `tag`

Larger label/category tag with border.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `variant` | `secondary`, `primary`, `accent`, `success`, `danger` | `secondary` | Color variant |

### `divider`

Horizontal or vertical separator line.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `direction` | `horizontal`, `vertical` | `horizontal` | Line direction |

### `spacer`

Empty space element for manual spacing.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `size` | `small`, `medium`, `large`, `xlarge` | `medium` | Space size |

---

## Grouping Primitives

### `section`

A layout section that can define a curvomorphism center point.

| Attribute | Values | Default | Description |
| ----------- | -------- | --------- | ------------- |
| `center-point` | `x,y` coordinates | - | Set curvomorphism center |
| `gap` | `small`, `medium`, `large` | `medium` | Child spacing |
| `variant` | `default`, `accent`, `primary` | `default` | Background variant |

```sako
section(center-point "400,300") {
  card(curved) { text: "Auto-curving card" }
}
```

### `details`

Generic grouping container for descriptive content (track info, metadata, etc.).

```sako
<details {
  text(bold large): "Midnight City"
  text(dim): "M83"
  badge(accent): "Synthwave"
}>
```

### `controls`

Generic grouping container for interactive control elements.

```sako
<controls {
  icon-btn: previous;
  icon-btn(accent large): play;
  icon-btn: next
}>
```

---

## Component Registry

All primitives are registered in a central registry that maps Sakko element names to custom element tags:

| Sakko Name | Custom Element Tag |
| ------------ | ------------------- |
| `card` | `saz-card` |
| `text` | `saz-text` |
| `heading` | `saz-heading` |
| `label` | `saz-label` |
| `button` | `saz-button` |
| `icon-btn` | `saz-icon-button` |
| `input` | `saz-input` |
| `checkbox` | `saz-checkbox` |
| `toggle` | `saz-toggle` |
| `radio` | `saz-radio` |
| `switch` | `saz-switch` |
| `slider` | `saz-slider` |
| `select` | `saz-select` |
| `tabs` | `saz-tabs` |
| `accordion` | `saz-accordion` |
| `spinner` | `saz-spinner` |
| `progress` | `saz-progress` |
| `toast` | `saz-toast` |
| `modal` | `saz-modal` |
| `avatar` | `saz-avatar` |
| `chip` | `saz-chip` |
| `row` | `saz-row` |
| `column` | `saz-column` |
| `grid` | `saz-grid` |
| `stack` | `saz-stack` |
| `image` | `saz-image` |
| `coverart` | `saz-coverart` |
| `icon` | `saz-icon` |
| `badge` | `saz-badge` |
| `tag` | `saz-tag` |
| `divider` | `saz-divider` |
| `spacer` | `saz-spacer` |
| `section` | `saz-section` |
| `details` | `saz-details` |
| `controls` | `saz-controls` |

Elements not in the registry are rendered with a `saz-` prefix (e.g., `player` becomes `saz-player`).
