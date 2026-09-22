# ADR-0038 — The shell is shared, the insight is not

**Date:** 2026-09-21
**Status:** Accepted
**Extends:** ADR-0028 (derived from content, not declared), ADR-0016 (the categorical palette and
its ceiling), ADR-0031 (`ModuleCapsule` — product vocabulary in the system), ADR-0026 (skeleton →
content)
**Source:** Sprint 18 — `1488:4799` (`ProjectCard`), and a Mobbin pass over Felt, Fabric, Cosmos,
Midday, Coursera, Bloom, Descript, Higgsfield
**Breaking:** none. New component.

## Context

Several modules have a thing called a project, and each one draws its own card. The question was
not how to draw one card — it was how much of it every module has to share.

Too much sharing and a card lies. The example we started from was Scan's four detected crops forced
into Yield's four-segment progress bar: *46 % of the way through* where it means *46 % groundnut*.
Too little and a grid that mixes modules stops being scannable.

That example turned out to be half wrong, and the correction is the more interesting half.

## Decisions

### The anatomy is shared — and so, it turned out, is the insight

Every project card is a snapshot, a name, a line of identity metadata, two figures, one insight
block and a freshness line. That is what makes a mixed grid readable, and it does not vary.

**What a module *measures* is the one place the pattern may break**, and we held Yield and Scan
apart on exactly that ground: Yield passed `stage`, read as *2 of 4* — an ordinal progress — while
Scan passed `crops`, a proportional spread. One geometry carrying opposite meanings is the failure
this ADR exists to prevent, so they were kept as two blocks.

**The reading of Yield was wrong.** A parcel is never *at* a phenological stage. Its hectares are
spread across several at once — 62 % in flowering while 12 % is still emerging — and what matters is
the share, not the rank. So `stage` is a spread, the same kind of statement as `crops`, and it draws
the same bar:

| | Yield | Scan |
|---|---|---|
| passes | `stage[]` + `stageLabel` | `crops[]` + `cropsLabel` |
| means | 62 / 21 / 12 / 5 % of the parcel, per stage | 46 / 27 / 18 / 9 %, per crop |
| draws | one stacked bar whose widths *are* the data, plus a legend | the same |

**One geometry, two props.** They stay separate because a stage and a crop are not the same thing to
a caller, and `stageLabel` is what decides which spread a card is describing. Note what did *not*
fall: the block is still derived from the data rather than declared by a `module` prop (ADR-0028).
What fell is our classification of one module's data — a different mistake, and a far cheaper one.

**The order is the component's, not the caller's.** Segments sort biggest-first, because the
categorical palette is ordered by measured ΔE (ADR-0016) and the dominant share should take the most
distinguishable hue. It also makes the `+N` tail always the small change — and a colour the legend
does not name is not a colour, it is noise, so whatever collapses into `+N` collapses into one
neutral in the bar as well.

### Which block renders is **derived**, not declared

There is no `module` prop, and a third module adds a block here rather than an axis — ADR-0028's
rule, which survives the correction above intact.

### `state` carries two things that are not project states

`planned | running | done | loading | error`. The last two are render conditions, not phases of a
project, and they sit on the same axis for two reasons: they are what a consumer actually has to
choose between, and the status pill's tone falls out of the same value, so the pill and the state
can never disagree.

**`error` is the snapshot's failure, not the project's.** The pill stays and still says *En cours* —
only the picture is missing.

### The wait says nothing; the absence speaks

Straight off the benchmark. Fabric, Cosmos, Midday, Coursera and Sprig all render a loading
thumbnail as **the same grey as the rest of the skeleton** — no glyph, no word. A glyph there reads
as a final state.

Bloom and Descript do the opposite for a failure: a glyph, a word, and an **action** in the
thumbnail itself.

So `loading` carries **neither the pill nor the overflow button** — there is nothing to command yet
— and `error` carries both plus a glyph and a line. Three kinds of absence were explored
(unavailable / no geometry / failed) and they sort by **whose move it is**: the system retries, the
user traces, or the system failed. Only the first ships; the other two are drawn beside the
component in Figma.

### The snapshot is generated, never chosen

Felt's answer, and the reason they never need a cover picker: the thumbnail is a render of the map's
own state, so it always matches the content and the "no image" case only exists as a failure.

Three consequences for framing, recorded because they are easy to get wrong:

- frame the **union of every geometry** the project holds, with a margin — a parcel touching the
  edge reads as cut;
- **bound the zoom both ways** — one 0.2 ha plot fitted exactly shows no context, and two parcels
  200 km apart make each a pixel;
- frame to the **tile's ratio**, not its width. The media is `aspect-ratio: 280 / 128`, so a tall
  narrow parcel is small with two empty margins.

Felt also puts every control *below* the image. We do not — the pill and the overflow button sit on
it — which is the one contrast risk the card carries, since a snapshot is an arbitrary photograph.
Recorded rather than solved.

### Nothing in the card wraps

Neither the identity chips nor the crop legend. Both clip, and the legend's tail collapses to `+N`.
A card that grows a line when a seventh crop appears stops matching its neighbours, and a grid of
cards of different heights is worse than a legend that is one entry short.

### The crop colours are the **chart palette**, not the drawing's greens

Crops are a data series, so they take `--ds-chart-categorical-*` — ordered by measured ΔE, so the
first N are always the most distinguishable (ADR-0016). Past that ADR's ceiling of five, the tail
shares one neutral rather than reaching further down a ramp that was solved for five.

The Figma exploration used four hand-picked greens. They were never tokens — `chart/categorical-*`
exists in code but **has no Figma variables**, which is why the drawing reached for raw hex. The
code follows the ADR; the file needs the variables.

## Consequences

- The metric figure is `label-xl-strong`, not a metric role: the metric ramp starts at 30px and
  would swamp a 280px tile.
- `--project-card-crop-rest` is a variant switch, not a token (ADR-0010) — it aliases
  `bg-neutral-strong` and carries a component-scoped name.
- Only Yield and Scan ship. Data, Survey, Source and Carbone were studied from `ModuleCapsule`'s own
  stories and drawn in Figma; Call, Redd+, Forest and Trace have no recorded data anywhere.

## Still open

- `chart/categorical-*` has no Figma variables, so the file cannot bind what the code uses.
- The pill and the overflow button sit on an arbitrary image with no guaranteed ground.
- The two remaining kinds of absence (no geometry, analysis failed) are drawn but not built.
