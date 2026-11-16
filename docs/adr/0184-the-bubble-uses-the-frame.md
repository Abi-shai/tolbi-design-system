# ADR-0184 — The hover's bubble uses the frame, not the plot alone

**Status**: accepted (etolbi, 16 Nov. 2026). On Carbone's charts (bars « Carbone par année », line « Stock de
carbone »), the hover's bubble covered the bar or line it described instead of sitting beside it.

## Context

ADR-0180 kept the bubble inside the **plot**. In a narrow sheet, a bubble about 186px wide fits on neither side of a
plot about 250px wide, so the clamp pushed it back over the very column it describes. The room it lacked was about
the value axis's width, sitting just beside the plot.

## Decision

**The bubble's room is the whole frame (`ChartFrame`), the value axis included.**
- It may cover the axis while it reads; the bars and the line it describes stay visible.
- It still never leaves the frame.

**Its gap counts from the column's edge.**
- For bars (`band`), the gap is half a band plus 4px. A bar fills most of its band, and a gap counted from its centre
  left the bubble touching it by a pixel.
- For a line (`point`), the column is a hairline, so the gap stays 12px from the point.

**Placement order**
1. After the column, while it fits in the frame.
2. Before the column, while it fits.
3. When neither fits, the roomier side, clamped inside the frame.

The third case is the one that can still touch a bar. In a 352px frame, the second column's bar (27px) is overlapped
by **12px**: the bubble fits on neither side of it.

The bubble's x is measured against the frame's edges on every resize and at the start of each hover. The motion is
ADR-0180's: the bubble still glides from side to side.

## Measured (overlap of bubble and hovered bar, px)

| Story | Frame | Plot | Before (ADR-0180) | Now, columns 1–6 |
|---|---|---|---|---|
| `Données/ChartFrame` « Survol — dans une fiche étroite » | 352 | 250 | the bubble pushed over the column (the owner's capture) | **0 · 12 · 0 · 0 · 0 · 0**, bubble inside the frame every time |
| `Données/ChartFrame` « Survol — barres par année » | 448 | | | **0** for all six |
