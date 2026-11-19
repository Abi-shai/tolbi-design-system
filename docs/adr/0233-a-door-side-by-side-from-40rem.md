# ADR-0233 — A door side by side from 40rem

**Status**: accepted (the product's feedback on `Door` 0.175.0, 19 Nov. 2026). Amends ADR-0231's threshold.

## Context

ADR-0231 laid `Door`'s two zones side by side from **48rem** of the door's own width. On the home page at 1 440px,
beside the « Actions rapides » column, the door measures **47.25rem**, so it stacked: the statement above, the tray
below.

## Decision

The threshold goes to **40rem**, still a container query on the door's own width.

**What fits at 40rem**: the statement keeps its width, at most 24rem (259px for the credits door), with 32 between the
two zones. That leaves the tray about 14rem: one column of `TrayCell`s. `TrayGrid`'s column floor is
`min(14rem, 100%)`, so it never overflows.

A `stackBelow` prop was offered and not taken. The threshold is the door's own layout decision, and one door already
showed that a fixed number was wrong — a prop would hand the next door the same guess.

## Measured

Storybook, Chromium, the credits door at three widths:

| Door width | Layout | Statement | Aside | Cells |
|---|---|---|---|---|
| 47.25rem (756px) | side by side | 259 | 433 | 415 wide, one column |
| 40rem (640px) | side by side | 259 | 317 | 299 wide |
| 39.9rem | stacked | | | |
