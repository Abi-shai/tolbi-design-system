# ADR-0134 — An empty block says one sentence

**Date:** 2026-11-08
**Source:** etolbi — in a reading panel (`MapPanel lg`), a sunk card titled « Données de terrain » or « Demandes de
l'auditeur » with nothing in it rendered `EmptyState size="sm"` as « Aucune collecte » in a strong label, centred, inside
32px of padding: a second heading under the block's own, and an absence heavier than the block.
**Status:** Accepted

## Decisions

- **With neither `icon` nor `description`, `EmptyState` is a sentence**: the title in `body-md` / `text-subtle`, at the
  block's start, no padding of its own — the block's margin is the margin. The action (default slot) goes under it,
  `spacing-md` apart, at the start too. Measured in a `SectionCard`: 14px regular, `text-align: start`, 0px padding; 20px
  tall alone, 66px with a `Button sm`.
- **The centred form stays for an empty screen** — glyph, strong title, the measure, the 64/48px of air — whenever a glyph
  or a description is given. A description without a glyph still takes `inbox`.
- **The decision is the props' presence, not a prop** (ADR-0053's rule): `icon` lost its `inbox` default so that its
  absence can be read. Every product call that passes neither was a block's empty state (two in etolbi: the field data and
  the auditor's requests); every screen-sized one already names a glyph.
