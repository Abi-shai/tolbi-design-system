# ADR-0146 — The bar shows when it moves

**Status:** accepted — 10 Nov. 2026 (etolbi)

## Context

Two things from the product. `MapPanel lg` and `Dialog` scrolled natively (`overflow-y: auto`), so the bar on screen
was the browser's — which the product was styling with a global `::-webkit-scrollbar` rule, a classic bar that takes
a bite out of the content box. And our own `Scrollbar` showed its thumb whenever the pointer was over the area
(`.ds-scrollbar:hover .ds-scrollbar__thumb`): in a panel the pointer is always there, so the thumb never left.

## Decision

**The two scrollers become `Scrollbar`.**

- `MapPanel lg` wraps its body in a `Scrollbar` with `shadows` — the 24px fades top and bottom — and the scroller
  takes what the head and foot leave (`flex: 1 1 auto; min-height: 0`). A small panel does not scroll and renders its
  body as it was (a pass-through functional component, so the slot is written once).
- `Dialog` wraps its body in a `Scrollbar` (`.ds-dialog__scroll`), which carries the rule and the flex sizing; the
  body's padding scrolls with what it holds. **Centred, it takes the scroller's fades; at the side it keeps the
  owner's 64px fade over the foot** (ADR-0079), now measured on the scroller's viewport — a second fade at the
  bottom would draw the same thing twice.

**The thumb shows when something moves — macOS's overlay bars:**

- while scrolling (wheel, trackpad, keyboard, a scroll-into-view);
- while the pointer is on the thumb itself, or the thumb is being dragged;
- and it fades **1 s after the last movement** (it was 700ms) — leaving the thumb restarts that second.
- **Pointing at the area shows nothing**: the edge fades already say there is more. The thumb stays a target while
  invisible, so pointing at where it is brings it back.
- Reduced motion: it appears and goes without a fade, and so do the edges.

The 1 s is a constant in the component, not a token: it is how long a thing is *left* on screen, not the length of
a movement (ADR-0032: a delay is not a duration).

## Measured

`Scrollbar` « Vertical »: the area under the pointer, opacity 0; scrolling, 1; 1.05 s after, still 1 — 1.5 s, 0;
the pointer on the thumb, 1 for as long as it stays; dragging with the pointer off the thumb, 1; released, 1 then 0
after the second. Reduced motion, no transition. `MapPanel lg` (reading panel): one scroller, no native one left,
the top fade off at the start and on once scrolled. `Dialog side`: one scroller, the foot's fade on while content is
left below and off at the end. Every story's `play` function passes.

## Consequences

- The product can drop its global `::-webkit-scrollbar` rule: nothing of ours scrolls natively any more in these two.
- A consumer that scrolled `.ds-dialog__body` or `.ds-map-panel__body` itself must now scroll the `Scrollbar`'s
  viewport (`.ds-scrollbar__viewport`) — the body is its content, not the scroller.
