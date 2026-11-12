# ADR-0160 — A height tied to the size

**Status**: accepted (etolbi, 12 Nov. 2026). Centred `Dialog` only.

## Context

Measured by the product on a 1 440 × 900 screen with the same content at each size: only the width changed from one
size to the next.

- The height followed the content with no ceiling but the screen.
- `2xl` took the whole height even when nearly empty (1312 × 820).
- A window whose content changes from step to step (a flow) jumped from one shape to another.

The product's benchmark:

| System | Height |
|---|---|
| IBM Carbon | the maximum follows the size: 72 / 84 / 96 % of the screen, « to keep a good window ratio » |
| Atlassian | the content's height, or an optional fixed `height`; the body scrolls between a fixed head and foot |
| MUI | the content up to the screen less 64px, then the body scrolls |

## Decision

**A ceiling per size, as the width has one** (centred placement):

| Size | Height |
|---|---|
| `sm`, `md` | the content, up to the screen — unchanged |
| `lg` | at most **80 %** of the screen: 720 × 720 at 1 440 × 900, a square |
| `xl` | at most **88 %**: 960 × 792 |
| `2xl` | the whole height, unchanged (ADR-0125) |

The share grows with the width so the proportions hold, Carbon's rule on our scale. Past the ceiling, the body
scrolls between the head and the foot, as before.

The share is of the screen, or of the region a `within` dialog covers: it is computed on the dialog's own box with its
16px inset counted back in. It never exceeds what the box holds (`min(100%, …)`).

**`height="fixed"`** — the product's proposed name, kept. It is a `DialogHeight = 'auto' | 'fixed'` prop, `auto` by
default. On `lg` and `xl`, the window takes its ceiling even with little content:

- the body takes all that the head and the foot leave;
- the slot becomes a column filling it, so a child with `flex: 1` (a map, a table) takes the window's height;
- a column stacks its children, so running text goes in its own `<p>`.

It is for a flow whose steps must not change shape, and for a map or a table in the body. On `sm`/`md` it is ignored,
since they follow their content, and on `2xl`, which is already full.

**A small screen keeps what it had.** Under 40rem of the dialog's width — a container query, not a breakpoint
(ADR-0079) — `lg` and `xl` take at most the screen's height and follow their content, `fixed` included. A share of a
phone is a cramped window. The side panel is untouched.

## Measured

`Superposition/Dialog` « Hauteurs », surface width × height:

| Case | 1 440 × 900 | 1 440 × 768 | 390 × 844 |
|---|---|---|---|
| `lg` long | 720 × 720 (80 %), body scrolls | 720 × 614 (80 %) | 358 × 812, the screen less the inset |
| `xl` long | 960 × 792 (88 %) | 960 × 676 (88 %) | 358 × 812 |
| `lg` short | 241 high, the content | | 241 high |
| `lg` fixed | 720 high | 614 high | 241 high, content kept |
| `xl` fixed with a map | 792 high; the `flex: 1` map takes 598 of the body's 648 | | 385 high, content kept |
