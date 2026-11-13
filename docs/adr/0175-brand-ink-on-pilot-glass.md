# ADR-0175 — Brand ink on pilot glass

**Status**: accepted (etolbi, 13 Nov. 2026). This closes ADR-0174's audit: measured in the app, 14 real contrast
failures in 0.145 became **1** in 0.146.

## Context

The remaining failure is brand text on **pilot** glass (72 %) over near-black imagery, in the ARR cockpit:
`MapTimeline`'s « Comparer » (a `Button link`) measured **4.08–4.30:1**, on a measured ground of about
rgb(184, 189, 198). ADR-0174's `brightness(1.12)` could not reach it, as that ADR expected.

## Decision

**On pilot glass, brand text is `brand-700`.**
- Each pilot surface sets `--on-glass-brand: var(--ds-text-brand-hover)`: `brand-700` in light, `brand-100` in dark,
  where `text-brand` is already a light step.
- `Button link` and `Button tertiary` read it in place of `--ds-text-brand`.
- On the measured ground, `brand-700` is **5.45:1**; `brand-600` computes 4.08:1 there.
- The rest colour now equals the hover colour on pilot glass. A link still says it is hovered by its underline, a
  tertiary button by its tint.

**Reading glass is unchanged.** At 90 % it passes everywhere.

**Minor.** An `OptionCard` lit from the map (`--highlighted`, and the hover it mirrors) drew an opaque `gray-300`
contour. On glass it is ink at 16 % (`--on-glass-field-border`, ADR-0174's field edge).

## Measured (Storybook, computed)

| What | Value |
|---|---|
| « Comparer » in `MapTimeline` | `rgb(4, 75, 40)`, brand-700 |
| A `Button secondary-gray` in a reading panel | unchanged |
| A highlighted `OptionCard` in a panel | border ink 0.16 |
