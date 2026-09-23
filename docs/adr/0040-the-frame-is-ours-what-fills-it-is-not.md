# ADR-0040 — The frame is ours, what fills it is not

**Date:** 2026-09-23
**Status:** Accepted
**Extends:** ADR-0038 (the snapshot is generated, never chosen; the error is the snapshot's, not the
project's), ADR-0031 (a width Figma draws is a ceiling, not a size), ADR-0021 (slotted content and
scoped CSS), ADR-0026 (`Table`'s prop behind a slot), ADR-0039 (read the rendered pixel)
**Breaking:** none in the API — `snapshot` keeps working and the slot's fallback *is* the markup it
replaced. One in layout: a card in a column wider than 280px no longer fills it.

## Context

Three questions about `ProjectCard` arrived in one session, and they turned out to be one question
asked three times: **where does the card stop and the product start?**

- The card had no width of its own. Figma draws the frame at 280px, the stories pinned 280px on a
  wrapper, and every story therefore looked right — so nobody had noticed that the component itself
  stretched to whatever column it was handed.
- Its banner took a URL and nothing else, with `alt=""` written into the template.
- And a URL that 404s rendered the browser's broken-image glyph, next to a card that already owns
  the copy for exactly that situation.

ADR-0038 had answered a version of the middle one — "the snapshot is **generated, never chosen**" —
and that sentence was read here as closing the API to a string. It does not say that. It settles
**which image** the card shows, not **how the image is referenced**, and the two had been fused into
one prop.

## Decisions

### 280px is a ceiling, and the card is what carries it

ADR-0031 wrote this rule for `ModuleCapsule` and ADR-0035 applied it again to `BrandPattern`'s
`scale`. `ProjectCard` never got it, because the number lived in the stories instead of the
component — which is the specific way this mistake hides.

`max-width`, not `width`: a narrower column still gets a card. The cap matters because the media is
`aspect-ratio: 280 / 128`, so without it the tile grew with the column and a snapshot framed on the
union of the project's geometries turned into a banner.

It is written `17.5em` rather than `280px`, so the shell follows the type size rather than leaving
the same box around smaller words. Worth knowing which way that resolves: `.ds-project-card`
declares no `font:` of its own — every role in the file sits on a child — so the `em` reads the
**inherited** size, i.e. the consumer's. That is the intent, and it also means **the ceiling is not
a constant**: a container at 14px yields a 245px card. `17.5rem` is the version that is constant,
and is what `EmptyState` and `ChartTooltip` use for their own caps.

### The frame is ours, the reference is the product's

`snapshot` gains a slot behind it, which is the shape `Table` already uses for `emptyText` behind
`#empty`: **the prop is the simple path and the fallback content, the slot is the escape hatch.**

A string cannot carry the things a product legitimately needs:

- `srcset` / `sizes` — a 280px card is 560 device pixels on a retina screen, so a 1× tile is
  visibly soft;
- format negotiation — `<source type="image/avif">` with a JPEG behind it;
- `loading="lazy"`, `decoding`, `fetchpriority` — a grid of twenty cards otherwise fetches twenty
  images eagerly;
- an element that is not an `<img>` at all — a `<canvas>` for a product that renders the map
  client-side rather than linking a tile.

**What does not move is the frame**: ratio, clip, top radius, ground, and the two controls that sit
on the image. Handing those over with the content is what ADR-0006 forbids — a component that puts
something on a surface owns the pairing — and it is also the whole reason the slot is safe to offer.

`snapshotAlt` joins it, defaulting to `''`. Empty is the honest value while the tile is a render of
data the card already states in words; a product that puts something *else* in the frame has to be
able to name it, which is why `Avatar` and `Tag` both take one.

The CSS is deliberately in two parts. `object-fit` on a `<picture>` does nothing — it is a wrapper
whose own box means nothing — so the **direct child fills** the frame and the **thing that carries
pixels covers** it, at whatever depth it sits. And both selectors are `:deep()`, because slotted
content carries the *consumer's* scope id and a plain scoped rule misses it **silently**. That is
the trap ADR-0021 recorded against `SurfaceTransition`, and this is the second time it would have
bitten.

### A frame that renders an image owns that image's failure

`state="error"` is a prop, so reaching it means the product already knows the URL is bad — which it
cannot learn without fetching the image a second time. The `<img>` knows first and for free. So the
frame listens to its own `@error` and lands on the same empty state the prop reaches.

**The pill does not move.** `statusLabel` and `statusTone` read `state` directly, so a `done`
project with a broken tile still reads *Terminé*. ADR-0038's "the error is the snapshot's failure,
not the project's" was descriptive while a prop was the only way in; it is load-bearing now, because
this is the path that reaches the rendering without the product saying anything.

The flag resets when `snapshot` changes, or a card recycled through a list stays broken on an
address that was never tried.

**The slot is out of scope, on purpose.** We do not own that element and cannot hear it fail. A
product that fills `#snapshot` handles its own failure, and `state="error"` is still there to reach
the same rendering by hand. The rule is the one the whole ADR is named for: the failure belongs to
whoever rendered the element.

## Consequences

- **A consumer relying on the card filling a wide column will see it stop at 280px.** That is the
  intended correction, and it is the only visible change to existing calls.
- **The `em` ceiling is recorded, not resolved.** It behaves as asked, and it is a ratio rather than
  a constant. If a product ever nests cards under a container with its own `font-size`, the grid
  will hold cards of two widths and this paragraph is where to look.
- **ADR-0038's rule survives intact.** The slot does not reopen the cover picker: it changes the
  reference format, not the provenance of the image. What it does confirm is that the rule was never
  enforceable in code and is not now — a product could always pass an arbitrary photograph.
- **The contrast risk ADR-0038 recorded is now wider in reach**, though not in kind. The pill and
  the overflow button still sit on whatever fills the frame, and that can now be an arbitrary
  element rather than an arbitrary photograph. Still recorded rather than solved.
- **Nothing in the linter can see a slot boundary**, and nothing would have caught the `<picture>`
  case: `object-fit` was declared on a selector that matched, on an element where the property means
  nothing. It was found by rendering four variants and measuring the element that carries the pixels
  — ADR-0039's method, applied on purpose this time rather than after the fact.
