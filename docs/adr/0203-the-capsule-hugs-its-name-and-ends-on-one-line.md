# ADR-0203 — The capsule hugs its name, ends on one line, and the marquee laps exactly

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0202 and corrects ADR-0032's wrap.

## Context

The owner went through the capsule module by module (ID, Scan, Yield, Source, Data, Inset, INA) and found two
things:
- **The fixed 170px identity was wrong in both directions.** It left a gap before the rule after a short name
  (« Cacao Démo SA », « Cartographie 2 ») and cut a long one early: five names of seven were cut on our data.
- **The end of the capsule stacked** the status badge over the date, two lines for one fact.

ADR-0202 had justified the fixed width by the marquee's loop. The owner asked that this be checked.

## Decision

### The identity hugs, up to 15rem

- The identity is `width: auto` with `max-width: 15rem` (240px).
- Past that, the module's name and the row's name are cut with an ellipsis, as before.
- Compared on the real capsule with 200 and 280px, at 240 every name of ours fits except the longest.

### The end on one line

- **One line, centred vertically**: the date or the freshness first, the badge after it, `spacing-md` (8px) apart:
  « 2026 [Terminé] », « Mise à jour hier [Collecte en cours] ».
- Without a badge (ID, Inset, INA), the date alone.
- The date keeps `label-md` in the secondary ink, and the badge does not change.

### The loop: what the check found

**A width that varies does not make the loop jump.** `ModuleBanner` renders the same capsules twice, so the two runs
are identical in width whatever the capsules are (measured: 3 928.41 / 3 928.41).

**The loop jumped anyway, by 4px every lap, at any width.** `useMarquee` wrapped by **half the track's width**. That
half is one run plus **half** the gap between the two runs, where a lap is one run plus the **whole** gap. So every
wrap snapped the row back by the other half of the gap. The defect dates from ADR-0032 and is unrelated to the widths.

**The lap is now measured** as where the second run starts (`runs[1].offsetLeft − runs[0].offsetLeft`). Without two
runs to measure, it falls back to half the track.

## Measured

- **Identity widths**, on the product's five capsules: 131 / 221 / 240 (cut) / 240 (cut) / 219.
- **The end**: the badge after the date, both centred on the line (0px offset).
- **One lap filmed**, one capsule per run, a 518px lap:

| Version | The leading capsule's step at the wrap | Snap |
|---|---|---|
| Before | 513.00px | 4px |
| After | 517.53px (the lap less one frame's step) | none |
