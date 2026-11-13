# ADR-0163 — A list that says there is more

**Status**: accepted (the owner, 13 Nov. 2026)

## Context

The bar's module list (`ModulesList`, opened from the grid button of `HorizontalNavigation`) was 224px tall. That is
exactly two rows of three modules. With twelve modules, half of them were out of sight with nothing saying so:

- the panel stopped flush under the second row;
- the `Scrollbar` thumb only appeared once someone scrolled (ADR-0146).

The owner asked for two things:

- a size that shows two rows and a part of the third, so « there is more below » reads at a glance;
- the scrollbar visible as soon as the list opens.

## Decision

**Two rows and the drawings of a third.** The viewport is capped at the inner panel's top padding, two rows and
their gaps, plus a **peek**: the third row's padding and its whole drawing (8 + 48 = 56px), its label left below.
The modules are recognised, and a row without its words reads as one that continues. The panel is **288px**,
against 224 before.

**Amended the same day.** The first peek was 8 + 24 = 32px, half the drawing, and the fade covered most of it. The
owner found the third row too faint, so the peek became the whole drawing. The peek sits under
`Scrollbar`'s end fade (`shadows`), which hides once the list is scrolled to its end. With six modules or fewer, the
panel hugs its two rows (224px): there is nothing to peek at.

**The thumb stands from the first frame.** `Scrollbar` gains **`persistent`**: the thumb stays shown while there is
something to scroll. ADR-0146's rule — shown while moving, fading after a second — was written for reading panels,
where the pointer always rests and a standing bar is noise. A short list someone opens to *choose* from is the other
case: « it scrolls » must be said before anyone scrolls. The prop is opt-in; `MapPanel` and `Dialog` keep the
fading thumb.

**A gutter for the thumb.** A standing thumb floating over the third column cut the current module's ground by 4px.
The inner panel now keeps `spacing-lg` (12px) at its end: the thumb is 8px, inset 4. The panel is 270px wide, against
258.

**The cut follows the corners.** The viewport takes the inner panel's radius, so the third row is cut round, not
sliced flat.

## Measured

`Navigation/ModulesList`, and the bar's « Module » story opened from the grid button:

| Case | Panel (width × height) | Viewport (shown / total) | Third row visible | Thumb |
|---|---|---|---|---|
| Nine modules | 270 × 288 | 276 / 318 | 56px: the whole drawing, under the end fade | opacity 1 at 150ms and still at 1.6s, clear of the third column |
| Six modules | 270 × 224 | 212 / 212 | | none: nothing scrolls |
