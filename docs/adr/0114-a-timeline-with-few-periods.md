# ADR-0114 — A timeline with few periods

**Date:** 2026-11-05
**Amends:** ADR-0100 (`MapTimeline`)
**Source:** etolbi on 0.94, the dMRV project page: years only (5 to 7 periods), no `scales`.
**Status:** Accepted

## Context

Two defects, measured in Storybook:

- **A void at the start.** The bar is 30rem and the track sits at its end (the latest periods are the ones read). Five
  years left **127px** of empty bar between ‹ and the first year. The drawing fills the start with the scale chip,
  which the component only shows with two scales or more.
- **Labels off their line.** A « mesure disponible » dot sat *in* its period's box, under the label, so every year
  with a dot was 6px taller and — centred — its label rode 3px above the chosen year, whose pill hides its dot.

## Decisions

- **One scale is said, not offered.** With `scales` of one, the bar starts with its word (« Année ») in the chip's
  type, `label-md-strong` `text-subtle`, then the rule — no chip and no chevron: a chip says « choose », and there is
  nothing to choose. With none, nothing.
- **One scale or none: the bar hugs.** 480 is a *size* so that switching years → months never resizes the bar; with
  nothing to switch, that reason is gone. The bar is `fit-content` up to the same `min(30rem, 100%)`, then scrolls as
  before, and stays where the screen centres it (ADR-0103's axis). Measured: five years, **358px**, 6px from ‹ to
  2020. With two scales or more it stays 480.
- **A dot hangs under its label, out of the flow** (`position: absolute; top: 100%`). Every label now shares one line,
  dot or no dot, chosen or not — measured at the same top in all four stories. A day between the labelled ones (`minor`)
  *is* its dot and keeps it in the flow.
