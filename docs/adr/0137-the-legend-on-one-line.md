# ADR-0137 — The legend on one line

**Date:** 2026-11-09
**Amends:** ADR-0102 (`MapLegend`), ADR-0116 (one width with the timeline), ADR-0129 (by category)
**Source:** product, 9 Nov. — Figma `3919:1427` (« Légende de carte compacte — benchmark et pistes »), track A retained.
**Status:** Accepted

## Context

The legend stacked the indicators' switch (`Tabs xs`) above the scale: 580 × 116 on the map, a whole line spent on a
decision rarely taken, the title repeating the chosen tab, the unit floating over the ramp. The timeline at the bottom of
the same map says the same kind of thing in 48px: a chip that chooses, a rule, the values.

## Decisions

- **The timeline's grammar, to the pixel**: one raised pill — `MapTimeline`'s height (**48**, not the board's 42: the
  timeline has been 48 since ADR-0115, and « the frise's height » is the intent), padding, gap, border, shadow, radius —
  then the chip, the rule, the values. On the GIS screen both measure 480 × 48 on one axis.
- **The chip names the indicator** and, with two or more `metrics`, chooses it: the timeline's own composition
  (`Dropdown` + `DropdownTrigger chrome="chip"`, `size="sm"`), `v-model:metric` unchanged. Each row shows the name, the
  unit (`meta`) and a 40 × 6 preview of the indicator's ramp — `DropdownItem` gains a `#trailing` slot for it. Items gain
  `unit`, `colors`, `shortLabel`, `disabled` (ADR-0119's rule: listed, greyed, reachable). The title is not repeated:
  with `metrics`, `title` is written after the rule **only when it says what the chip does not** (« 2021 → 2024 » while
  comparing); without `metrics`, it is the chip's word.
- **Nothing to choose, no chip**: one or no indicator, or a key by category, says its word without a ground or a chevron
  — the timeline's lone scale (ADR-0114). The board drew a grey chip there; a chip says « choose ».
- **The scale on one line**: low bound, ramp, high bound, unit. The middle ticks are no longer written; they are said
  (`summary`, or « name, de first à last unit »).
- **480, always, for a scale; the ramp is the only elastic part** — the legend never changes width from one indicator or
  one year to the next. Measured: Carbone 247px of ramp, « Couverture forestière » 0–1 250 ha 201, Comparer 143, the
  cockpit 127. **Under 120px of ramp the chip says `shortLabel`** — decided against the ramp the long name would leave
  (measured with the chip's own font), so the two never take turns; at 360px « Couvert » leaves 162.
- **By category**: at its size, 480 at most (414 for the three ARR keys); past it the last keys go into a « +N » chip
  whose panel (`Dropdown role="dialog"`) lists them — what fits is measured off an invisible copy that takes no room
  and no scroll.
- **A ramp and symbols** (cockpit): after the unit, a rule and a « Symboles » chip carrying the symbols' marks,
  overlapping by 2px; their names in its panel. 747 → 480.
- **Loading** (ADR-0122): the pill at 480, the chip readable, the ramp drawn in the indicator's colours, bounds and unit
  as placeholders. **Empty** (ADR-0105): bounds « — », no unit.
- **Changing indicator, nothing moves**: the new ramp fades in over the old one, which stays under it until the fade has
  played (`process`) — measured 0 → 1 over ~300ms with the old one at 1 throughout, never bare ground; bounds and unit
  swap through `SwapTransition`. A reader hears the new scale **once**, when it has landed (not while loading), from a
  status region that mounts empty (ADR-0058).
- **The menu takes the arrows** — and this is `Dropdown`'s, not the legend's: a `role="menu"` dropdown had no arrow keys
  at all (rows were reached with Tab). ↓/↑ on the trigger opens the menu on its checked row (or the first / the last),
  ↓ ↑ go round inside, Home / End to the ends, Escape hands the focus back (as before). The timeline's scale chip gets it
  too. Tab still walks the rows.
- **Not taken from the board**: its red → green ramp. A magnitude is sequential (ADR-0096); the product passes its own
  `colors` where it diverges (Comparer).
