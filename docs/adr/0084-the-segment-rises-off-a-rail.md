# ADR-0084 — The chosen segment rises off a rail

**Date:** 2026-10-27
**Amends:** ADR-0024 (`ButtonGroup`'s indicator), ADR-0077 (first round: the indicator painted, contrast still open)
**Source:** etolbi, EUDR item 18 — « ButtonGroup : le segment choisi ne se voit pas ». Figma « ↪ EUDR — ButtonGroup ·
contraste du segment » (`3211:1427`), track A, validated « on va aller avec tes recommandations » on 27 Oct.
**Status:** Accepted

## Context

0.61 made the indicator visible at all — but it was `bg-neutral-subtle` on `bg-default`, 1.045:1, and hover was
`bg-hover`, the same primitive: chosen and hovered were one grey. Every neutral tint on white stays under 1.2:1
(ADR-0044: a `bg-*` is solved against `bg-default`), so no tint could fix it. The board drew three mechanisms
instead of three intensities: A, Tabs' pill on a recessed rail; B, a pressed segment (no inset-shadow token exists);
C, the current item's brand mark (which `bg-selected`'s own description excludes for a segmented control).

## Decision

**Track A.** The group is a rail — `bg-neutral-subtle`, a `border-subtle` hairline, `radius-surface-sm`, 4px of
padding and gap — and the chosen segment is a `bg-default` pill with `elevation-surface` that slides between
segments (ADR-0024's indicator, unchanged in mechanism). The rail is **42px**, the height of a bordered control
beside it in a toolbar, so the segments are 32px. The ink says the choice too: chosen `text-strong`, the others
`text-subtle`. Hover is half a surface and `text-default` — Tabs' own, lighter than the pill. In dark the pill
(gray-forest/900) sits lower than the rail (800) and the ink carries the rest, as Tabs does.

The segments lost their separators and their bordered bar: a rail with a pill has no need of either.

Verified in the browser, light and dark: the rail 42px, the pill on the chosen segment to the half pixel and
following a click, hover lighter than the pill.
