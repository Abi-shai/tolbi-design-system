# ADR-0225 — A key cut down to its control

**Status**: accepted (the product's brief, 18 Nov. 2026, point 2; filmed at ×10, ×4 and ×1 and validated by the owner).
Lot 2 of ADR-0224, its first half.

## Context

ADR-0224 let a `lg` panel fold from the **end** of its title's line. The fold there is a `x`, and the control the panel
becomes carries another glyph (`sliders-horizontal` for a legend). Two consequences:

- **No button to carry.** ADR-0182/0189's shell — the glass travelling between the panel's box and the capsule's, the
  head's button riding along — had nothing to carry: the `x` is not the control.
- **The product's motion was local.** It wanted the legend « plus immersive »: the panel born from the folded control's
  disc and closing back into it. It had coded this in `legend-panel.vue`, outside the package.
- **The local panel could not be removed.** Unmounted, `MapPanel` clones its surface and plays its own leave (ADR-0168),
  so a product that animates the appearance its own way must keep the panel mounted. The fold built into the package
  settles that.

## Decision

### The panel itself is cut

A panel that folds from the end is **cut** with a `clip-path: inset(… round …)`, on Web Animations.

- **The shape**: the cut starts as the capsule's disc at the panel's corner (52, round), which is the end's corner on an
  `end` place. It opens to the whole panel.
- **No stand-in**: the panel's own glass is what shows, with no shell standing in for it.

### Unfolding: considered

- **The cut** opens over `considered` (400ms), on `easing-default`.
- **The content** (each child of the panel) rises one step (`spacing-md`, 8px) and fades in over `enter`, on
  `easing-out`. It starts at **40 % of the opening**, the brief's 160ms.

### Folding: quicker, the content first

1. The content fades over `exit`, on `easing-in`.
2. The cut closes on the corner over `process` (300ms), on `easing-in`.
3. The capsule takes the panel's place, in its pilot glass from its first frame.
4. Its button appears over `quick`.

The exit stays faster than the entrance (ADR-0021).

### The shadow comes with the cut

A cut that ends on the panel's edge clips the glass's shadow, which then pops in when the cut is removed. So the open cut
ends **past** the edge: by `spacing-4xl`, with its corners concentric (`radius-map-surface` plus the same reach). The
shadow is uncovered with the panel.

### Reduced motion

A fade in place over `quick`, through the existing `crossFade`. Web Animations are not cut by `motion.css`, so the
component asks itself.

### What does not change

- **The start fold keeps ADR-0182/0189's shell.** There the head's button *is* the control and travels with the stretch.
  The new motion applies to the end placement only; the owner validated it there.
- **The focus follows a press**, as before: to « Afficher … » when folded, to « Replier … » when unfolded.

**One state**: the capsule is no longer drawn bare while the cut settles. A new `arriving` state keeps its glass while its
button fades in, where the shell's own swap wanted it bare.

## Measured

Filmed at a tenth of the speed (the duration tokens slowed; Storybook, « Légende compacte »), every animation frame.

**Folding**:

| Time (×10) | What happens |
|---|---|
| 0 → 1 000ms | the head's opacity 1 → 0; no cut |
| 1 000 → 4 000ms | the cut runs from `inset(-32px round 56px)` to the corner's disc: `inset(0 234 230 0 round 26)` |
| 4 000 → 5 000ms | the capsule is there, `bg-map-control` from its first frame, its button 0 → 1 |

**Unfolding**:

| Time (×10) | What happens |
|---|---|
| 0 → 4 000ms | the cut runs from the disc to `inset(-32px round 56px)` |
| from 1 600ms (40 %) | the content rises from `translateY(8px)` and fades 0 → 1, settling at 3 600ms |
| 4 000ms | the clip is removed |

Also recorded as video at ×4 and ×1. The story's play guards the fold, the unfold, the focus on each press, and that no
`clip-path` is left on the panel.

## Still open

The legend component (ADR-0224's point 5).
