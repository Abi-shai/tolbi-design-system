# ADR-0223 — The GIS bar off the map

**Status**: accepted (the owner's product brief, 18 Nov. 2026). The product had already set it in `app.vue`
(`.app-gis-bar--solid`) while waiting for the package.

## Context

On the Analytics view, the map has gone, but `MapTopBar` kept its glass and the shadow ADR-0220 gave it. A shadow cast
on a page of data reads wrong: there is nothing under the bar to lift it over.

## Decision

### A solid surface

`MapTopBar` gains `surface: 'glass' | 'solid'`.

**`solid`**:

- **The bar**: `bg-default`, nothing blurred, **no shadow**. ADR-0220's `border-inset` rule stays alone.
- **Its controls leave the glass too.** The bar resets the context it hands down: every `--on-glass-*` (`focus`,
  `hover`, `sunk`, `sunk-border`, `raised`, `raised-shadow`, `field-*`) goes to `initial`, and `--ds-text-subtlest`
  goes back to the role's own value (`inherit`). Each control then falls back on its value off the map:
  - the switch's rail: `bg-neutral-subtle` with `border-subtle`;
  - its pill: `bg-default` with `elevation-surface`;
  - the icons' hover and open state: `bg-hover`;
  - the basemap trigger's focus: the catalogue's ring.

  The product had measured the same with those variables reset to `initial`.

**`glass`** is unchanged: `bg-map-read` under `backdrop-map-read`, the rule and `shadow-md`, the controls on glass.

### Derived from `view`

Unset, the surface is **derived from `view`**: the first view is the map (« Carte | Analytics »), and any other view is
`solid`. The product does not have to bind it. `surface` set explicitly wins, for a bar whose first view is not the map.

### The passage

- **What fades**: the ground, the shadow and the blur, over `enter` (200ms) on `easing-out`.
- **What does not move**: the bar's height and its content.
- The shadow transitions at `enter`, not `instant`: it is the bar's elevation fading with its ground, not a focus ring
  (a named suppression of `focus-ring-instant`).
- **Reduced motion**: immediate (`motion.css`).

## Measured

At 1 440 (Storybook, Chromium, « Sur la carte »):

| | Carte (glass) | Analytics (solid) |
|---|---|---|
| Ground | white 90 %, `blur(20px) saturate(1.6)` | `rgb(255, 255, 255)`, no filter |
| Shadow | inset rule + `shadow-md` | the inset rule alone |
| Switch rail | ink 4 %, white 55 % edge | `rgb(249, 250, 251)`, `rgb(234, 236, 240)` |
| Switch pill | white 94 %, raised shadow | white, `elevation-surface` |

**The fade, filmed**: the ground's alpha goes 0.926 → 0.968 → 0.994 → 1 at 198ms. The bar stays at y 0, 56 high, in
every frame. Back on « Carte », the glass returns, identical.

## Consequences

The product removes `.app-gis-bar--solid` (the ground, the shadow and the `--on-glass-*` resets) and its transition from
`app.vue`. It passes nothing: the view decides.
