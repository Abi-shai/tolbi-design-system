# ADR-0100 — What a map is read with: a scale, a click, a period, a navigator, a card that computes

**Date:** 2026-11-05
**Extends:** ADR-0096 (the sequential ramp, `ChartLegend`'s shapes), ADR-0087/0099 (`MapPanel`), ADR-0084
(`ButtonGroup`'s rail), ADR-0038/0055 (`ProjectCard`), ADR-0006 (chrome, not an engine)
**Source:** ARR · Dynamic baseline, lots 6–8; board « ↪ ARR — les pièces restantes » (`3664:11954`). The owner
dropped lot 5 (the resource row: the panel will change, no effort in what will go), took the recommended tracks
for 6 and 8, and for 7 kept **his** drawing — the periods side by side, the navigator as drawn — adding the
two ends of the period row.
**Status:** Accepted

## Decisions

**`ColorScale`** (track A). The title above, a **continuous** gradient — the index is continuous, steps would
invent thresholds — three values under it, the symbols' key below (`ChartLegend`, ADR-0096's shapes). The ramp is
`--ds-chart-sequential-*` unless given. A gradient is not text: the bar is `role="img"` named once (« Indice de
stock, de 0,30 à 0,60 »), the ticks `aria-hidden`.

**No second tooltip: `ChartTooltip` opens by a click too** (`dismissible`). The owner's rule — two surfaces that
look alike and behave differently are what a design system exists to prevent. Clicked, it holds a `CloseButton xs`,
so it is no longer a tooltip (which holds nothing) but a **non-modal dialog** named by its title (`label-md-strong`,
the strong ink — it is what the surface is called, not the date a figure is read at). The focus goes **in** on
mount and **back** to what held it on close, only if it was still inside (ADR-0062: a focus is not held
hostage); Escape closes it. The engine places it (ADR-0006) — a point on a canvas is not an element
`useAnchoredSurface` can anchor to. Swatches gained `border-inset`: the ramp's first step is pale on white.
Measured: open by keyboard → focus on the surface, Tab → close, Escape → focus back on the opener.

**`PeriodPicker`** (track A, `Navigation/`). Periods side by side, three parts and only the middle one always
there: **the granularity** at the start (`InputDropdown sm`, année / mois / jour — the product answers with other
`periods`), **the periods** (`ButtonGroup sm` between ‹ and ›), **`#actions`** at the end (« Comparer » — the
product's; the picker does not know what comparing means). The periods are the real `ButtonGroup` (ADR-0001), so
the chosen one is **its raised pill on the rail**, not the drawing's green fill: ADR-0084 settled a choice among
siblings, and brand fill is a list's current item at best (ADR-0050). `ButtonGroup` gains **`size="sm"`** — 28px
segments, a 38px rail: the height of the `sm` dropdown and the `sm` button beside it (measured 38/38/38). ‹ › step
to the previous/next period (not the window): the window **follows the choice** and only moves when it reaches an
edge, so the pill stays put while the labels change under it. It opens with the choice at the right edge (the
latest periods are read). **One tab stop**: ←/→, Home, End move the choice (roving `tabindex`). Measured: 7× ←
from 2026 → 2019 with the window 2019–2025; Home → 2017, ‹ disabled; switching to months shows the last seven.

**`MapNavigator`** (the owner's drawing). The mini-map (`#default`, the engine's) and under it − + « Recentrer »,
together; it folds into a bar of four, the mini-map's own button in the fourth place; no zoom slider (decided
4 Nov.). **The three never move**: the box is four 32px buttons wide (140px) and the mini-map is that wide, 4:3 —
so the fold is **one height that travels** (ADR-0025's `0fr → 1fr`, `enter` in / `exit` out, `in-out`), and a
pointer pressing − twice finds it where it was. The mini-map's button sits on the mini-map's corner open and in
the row's fourth place folded — **the one departure from the drawing**, which put it first in the bar: there it
pushed the three along by 36px on every fold. The focus goes to the button replacing the one pressed. Filmed at
×10: width constant (166px), the three buttons' x never changed, zero reversals in height.

**`ProjectCard` `state="computing"`** (track A). The same card at the same height; the pill « En calcul »,
neutral, **with a clock** (ADR-0006: a tone never speaks alone); what is known stays, what is computing is said
**in words** — a metric `value: null` reads `pendingLabel` (« en calcul ») in the figure's line box — never a dash
(« nothing ») nor a skeleton (« seconds », where this takes minutes). Nothing to open: the title is plain text, no
menu, no lift (`--static`). **`#insight`** replaces the spread with what a module measures — ARR's « Indice de
stock » and its curve (ADR-0038: the shell is shared, the insight is not).

**`Sparkline`**. A trend where a chart would be too much: no axis, no grid, no point. `comparison` is a second
series **on the same scale**, dashed in `--ds-chart-threshold` (ADR-0096's reference line); the line is
`chart-categorical-1` (never brand, ADR-0016). It is a picture: `role="img"` with `label`, the sentence a reader
hears. Not an engine (ADR-0006): no tooltip, no interaction.

## Still open

- The navigator's mini-map button changed place from the drawing; the Figma component must follow.
- `ColorScale`'s middle tick is centred by `space-between`, exact only while the ticks are the same width
  (tabular figures make three values so).
