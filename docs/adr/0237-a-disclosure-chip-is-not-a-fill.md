# ADR-0237 — A disclosure chip is not a fill

**Status**: accepted (the product's feedback of 20 Nov. 2026 on `MapLegend`). Amends ADR-0138 (the « Symboles » chip)
and ADR-0100 (the `chip` chrome).

## Context

The legend's « Symboles » chip is a `DropdownTrigger` with the `chip` chrome: `bg-neutral` at rest, and
`bg-neutral-strong` under the pointer and while open. On the legend's glass, open, it was the heaviest thing in the
block, though it only unfolds the key. The owner: « le gris est trop présent, il prend trop de puissance visuelle ».

The package already says what an open trigger is elsewhere:

- `IconButton`: hover, active and open (`aria-expanded`) take `--on-glass-hover`;
- `DropdownTrigger ghost`: hover and open take `--on-glass-hover`.

Only the chip escaped, with a fill that knows neither the glass nor the dark theme. `--on-glass-hover` (7 % of
`text-strong`) falls back on `bg-hover` off the glass and follows the theme.

The product tried four forms in etolbi, with injected CSS and captures:

- the same grey open and closed;
- the open chip as a raised tile (`--on-glass-raised`): the wrong meaning, opening is not choosing;
- the switch's hollow (`--on-glass-sunk`): the wrong meaning, a chip is not a container;
- **ghost: retained.**

## Decision

**A chip that unfolds in place takes `ghost`'s ground.** It is decided by the trigger, from what it already knows:
`popup: false` marks a disclosure (ADR-0138). It is not a new prop, and not a restyling from `MapLegend`, so the chrome
keeps one owner (ADR-0033).

- At rest: no ground.
- Under the pointer and while open: `--on-glass-hover`, else `bg-hover`.
- The marks, the word and the chevron are unchanged: same type (`label-md-strong`), same 24px, same padding.

**A chip that opens a popup keeps its ground**: the timeline's scale, the legend's indicator, the calendar's title. A
setting of an instrument is a tinted pill, and a disclosure is not. The rule is the one the product gave: an open
state is an interaction state, not a fill.

This reaches the legend's « Symboles » and its by-category « +N », both disclosures.

## Measured

On the « Symboles » stories, at 900px:

| State | Ground |
|---|---|
| Closed | `transparent` |
| Hover | `text-strong` at 7 % |
| Open | `text-strong` at 7 % |

The chip stays 156 × 24 in every state.

Plays: every `MapLegend`, `DropdownTrigger`, `MapTimeline` and `DatePicker` story passes.

## Consequences

In etolbi there is nothing to change: the SIG's legends (Carbone, ARR, zones) follow the package.
