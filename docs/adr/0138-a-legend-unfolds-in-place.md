# ADR-0138 — A legend unfolds in place

**Date:** 2026-11-09
**Amends:** ADR-0137 (« Symboles » and « +N » were panels)
**Source:** product, 9 Nov. — Figma `3922:1671`, section 5 (unfold in place) and 5 bis (track R1, retained).
**Status:** Accepted

## Context

In 0.116.1 « Symboles » and « +N » opened a `Dropdown role="dialog"`. A menu is a dead end for a legend: it is opened
to read while looking at the map, and it closed at the first click on the map.

## Decisions

- **The legend grows downward in place.** Same surface as the line (ground, border, shadow); the line does not move a
  pixel (measured: its top constant through every frame of both gestures). Under it a `border-subtle` rule inset 16,
  then the block: 12 above, 16 below and at the sides, in the legend's own width — `contain: inline-size`, so a key by
  category is as wide as its line, folded or not. Folded, the line alone.
- **The radius is the line's — half its height (24)** — not a pill's: on a 141px surface a pill rounds the whole side.
- **Track R1**: `ChartLegend orientation="columns"` (new) — four equal columns to a row, centred, wrapping; in each, the
  mark at its own size centred in a 16px box, the figure (`value`, `label-xl-strong`), the name (`label-md`,
  `text-subtle`). The marks stay `ChartLegend`'s (ADR-0001). `ChartLegendItem.value` already existed; absent, the column
  is mark and name. Measured: four symbols, 112px columns, 480 × 141 unfolded (the board's 145 has a 42px line); without
  figures 113. « +N » unfolds the remaining categories the same way.
- **A disclosure, not a popup**: the chip is `DropdownTrigger` with **`popup: false`** (new) — `aria-expanded`, no
  `aria-haspopup` — and `aria-controls` the block, a `role="region"` named by `symbolsLabel` / `moreLabel`. Click, Enter,
  Space toggle; **Escape folds and the focus stays on the chip**; **a click on the map does not fold** — that is the
  point. The chip shows its open chrome and its chevron turns up while unfolded.
- **`v-model:expanded`**: bound, the product keeps it for the session (across years and points); unbound, the state is
  the legend's own.
- **The indicators' menu stays a menu** — choosing is not reading — and opening it leaves the block as it is.
- **Motion** (ADR-0025's `0fr → 1fr` on the element that transitions): unfold, the height over `enter` on `easing-out`,
  the content fading in over the second half (`quick` delayed `quick`); fold, faster and the other way round — the
  content first (`instant`), then the height over `exit`; the block leaves the accessibility tree once closed. Filmed:
  48 → 113 in 200ms, content 100 → 200ms; fold content gone at 50ms, height 48 at 150ms; no reversal. The chevron swaps
  rather than turns — it is the chip's, as on the timeline. **Reduced motion**: the package cuts transitions
  (`motion.css`), and the delays are removed too, or the block stood empty for 100ms.
- **Guarded**: « Symboles, déplié » and « +N, déplié » carry a `play` test — click → shown with `aria-expanded="true"`
  and `aria-controls` pointing at the region; a click on the map → still shown; Escape → folded, focus on the chip;
  Enter → shown again. « Déplié + menu des indicateurs » checks the block stays open with the menu.
