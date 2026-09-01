# ADR-0016 — The watch items, and one claim that was wrong

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the remaining items from ADR-0010, ADR-0013, ADR-0014 and ADR-0015

## Context

Five items were left as things to watch rather than tasks. Worked through, two were real, one was a
decision that had been deferred for the wrong reason, one was **a claim of mine that was simply
false**, and two needed nothing.

## Decisions

### `CreditsChip` does not hand-roll an avatar, and ADR-0015 was wrong to say it did

ADR-0015 recorded an ADR-0001 violation: `CreditsChip` builds `__avatar-wrap`, `__avatar-img` and
`__avatar-border`, duplicating `Avatar`'s structure, and it was "blocked" because the mini avatar is
`17.331px` against `Avatar`'s 24px minimum.

The image is `credits-icon.png` — **a currency glyph, not a person or an entity.** `Avatar` carries
identity semantics (initials, status dots, company badge) that a coin has no use for, so ADR-0001
does not reach it: there is no design system component for this pattern. The whole claim rested on
the class names, which were misleading, and nothing else.

The classes are renamed `__coin`, `__coin-img`, `__coin-ring`. No `Avatar` size is added, and the
"blocked" item is withdrawn rather than solved.

`--ds-border-inset` still earns its place. The ring keeps a filled circular shape legible against any
background, which is true of an avatar and of a coin — the token was named for the job, not the
component, and that turns out to have been the right call for the wrong reason.

### The nav's dropdown was drift, not a bespoke shadow

`0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)` was carried as "matches no step on the
shadow ramp", which framed it as a legitimate exception. It sits on
`.ds-hnav__modules-dropdown` — **a dropdown panel**, the exact thing `--ds-elevation-overlay` names,
and what `Dropdown`, `Toast` and `ChartTooltip` all already use.

It is the same shape as `Tooltip` sitting on `radius-control` (ADR-0013): a component quietly
disagreeing with its own category. Now `var(--ds-elevation-overlay)`.

**The linter's colour-literal allowlist is now empty**, which is the more interesting result. Every
colour literal in the catalogue has a token.

### The chart palette was deferred for the wrong reason, and the right reason is a ceiling

ADR-0010 deferred a numbered categorical set "until something renders a data series". But the design
system ships chart chrome and no renderer (ADR-0006), so *nothing here will ever render one* — the
condition could not be met, and meanwhile the chart stories were modelling the anti-pattern, using
`brand-500` as a series colour after ADR-0009 had made brand interactive-only.

The palette is the design system's job precisely because the product picks the colours: it needs to
be handed a set, not left to choose. `chart.categorical.{1..7}` over the display hues at step 500.

The order is computed, not chosen. A greedy max-min pass on ΔE puts each next hue as far as possible
from every hue already in the ramp, so the first *N* series are always the most distinguishable
available:

| | hue | min ΔE to any earlier series |
|---|---|---|
| 1 | indigo | — |
| 2 | orange | 135.8 |
| 3 | blue-light | 59.1 |
| 4 | pink | 50.2 |
| 5 | blue-gray | **35.5** |
| 6 | blue | 24.3 |
| 7 | purple | 16.1 |

**Five is the comfortable ceiling.** Series 6 and 7 are shipped because a seven-category chart is
better served by a weak colour than by an invented one, but a chart needing more than five
categories should aggregate rather than reach further down the ramp. That guardrail is the thing
worth having, and it is why deferring on "no consumer" was the wrong test — the question was never
whether someone would use it, but how far it can be trusted.

`ChartFrame`, `ChartLegend` and `ChartTooltip` stories now use it. Zero raw primitives remain in
them.

### Two items needed nothing, and saying so is the answer

- **The lint suppression list is three components long.** That is a tripwire, not a task: if it
  grows, `no-literal-dimension-js` is mis-scoped. Three is the right size and there is no work here.
- **`BadgeGroup` has no non-interactive form.** Nothing needs one. Inventing a prop for a
  hypothetical consumer is the completeness trap ADR-0009 exists to prevent; it stays a
  known-and-accepted shape until something actually asks.

Recording that they were examined and deliberately left is worth more than either closing them
silently or leaving them to look like neglected work.

## What changes

- `chart.categorical.{1..7}` added, ordered by measured ΔE; three chart story files migrated.
- `HorizontalNavigation`'s dropdown shadow → `--ds-elevation-overlay`.
- The linter's colour-literal allowlist is **empty**.
- `CreditsChip`'s `__avatar-*` classes → `__coin*`; ADR-0015's ADR-0001 claim withdrawn.

## Still open

