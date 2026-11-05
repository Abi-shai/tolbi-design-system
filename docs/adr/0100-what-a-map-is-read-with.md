# ADR-0100 — What a map is read with: a scale, a click, a timeline, a navigator, a card that computes

**Date:** 2026-11-05
**Extends:** ADR-0096 (the sequential ramp, `ChartLegend`'s shapes), ADR-0087/0099 (`MapPanel`), ADR-0084
(`ButtonGroup`'s rail), ADR-0038/0055 (`ProjectCard`), ADR-0006 (chrome, not an engine)
**Source:** ARR · Dynamic baseline, lots 6–8; board « ↪ ARR — les pièces restantes » (`3664:11954`); the owner's
components « Frise du temps » (`3042:10961`) and « Carte/Navigateur » (`3552:3437`). The owner dropped lot 5 (the
resource row: the panel will change, no effort in what will go), took the recommended tracks for 6 and 8, and for
7 asked for **his drawings, faithfully** — after a first draft built from the catalogue's form controls.
**Status:** Accepted

## Decisions

**`ColorScale`** (track A). The title above, a **continuous** gradient — the index is continuous, steps would
invent thresholds — three values under it, the symbols' key below (`ChartLegend`, ADR-0096's shapes). The ramp is
`--ds-chart-sequential-*` unless given. A gradient is not text: the bar is `role="img"` named once (« Indice de
stock, de 0,30 à 0,60 »), the ticks `aria-hidden`.

**`MapTooltip`, not `ChartTooltip`** (Figma `3667:2638`). Drafted first as a `dismissible` mode of
`ChartTooltip` — one surface for two readings — and **reversed by the owner the same day**: a map's click bubble
hidden inside the chart's tooltip is a component nobody finds. The catalogue is read by **where a thing is
looked for** (ADR-0007), so the map's pieces hold it: `Données/Map/Tooltip`. They differ in kind as well as in
place: `ChartTooltip` follows a pointer and holds nothing (`role="tooltip"`); `MapTooltip` is opened by a click,
holds a close, and is therefore a **non-modal dialog** named by its title. As drawn: 280px, 12 around, 8 between,
`radius-control`, `elevation-raised`; a 20px head (`label-md` title, `CloseButton xs` giving back its margin);
rows of an 8px mark, a word (`body-sm`), a value (`label-md`, tabular). Focus in on mount, back to the opener
on close if it was still inside (ADR-0062); Escape closes. The engine places it (ADR-0006). Measured: opened by
keyboard → focus on the dialog, Escape → focus back on the opener. `ChartTooltip` keeps only the `border-inset`
on its swatches (the ramp's first step is pale on white).

**`MapTimeline`** — the owner's « Frise du temps » (`3042:10961`), **drawn as drawn**. Drafted first as a
`PeriodPicker` composed of `InputDropdown sm` + `ButtonGroup sm` + a `Button`, and **reversed**: the catalogue's
form controls laid on a map read as a form, and the owner's instrument reads as the map's own — a raised pill
(42px, `radius-pill`, `elevation-raised`, 480px declared), bare glyphs and words, and **the chosen period in the
brand's solid pill**, the one thing on the bar to find at a glance. ADR-0001 is not broken: no component drew
this before; ADR-0050/0084 govern a list's current item and a segmented control, and this is neither — it is an
instrument on imagery, as `MapControls` is. What it owns:
- the **scale chip** (`scales` + `v-model:scale`, année / mois / jour): a `bg-neutral` pill with its chevron,
  the trigger of a real `Dropdown` (ADR-0050's rows) — the product answers with other `periods`;
- **the periods**, a radio group: one tab stop, ←/→/Home/End; the pill **slides** (`useSlidingIndicator`,
  filmed at ×10: 0 reversals, ≤ 2.2px a frame, lands on the step to 0.4px). A period may carry `data` (a 4px
  brand dot: a measure exists), `disabled` (receding — `text-disabled`, not the drawing's 35 % opacity: opacity
  is not a contrast strategy, ADR-0028), `minor` (a day between the labelled ones, drawn as its dot — brand
  with data, `border-subtle` without — and a pill again when chosen). A strip with dots or minor steps sets its
  labels a size down (`label-xs`), and minor strips recede the labels (`text-subtle`), as drawn;
- the strip shows what fits and is **cut at its edges as drawn**; it scrolls itself (no scrollbar) only when
  the choice would leave it, and re-reveals whenever its width changes — the type loading had left 2026 half
  cut (a fallback face is narrower);
- **« Comparer »** (`compare`) at the end, in brand ink: pressed, the next period chosen is the compared one
  (`v-model:comparison`), both wear the pill, the end says « 2020 → 2026 » with its ✕. The focus follows each
  replaced control (Comparer → ✕ → Comparer; the chip after a choice of scale).
The 16px glyphs keep the drawing; their target is a 28px invisible disc. A `border-subtle` edge is added
(ADR-0030: in dark the shadow cannot separate the bar from the map).

**`MapNavigator`** — the owner's « Carte/Navigateur » (`3552:3437`), **drawn as drawn**, gauge included. Drafted
first without the gauge and with one shape whose height travelled — **reversed**: the drawing is the
reference. Open: the mini-map (148 × 96, `#default`, the engine's) with its fold (`IconButton surface xs`) on
its corner, and under it − **the zoom gauge** + « Recentrer », 2px apart. Folded: a bar — − + « Recentrer », a
rule, and the mini-map's button **last**. **Amended (the owner, 5 Nov.)**: the drawing put that button first, so
folding and unfolding again meant chasing the control across the bar. Last, it lands in the corner the fold
leaves: measured, the two centres are 8px apart on each axis (29px and 21px in from the top-right corner), so a
pointer that has not moved is still on the target — six presses in one place, open ↔ folded every time. **`v-model:zoom`** between `zoomMin` / `zoomMax`: the gauge (a native range:
4px `border-subtle` channel, 12px white thumb ringed 2px in `text-default`) shows and moves it, − + step it and
stop at the ends; « Recentrer » emits. The two forms are two shapes (166 × 154 and 147 × 42), so the fold is
one surface leaving and the other arriving at the top-right corner (`SurfaceTransition` out-in, MapPanel's fold,
ADR-0099); the focus goes to the replacing button. The open form takes `radius-surface` (Figma's 14 is no step),
the bar `radius-surface-sm` (10, as drawn).

**`ProjectCard` `state="computing"`** (track A). The same card at the same height; the pill « En calcul »,
neutral, **with a clock** (ADR-0006: a tone never speaks alone); what is known stays, what is computing is said
**in words** — a metric `value: null` reads `pendingLabel` (« en calcul ») in the figure's line box — never a dash
(« nothing ») nor a skeleton (« seconds », where this takes minutes). Nothing to open: the title is plain text, no
menu, no lift (`--static`). **`#insight`** replaces the spread with what a module measures — ARR's « Indice de
stock » and its curve (ADR-0038: the shell is shared, the insight is not).

**`Sparkline`**. A trend where a chart would be too much: no axis, no grid, no point. `comparison` is a second
series **on the same scale**, dashed in `--ds-chart-threshold` (ADR-0096's reference line); the line is
`chart-categorical-1` (never brand, ADR-0016). It is a picture: `role="img"` with `label`, the sentence a reader
hears. Not an engine (ADR-0006): no tooltip, no interaction.

## Still open

- `ColorScale`'s middle tick is centred by `space-between`, exact only while the ticks are the same width
  (tabular figures make three values so).
