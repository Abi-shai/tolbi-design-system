# ADR-0102 — A map's legend, and the indicator it reads

**Date:** 2026-11-05
**Supersedes:** ADR-0100's `ColorScale` (never published)
**Extends:** ADR-0096 (the sequential ramp, `ChartLegend`'s shapes), ADR-0033 (Tabs' pill)
**Source:** the owner's « Indicateur » (Figma `3670:39635`): a map in full GIS mode, its legend, and a switch
between Carbone / Biomasse / Couvert / Hauteur.
**Status:** Accepted

## Decisions

**The component is the legend, so it is named `MapLegend`** (`Données/Map/Legend`). `ColorScale` named one of
its parts: the gradient is what it draws, the legend is what it is — and the switch between indicators is not a
scale at all. `ChartLegend` names a chart's series; `MapLegend` says how to read a map. Renamed before any release,
so nothing is deprecated.

**It switches what the map shows** when the screen offers several indicators (`metrics` + `v-model:metric`): the
switch sits **above the scale it changes**, so the reader never looks for the key to what they just chose. Which
indicators exist is the module's; the product answers a switch with another `title`, `unit`, `ticks` — and map.
One indicator, no switch.

**As drawn**: its own surface (a map's instrument, like `MapNavigator` — `bg-default`, `border-subtle`,
`elevation-raised`, 8px around, `radius-surface` for Figma's 14), the switch flush with it, then one line — the
indicator's name at the start (`label-md-strong`), the scale beside it 16px away: the unit above the gradient's
end, the 8px gradient (`radius-inner-sm`), the bounds under it (`label-xs`, `text-subtle`, tabular). The symbols'
key (`ChartLegend` shapes) below. 592px is a **ceiling** (ADR-0031), not a size. A reader hears the gradient once:
« Carbone, de 0 t à 16 t CO2e/ha ».

**`Tabs size="xs"`** — Figma's proposal of 22 Oct., brought to the package: 28px tabs in `label-md-strong`
(6/8 padding) on a 2px rail, `radius-control` outside and `radius-inner-sm` inside (ADR-0013: radius scales with
the element). Measured: tab 28, rail 34.

**The ramp stays sequential.** The drawing's gradient is red → yellow → green (ColorBrewer RdYlGn, 11 steps). A
magnitude takes `--ds-chart-sequential-*` (ADR-0096): red → green is a **diverging** ramp, which claims a
midpoint the index does not have, and its ends measured ΔE 18.9 apart in protan. `colors` is still the caller's
for a quantity that does diverge.
