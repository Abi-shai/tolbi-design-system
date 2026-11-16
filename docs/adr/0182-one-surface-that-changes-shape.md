# ADR-0182 — Folding a panel: one surface that changes shape

**Status**: accepted (the owner, 16 Nov. 2026). Captures: etolbi `.context/attachments/582yXO/image.png` (open),
`RmpEQ8/image.png` (folded).

## Context

Since 0.149.1 the fold button does not move, but the surface around it jumped. Two surfaces were swapped: the
capsule's edge stood 6px from the button and the panel's edge 16px from it, so unfolding threw the panel's corner
10px outwards. The jump showed less when folding.

## Decision

**One surface changes shape** instead of two being swapped.

**The shell.** A *shell* stands in the overlay, under the surfaces. It is the glass alone, with no content: border
(`border-map-edge`), rim and shadow (`elevation-map-glass`), `radius-surface`. It travels between the capsule's box
(52 × 52, measured from the button) and the panel's, over **`considered` + `easing-in-out`**:
- its four edges glide together, the top-left corner going from 6 to 16px from the button;
- its ground and backdrop cross from pilot glass to reading glass, interpolated, so the glass follows the surface
  without blinking. Where the two backdrops list different functions, the reading one is completed (`brightness(1)`)
  so they interpolate.

**While the shell moves, the real surfaces are bare.** The panel and the capsule lose ground, border, shadow and
backdrop, and **do not move**: their own entrance and exit (scale, a 24px travel) are held still.

**Unfolding**
1. The capsule gives way to the panel at once.
2. The panel's content (head, tabs, body, foot, the head's rule) is veiled; only the fold button stays drawn, on its
   pixel.
3. The shell grows.
4. At **three quarters** of the shape, the content fades in over `enter`.

**Folding**
1. The content fades out over **`exit`**.
2. The shell closes on the button.
3. The capsule takes its place, still for two frames while the swap's classes clear.

**The button never moves**, on any frame.

**Reduced motion.** Nothing stretches: the new form **fades in where it stands** over `quick`. This uses Web
Animations, which `motion.css` does not cut: a fade is not a movement.

**Out of scope.** The shell runs only when the fold is pressed and the panel sits at a start corner. A product
folding through `v-model:collapsed`, or a panel at the end, swaps as before.

**Defects found on the way**
- **Switching `<Transition>`'s `css` prop during a swap broke Vue's patch** (`parentNode` of null). The swap now
  takes `duration: 0` while morphing.
- **`opacity` on a `display: contents` element does nothing.** The head's `#header` box is one (ADR-0130), so its
  children are veiled one by one.

## Measured (`Données/Map` « Écran SIG », frames every 45ms)

| Gesture | Shell (x, y, w × h) | Content |
|---|---|---|
| Fold | 24,24 400 × 784 → 25,25 → 28,28 → 32,31 → … → 35,34 **52 × 52**, then the capsule | 1.00 → 0.76 → 0, before the shell moves |
| Unfold | 35,34 55 × 59 → 34,33 → 31,31 → 28,28 → … → **24,24 400 × 796** | 0, then 0.02 → 0.43 → 1.00 over the last quarter |

On every frame of both gestures the button stands at **(41, 40)**, and no frame of the shell reverses.

Under reduced motion, the button stays at (41, 40) and the new form's opacity runs 0 → 0.33 → 0.66 → 1.
