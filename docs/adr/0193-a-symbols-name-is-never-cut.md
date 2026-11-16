# ADR-0193 — A symbol's name is never cut

**Status**: accepted (the owner, 16 Nov. 2026 — the ARR cockpit). This amends ADR-0138.

## Context

ADR-0138 gave the `columns` layout's names one line, cut with an ellipsis. In the cockpit's unfolded legend (four equal
columns in a capped width), that turned « Point du projet » into « Point du pr… » and « Point de contrôle » into
« Point de co… ». A key whose names are cut no longer says what the symbols are.

## Decision

In `ChartLegend orientation="columns"`, the name **wraps**:
- `label-md`, centred, with no ellipsis;
- balanced over its lines (`text-wrap: balance`, so « Point du / projet », not « Point du projet » with an orphan);
- a word longer than its column breaks rather than run into the next column (`overflow-wrap: break-word`).

The columns are flex items of one row, so the row takes **the tallest column's height**, and the marks and figures
stay on their own lines.

## Measured (`Données/Map/Legend`, « Symboles, sans nombres »)

| Legend width | Point du projet | Point de contrôle | Réserve / Zone exclue | Column height |
|---|---|---|---|---|
| 560 | 1 line | 1 line | 1 line | 48 |
| 440 | 1 line | 2 lines | 1 line | 68 (all four) |
| 380 | 2 lines | 2 lines | 1 line | 68 (all four) |

No overflow at any width.
