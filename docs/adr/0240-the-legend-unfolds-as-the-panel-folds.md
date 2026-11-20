# ADR-0240 — The legend unfolds as the panel folds

**Status**: accepted (the product's feedback of 20 Nov. 2026 on `MapLegend`). Amends ADR-0138 (the fold's motion and
mechanism).

## Context

Unfolding and folding « Symboles » lacked the smoothness of the panel on the left (`MapPanel` folding) and of the modes
switch (`MapTopBar`). The product measured it in etolbi.

**Mismatched curves and durations.**

- Opening was `grid-template-rows` over `enter` (200ms) on `easing-out`.
- Closing waited 50ms, then ran over `exit` (100ms) on `easing-in`. It snapped: the shape left once the content had
  already gone, and finished as fast as it could.
- The panel morphs over `considered` (400ms) on `in-out`, and the switch slides over `enter` on `in-out`. The legend was
  the only one on `out` / `in`, and the only asymmetric one.

**The box before its content.** On opening, `easing-out` covered nearly all the height in the first quarter, empty; the
symbols only arrived afterwards. One saw a white box jump, then the content.

**The mechanism cost frames.** The grid's height was animated through layout, every frame, under a blurred surface
(`backdrop-map-control`). At opening, 9 frames out of ~50 went past 20ms, and closing played in 2 or 3 frames.

**The chevron swapped its glyph** (down ↔ up) in one go, without turning.

With injected CSS and frame-by-frame captures, the product tried the switch's and the panel's grammar: the shape over
`process` on `in-out` in both directions, the content following it in, and leaving first, with no wait. It was clearly
smoother, but the mechanism's jolts remained; they need another way of animating, which only the package can carry.

## Decision

**One grammar, the panel's**: `easing-in-out`, symmetric, over **`process`** (300ms). That suits a travel of ~50–80px;
`considered` is for the panel, which travels much further.

- **Opening**: the shape travels, and the content follows — opacity over `enter` on `easing-out`, after `quick` (the
  panel's `--morph-reveal`).
- **Closing**: the content leaves first (`exit`, `easing-in`), and the shape leaves at the same moment, with no wait.

**The mechanism: a shell whose foot travels.** The legend takes its open height at once and its layout does not move
again. What travels is a layer:

- **The shell** (`.ds-map-legend__shell`) is an absolute layer under the content. It carries the glass (pilot glass and
  its backdrop), the edge, the rim of light and the shadow, all moved off the root. Its `bottom` is animated with Web
  Animations, so its corners and its shadow stay true every frame. A `clip-path` on the surface would have cut the
  shadow, and a `scaleY` would have squashed the corners.
- **The fold's content** is cut at the same line (`clip-path: inset(0 0 X 0)`, same keyframes and timing), so nothing
  shows below the shell's foot.
- The fold is laid out only while shown (`display: none` folded). There is no `0fr → 1fr` under a backdrop filter any
  more.
- Line and fold are positioned, so they paint above the shell in order, with no stacking context that would cut the
  backdrop.

**The chevron turns.** A disclosure chip (`DropdownTrigger popup: false`, ADR-0237) keeps `chevron-down` and turns it
180° over the fold's `process` on `in-out`, instead of swapping glyphs. A chip that opens a popup still swaps.

**Reduced motion**: no travel. The content fades over `quick`, linear, in and out. Web Animations are outside
`motion.css`'s reach, so the component asks for itself (ADR-0068).

## Measured

On « Symboles, sans nombres », at 900px, sampled every animation frame:

| | Shell | Content | Chevron | Long frames |
|---|---|---|---|---|
| Open | 48 → 97px over 300ms, in-out, cut 49 → 0 in step | 0 from 100ms, 1 at ~300ms | 0 → 180° in step | **0 of 64** |
| Close | 97 → 48px over 300ms, from the click, no wait | 1 → 0 over the first 100ms | 180 → 0 | **1 of 60** (the click's frame) |

The legend's layout height is 97 open and 48 folded, with no frame in between. A quarter-speed film shows the shape
and the content on one curve, and no white box arriving before its symbols.

Plays: every `MapLegend` story passes. The stories' « unfolded » check now reads the fold's `display`.

## Consequences

In etolbi there is nothing to change. A product that styled `.ds-map-legend`'s background or border from outside
should style `.ds-map-legend__shell` instead; none does.
