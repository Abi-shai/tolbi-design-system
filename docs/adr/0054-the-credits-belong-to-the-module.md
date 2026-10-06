# ADR-0054 — The credits belong to the module

**Date:** 2026-10-06
**Extends:** ADR-0024 (one owner), ADR-0042 (the identity rolls, an odometer), ADR-0049 (`credits`
absent means no chip; the identity track; filming by slowing the tokens), ADR-0025 (`0fr → 1fr`),
ADR-0039 (a skeleton previews a weight), ADR-0052 (`offsetWidth` rounds; Vue swaps classes a frame
late)
**Source:** the product's request on 0.30.0, after a product decision of 4 October 2026: credits are
split by module
**Status:** Accepted
**Breaking:** `credits` without `module`, or with `lockup: false`, no longer renders a chip.

## Context

Each module has its own balance, and it is spent nowhere else. The rule lived in the product, which
passed `credits: undefined` outside a module; the package did not know it.

The chip was also a bare `v-if`. That produced three visible problems:

- **Home → Yield:** the mark rolled in while the chip popped into place.
- **Yield → Scan:** the mark rolled while the balance changed in one frame.
- **Loading:** the product loads the balance after navigating, and meanwhile it had nothing true to
  show. It showed « 0 crédit » in orange for an instant, or the previous module's balance.

## Decisions

### The rule is the package's

The chip shows when three things hold: the identity slot is open (`lockup`), there is a `module`, and
`credits` is defined. So it never shows at home, never in Paramètres, and never in a module without
credits, whatever the product passes. `module` stays the single owner of "the user is in a module"
(ADR-0024). The chip reads it rather than asking the product to say it twice. A module without credits
still says so by leaving `credits` out (ADR-0049).

### A third value, not a second prop

`credits: null` means a balance exists and has not arrived yet.

The product offered two shapes: `null`, or a `creditsPending` boolean. We chose `null`. Leaving
`credits` out already means "no chip", and a boolean beside the number could contradict it:
`250` together with `pending` would say two things at once. A single prop cannot disagree with
itself.

While the balance is pending, the chip:

- **enters with the mark**, like any other chip;
- **holds the number's place** with a three-digit `Skeleton` (`3ch`, sized at the count's font). It is
  `strong`, because the count is the chip's heaviest text — and the default grey on the chip's white
  all but vanished (ADR-0039);
- **wears no tone**, because it does not judge a balance it does not know;
- carries `aria-busy`.

It never shows `0` for want of data.

### The chip moves with the mark

**It enters and leaves through the identity's own transition**, `ds-hnav-identity`, rather than a
copy of it. So it uses:

- the same window height: 48px, `--hnav-mark`, now declared on the bar's root so both windows can
  read it;
- the same duration (`enter`) and curve (`easing-in-out`);
- the same delay. From Paramètres it waits one `enter` with the mark; the `--opening` class now sits
  on the root, so both read it.

Filmed at a tenth of the speed, the chip and the mark stay **0.00px apart** over the whole travel.
That holds going in, going out, from home and from Paramètres.

**Its place travels too.** The chip's column animates `0fr → 1fr` on the same duration and curve
(ADR-0025). The 16px gap to the controls lives inside the clip, so it opens and closes with the
place. The identity's track steps instead (ADR-0049); this one cannot, because the controls beside
it are always on screen.

The bar is `space-between`, so the controls are pinned to its right edge. The place therefore opens
leftward into free space, and nothing visible moves. Measured, « Apprendre » stays at 1126.75px in
every frame of every scenario. The product's report that the controls jump did not reproduce in the
package's own layout. A crowded bar, where the controls are pushed, is where the travel would show.

**Two defects were found by filming:**

- **The chip slid sideways.** Mid-transition, a fractional `fr` column takes that fraction of the free
  space, so the column is narrower than the track that holds it (measured 52.8px of 93.6px). The chip
  slid 41px sideways while it rose. The column now sits at the track's end (`justify-content: end`),
  and the chip rises in the spot where it stays.
- **The chip risked being cut sideways.** While its place is narrower than the chip, it must not be
  clipped horizontally. The window therefore clips one axis only: `overflow-y: clip`, which, unlike
  `hidden`, leaves the other axis visible.

### Between two modules, the balance rolls

`CreditsChip` owns its number, so it owns the roll. The old number leaves through the top, the new
one arrives from below, on `enter` and `easing-in-out` — the identity's own values. In module → module
the number and the mark therefore move in step (measured 0.0% apart). A balance update with no module
change rolls the same way, on its own.

**The count's window travels its width.** Both numbers share one cell, so the cell is as wide as the
wider of the two. At the end of the roll it would snap to the new one: 14.8px going from « 250 » to
« 12 ». Instead, the window:

1. is pinned to its current width as the old number starts to leave;
2. transitions to the new number's width while the two cross;
3. goes back to `auto` once only the new number is left.

So a width is written down only for the length of one roll, and a late web font can never find it
stale.

Three details were found or settled along the way:

- **Widths keep their fractions.** `offsetWidth` rounded, and the window stepped 0.42px when it was
  released (ADR-0052's finding, again).
- **The clip is a `clip-path`, not an `overflow`.** An inline box with `overflow: hidden` takes its
  baseline from its bottom edge, and the count would have dropped off the unit's line.
- **The tone fades.** Background, border and ink change over the roll's duration, on the default
  curve, because a register is a state, not a thing that travels.

### Reduced motion

Nothing travels. The chip, its place, the mark and the number all change at once. Measured: the
largest displacement in all four scenarios is 0.0px, and the place has its final width from the first
frame.

The leaving mark and the leaving number are hidden from the first frame. Vue swaps classes a frame
late, so for that frame two of each would stand in one window (ADR-0052). Measured, two marks are in
the DOM for two frames, and only the new one is visible.

The tone still fades, because a colour changing is not motion.

## Measured

Seven scenarios were filmed at a tenth of the speed:

1. home → Yield;
2. Yield → home;
3. Yield → Scan;
4. a balance update;
5. pending → arrived;
6. Yield → Paramètres;
7. Paramètres → Yield.

In every frame, the chip is 0.00px from the mark and the controls do not move. Nothing steps more than
1px, and there are no reversals in the chip, its place or the number's window.

## Still open

- When the reminder (the demo form) appears or disappears, the chip's width changes in one step. This
  is rare, and it was not part of the request.
- Figma's `HorizontalNavigation` has no pending chip and no motion.
