# ADR-0132 — Secondary text in a reading panel

**Date:** 2026-11-08
**Amends:** ADR-0011 (the roles), ADR-0131 (`StatGroup`)
**Source:** etolbi — in the ARR panel (`MapPanel lg`), beside a 40px `MetricValue lg`, the share legend and the chart
ticks were 11px (`label-xs`), the tiles' captions, documents' sentences and legend entries 12px, the figure's unit
14px: the words that explain a figure looked tiny beside it.
**Board:** Figma « ↪ Texte secondaire dans un panneau de lecture · pistes » (`3873:1427`), rendered from code — today,
the proposal, and a project card at 11 / 12 / 14px. Validated by the owner.
**Status:** Accepted

## Decisions

- **A 12px floor for any text that is read.** No component uses `label-xs` (11px) any more: `ShareBar`'s legend,
  `ChartFrame`'s ticks, `MapLegend`'s unit and bounds, `DropdownItem`'s shortcut and `Report`'s running heads take
  `body-sm`. The role stays, its description marked deprecated, for products that still name it.
- **14px for a figure's secondary text in a reading panel** — `MapPanel lg` and `Dialog` set
  `--reading-secondary-font` (`body-md`, with its `-emphasis`), and `ShareBar`'s legend, `StatTile`'s caption,
  `OptionCard`'s sentence and `ChartLegend`'s entries read it, falling back to `body-sm`. A context, not a size prop:
  the same component is right at 12 in a 280px card and at 14 beside a 40px figure, and it is the place that knows
  which. **A `ProjectCard` resets it** wherever it is shown — at 14 its legend reads one crop fewer.
- **A large figure's unit grows with it**: `MetricValue lg`'s unit goes 14 → 16px (`body-lg`).
- **`StatGroup` 2 × 2 in a panel's section** (ADR-0131's defect): a `SectionCard` in a 25rem panel leaves the group
  324px, two 10rem tiles wanted 328, and the group fell to one column. Tiles now floor at 9.5rem; a group under 22rem
  tightens its tiles' inset 16 → 12 (Card's `sm`) so « 28 940 tCO2e » holds at 24px (128px for 132); and a figure under
  8rem steps to 20px before its unit could be pushed off the line.
- Measured in the ARR panel: legend 14, ticks 12, captions / entries / sentences 14, unit 16, the group 2 columns at
  24px with the unit on its line; a project card's legend 12; the 2xl window's captions 12 (no panel), figures 32.
