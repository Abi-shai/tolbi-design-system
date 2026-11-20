# ADR-0239 — A chosen year is a position, not an action

**Status**: accepted (the product's semantic review of `MapTimeline` with the owner, 20 Nov. 2026, track B). Amends
ADR-0100 (the brand's solid pill), ADR-0114 / 0115 (the data dot) and ADR-0118.

## Context

Four of the timeline's states used a token that does not say what they do:

- **The chosen year** was `bg-brand-solid` + `text-on-brand-solid`. The solid green is the action's (the primary
  button; in the charter, green is action). A chosen year is a current position, not an action, and it was the heaviest
  thing on the screen, competing with « Comparer » beside it, the real green action.
- **The data dots** were `bg-brand-solid`. They only say a measure exists — a status, not an action — and nearly every
  year has one.
- **Years at rest** were `text-strong`. Everywhere else an unchosen option is `text-subtle` (the modes switch, Tabs);
  here every year weighed as much as the chosen one.
- **Hover** was `bg-hover`, the off-glass hover, which hardly shows on the timeline's glass. Its arrows and chips
  already took `--on-glass-hover` (ADR-0237).

The package already says what « current » is: in a sequence or a list, the current item is a brand **tint** — the chosen
basemap's row (ADR-0230), the open file (ADR-0234/0235). A segment's chosen option is a raised tile, but that wants a
hollow track, and the timeline has none.

The product tried four tracks in etolbi with injected CSS and captures:

- the current state;
- **B**: a brand tint, with the rest lightened;
- **C**: a raised tile;
- **D**: only the chosen year changed.

**B was retained.** With C, on the 72 % glass, one could no longer see which year was shown. With D the timeline stayed
loaded.

## Decision (B)

- **The chosen year** — the sliding indicator, and the current or chosen year's text: `bg-brand-subtle` with
  `text-on-brand-subtle` (its exact partner, ADR-0009). The weight is unchanged (`label-lg-strong`).
- **Years at rest**: `text-subtle`, and `text-default` under the pointer.
- **Hover**: `--on-glass-hover`, which falls back on `bg-hover` off the glass.
- **Data dots**: solid `text-subtle`. The empty dot (no measure) keeps its ring: the shape says it, not the colour
  (ADR-0006).
- **Unchanged**: the scale chip (a setting, a grey pill), the arrows, « Comparer », the indicator's motion and the edge
  fades.

**Compare mode** (two years chosen) and **dense mode** follow the same rule: every current or chosen period is the
brand tint and the rest recede. The compared period's own pill — placed, not sliding — takes the tint too.

## Measured

At 1 000px, on « Années », « Comparer » and « Jours » (dense):

| What | Value |
|---|---|
| Indicator | `rgb(230, 240, 235)` (`bg-brand-subtle`) |
| Current year | `rgb(4, 75, 40)` (`text-on-brand-subtle`) |
| Year at rest | `rgb(71, 84, 103)` (`text-subtle`) |
| Compared year | the tint and its ink, as the current one |
| Data dot (dense) | `rgb(71, 84, 103)` |
| Hover | `text-strong` at 7 %, the year in `rgb(52, 64, 84)` (`text-default`) |

« Comparer » is now the only green that is filled with ink on the bar.

Plays: every `MapTimeline` story and the GIS screens around it pass.

## Consequences

In etolbi there is nothing to change: the SIG's timeline (Carbone, ARR, Dynamic baseline) follows the package.
