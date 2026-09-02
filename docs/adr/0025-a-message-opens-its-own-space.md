# ADR-0025 — A message opens its own space

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the last item on the feel agenda — expansion

## Context

The agenda item was written as "expansion", framed around accordions. **There is no accordion**, and
building one to justify an animation would be the wrong order.

So the question became: what in-flow content actually toggles? Seven components render conditional
blocks, and five of them are decided by a prop that never changes — `supportingText` is either
passed or it is not, so animating it would never be seen by anyone.

**One thing genuinely toggles at runtime: `FormField`'s message.** It reaches eight controls — every
input in the catalogue — so a single change touches every form in the product.

## Decisions

### Two motions live in that one slot, and only one of them was worth building

`message = error || hint || ''`. One element, so:

- **hint → error** — same slot, nothing moves, the colour turns and a glyph appears. **The common
  case**: the stories carry 30 hints against 9 errors.
- **nothing → message** — the height opens and everything below shifts. Rarer, and the jarring one.

The colour now transitions. **The text does not cross-fade**, deliberately: an error has to be
readable the instant it replaces a hint, and fading between two strings makes both unreadable for
the duration.

### The height animates because the layout should not jump

`height: auto` is not animatable. The wrapper is a one-row grid and the row goes `0fr → 1fr`, which
is. The child carries `overflow: hidden` or it spills out of the collapsed row.

**The grid has to live on the transitioning element, not on a static parent.** Vue applies
`enter-from` / `leave-to` to the element it mounts, and on leave the content must still be present
for the space to have something to close over. A static wrapper with a toggled class collapses
instantly, because `v-if` has already removed whatever gave the row its height. That is the detail
that makes this worth writing down rather than re-deriving.

**`quick` (100ms), not `enter` (200ms).** An error must not be late. The duration exists to stop the
layout jumping, not to make an entrance.

### Proven by mutation

`Message appearing and leaving` toggles a real error and watches the paragraph below it.

With the animation: the paragraph reads **104 → 110 mid-flight → 130**, and back the same way.
With `grid-template-rows: 0fr` removed from `enter-from`, it reads **104 → 130 in the first frame** —
it jumps. That is the discriminating measurement, and the story would have been worthless without it.

### Not extracted into a component

`SurfaceTransition` and `MarkTransition` exist because two or more components needed them. This has
**one** consumer. It stays in `FormField` with the technique documented in place; it earns extraction
the day an accordion arrives and re-derives the `0fr` trick.

## What changes

- `FormField`'s message expands and collapses instead of shoving the layout; its colour transitions.
- `Message appearing and leaving` story.

## Still open

Nothing on the feel agenda. What is left across all ADRs is deferred against a named trigger: a
modal, a native app, a consumer for the mobile type scale, an accordion.
