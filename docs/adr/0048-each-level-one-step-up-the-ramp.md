# ADR-0048 — Each level one step up the ramp

**Date:** 2026-09-30
**Reverses:** ADR-0031's pair — *"`ModuleBanner` is the band — `bg-neutral-subtle`, square corners,
6px padding and gap — and `ModuleCapsule` is what sits in it at `bg-default`. That pair is the only
edge a capsule has."*
**Extends:** ADR-0029 (a layer rises in dark), ADR-0046 (`SideNavGroup`'s ink on a raised ground),
ADR-0047 (the page's column carries the margins)
**Source:** Sprint 18, `1982:59871` (`ModuleCapsule/Unité3`, page *Marque*) — the band and its
capsules redrawn
**Status:** Accepted
**Breaking:** visually. The band, the capsule and the tile change colour, and the band gains corners
and an 8px inset. No prop changes.

## Context

ADR-0031 drew the capsules **recessed**: an 800 tray (`bg-neutral-subtle`), the capsules sunk into it
at 900 (`bg-default`), and each tile back at 800. Figma redrew the band: it is `bg-default` with an
8px inset and 8px corners, each capsule carries `bg-neutral-subtle` at radius 12, and each module tile
`bg-neutral`.

## Decisions

### One step per level

Band → capsule → tile is `bg-default` → `bg-neutral-subtle` → `bg-neutral`, one step of the neutral
ramp per level of nesting. In dark a layer rises (ADR-0029), so every surface sits **above** the one
that holds it — 900 → 800 → 700; in light each level recesses by the same step, white → 50 → 100.

The rule it replaces had a flaw the new one cannot have: the tile repeated the band's 800, so it read
as a hole punched through the capsule to the tray rather than as a surface on the capsule. Now no
level repeats its container's container.

| | light | dark |
|---|---|---|
| capsule on band | 1.045:1 | 1.233:1 |
| tile on capsule | 1.054:1 | 1.333:1 |
| band on the page's `bg-neutral` | 1.102:1 | 1.644:1 |

### A capsule has an edge of its own

Under ADR-0031 a capsule outside its band was `bg-default` on `bg-default` and could not be seen, so
the band was the only edge it had. It carries its own ground now and reads on the page as well. The
capsule stories' decorator stops faking the band's grey and *is* the band: `bg-default`, an 8px inset,
`radius-control`.

### The band is a surface in the column

ADR-0031 kept square corners because the band ran full-bleed across the page. Since ADR-0047 the
page's column carries the margins and the band sits inside it, beside the bar, so it is a surface in
that column: `radius-control`, and `spacing-md` for both its inset and the gap between capsules. The
marquee's two runs keep the same gap — the loop wraps by subtracting half the track, so a seam off the
rhythm would show as a jump.

### The receding ink is `text-subtle`

`text-subtlest` is solved against `bg-default`. On the capsule's `bg-neutral-subtle` it measures
4.76:1 in light and **4.18:1 in dark** — under AA for the capsule's 14px copy (the module's name, the
attribute, the unit, both comparisons, the context line, the freshness), and in the mode the band is
drawn in. `text-subtle` is 7.36 and 6.01. It is `SideNavGroup`'s call (ADR-0046), on the same kind of
ground and for the same reason. The frame keeps `text-subtlest`; the Figma components on the *Marque*
page follow the code.

The tones hold on the new ground: `text-on-success-subtle` 4.89:1, `-error-` 4.84, `-warning-` 5.75 in
dark.

### The capsule's radius is a role

Figma binds the capsule's corners to `radius/xl`, a primitive. The code takes `radius-surface` — 12,
the tile's own — because a raw step is drift (ADR-0013).

## Measured

Storybook, `Données/ModuleBanner` → *Default*, dark: the band `#18201C`, 8px inset and gap, radius 8,
**106px** tall (the frame's 106); the first capsule `#26312B`, radius 12, at (8, 8), 1198 × 90, 8px to
the next; its tile `#36453D`, radius 12; the receding ink `#A0B1A8`.

## Still open

- **In light the capsule's edge is faint** — 1.045:1 on its band. The product draws the band dark; a
  light band would want that edge from somewhere other than the fill.
