# ADR-0147 — A thumb you can see

**Status:** accepted — 10 Nov. 2026 (etolbi, after 0.122.0)

## Context

ADR-0146 put `MapPanel lg` and `Dialog` in `Scrollbar`, whose thumb was `--ds-bg-neutral-strong` (gray-light/300):
**1.47:1** on `bg-default`, **1.41:1** on a block (`bg-neutral-subtle`) — the value of a border, and it read as one.
WCAG 1.4.11 (non-text contrast, 3:1) exempts the browser's own bar but not one the product draws. The product's old
bar (#767676) measured 4.54:1. And `bg-neutral-strong` is also the slider's channel, so it could not simply be
darkened.

## Decision

The thumb gets **its own role**, admitted under ADR-0009's *contract* clause because it carries a measured promise:

| token | light | dark |
|---|---|---|
| `--ds-bg-scrollbar` | gray-light/500 — **4.97:1** on `bg-default`, **4.76:1** on a block | gray-forest/400 — **5.15:1**, **4.18:1** |
| `--ds-bg-scrollbar-hover` | gray-light/600 — 7.69 / 7.36 | gray-forest/300 — 7.41 / 6.01 |

Dark takes the step that clears 3:1 on both grounds at about the same distance as light's (500 → 400; 500 in dark
would be 2.55:1 on a block), and its hover goes **lighter** — further from the ground is the rule, not darker.

`-hover` covers the thumb **pointed at or held**: `:hover`, `:active`, and a `--held` class while dragging, because a
captured pointer that leaves the thumb mid-drag drops `:hover`. `bg-neutral-strong`'s description loses « scrollbar
thumb » — it is the slider's channel only. Nothing else changes: the thumb still appears on scrolling, on itself and
while dragged, and leaves a second after the last movement (ADR-0146).

## Measured

`scripts/contrast.test.mjs` asserts the thumb at rest ≥ 3:1 on `bg-default` and `bg-neutral-subtle`, and the hover
step beyond it, in both modes — mutation-checked (pointed back at gray-light/300, it fails at 1.47:1). Rendered:
light rest `rgb(102, 112, 133)`, pointed and held `rgb(71, 84, 103)`; dark `rgb(127, 148, 138)` and
`rgb(160, 177, 168)`.
