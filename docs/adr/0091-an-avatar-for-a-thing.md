# ADR-0091 — An avatar for a thing

**Date:** 2026-10-28
**Extends:** ADR-0001 (`EmptyState`'s shape), ADR-0004 (a glyph inside a control is an ornament),
ADR-0043 (what a size is)
**Source:** etolbi, EUDR item 42 — « Avatar : une icône en contenu (`icon: IconName`), comme `EmptyState`,
et une taille `3xl` (112 px, icône 48). Cas : l'en-tête de la fiche d'une parcelle EUDR, avatar de la
parcelle (`land-plot`) au lieu d'initiales, avec l'anneau `bg-default` de 4 px et `border-inset`. »
**Status:** Accepted

## Decisions

**An avatar is not only a person.** A parcel has no initials and no photograph, so the third content is a
**glyph**: `icon?: IconName`, the shape `EmptyState` already publishes — but on the **avatar's own ground**
(`bg-neutral`, ink `text-subtlest`), not `EmptyState`'s tile, because the avatar *is* the tile. The order of
the four contents is unchanged and now reads: a photo, then initials, then a glyph, then the silhouette —
each one the fallback of the one before.

**The glyph's size is a rule, not a table of taste**: the largest `Icon` rung that is at most **half** the
diameter, so a quarter of the box stays margin on each side. Measured, that is 16 / 16 / 20 / 24 / 24 / 32 /
**48** across `xs → 3xl` — the 48 the product asked for falls out of it. At `xs` there is no rung at or under
12 (16 is `Icon`'s floor), so **the margin gives rather than the glyph** — ADR-0039's rule at a floor, with
the box fixed this time instead of the padding. 48 rides `Icon`'s number hatch: a glyph inside a control is
an ornament (ADR-0004), and this one is not artwork, so it does not belong on ADR-0043's ladder.

**`3xl` is 112px**, nearly twice `2xl` — the step a page heading needs and a list never does. Its initials
take the ramp's own 0.375 of the diameter (42px) and its badges the ramp's own quarter and three-eighths
(28 / 40), so nothing about the new rung is hand-tuned.

**The ring is a shadow, not a border.** `ring` paints `0 0 0 4px var(--ds-bg-default)` — a band of the
page's own surface, so an avatar that overlaps a header band reads as lifted off it. A border would eat
8px of the box and the declared size would stop being the size (ADR-0039); an `outline` is free too but
`box-shadow` is unclaimed here, since `Avatar` carries no focus ring of its own (its trigger does —
ADR-0053). The hairline `border-inset` still runs **inside** the ring: the two say different things, one
separating the avatar from the page, the other keeping a pale photograph's own edge.

**An avatar with nothing to call it is decoration.** `role="img"` with no accessible name is a defect, and
it was there before this change — the silhouette and an untitled photo both shipped it. The role and the
label are now conditional on there being a name (`alt`, else `initials`), and without one the whole thing
is `aria-hidden`. What names a parcel is the heading beside it, never the drawing (ADR-0041).

## Still open

Figma has `Avatar/xs`, `Avatar/sm` and `Avatar/md` as three loose components rather than one set, so `3xl`,
the glyph and the ring have no counterpart there yet.
