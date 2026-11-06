# ADR-0122 — A map that fills in instead of replacing itself

**Date:** 2026-11-06
**Amends:** ADR-0087 (what sits on a map), ADR-0099 / ADR-0100 / ADR-0102 / ADR-0103 (the GIS instruments)
**Source:** etolbi, the dMRV project page: five phases between the click and a readable map — the project (0.3–1 s),
its parcels and measures (0.5–3 s), the basemap's style (0.2–1 s), its tiles (0.5–2 s), the data layers parcel by
parcel (0.5–4 s) — and none had a form: a spinner, a white screen, then instruments and tiles appearing at once and
parcels popping in with no sign of progress or end.
**Board:** Figma « ↪ Carte — chargement · benchmark et pistes » (`3800:1447`) — 32 products measured live under a
slowed network with the style and tiles refused, 28 sources read; three tracks drawn on the owner's GIS frame, five
phases and four states each. **Track C chosen** by the owner.
**Status:** Accepted

## Decisions

- **One screen that fills in.** From the click the screen has its final form (21 of 32 products; 32 of 32 never
  replace the screen after a click): the panel, the legend, the timeline and the navigator in their places, each
  drawing its own wait from a prop — the product passes a state, the component draws it.
  - `MapPanel loading`: head kept (a placeholder title line without `title`), body `#loading`, by default a figure,
    lines and a block; foot kept.
  - `MapLegend loading`: the ramp is drawn (its colours are the indicator's, known before any data), the unit and the
    bounds are placeholders in their own line box. No `ticks` and not loading: the bounds are « — » (ADR-0105).
  - `MapTimeline loading`: the bar keeps its place and width, five placeholder periods, nothing to step or compare;
    when the periods arrive the strip opens on the chosen one.
  - `MapNavigator disabled`: every control there and off, **only while the map does not exist** — 0 of 30 products
    disable the zoom of a map that is there.
- **`MapCanvas`** is the map's place: the positioned container the overlays sit in, and a ground in
  `--ds-map-land` — the TOLBI style's own land (#F2EADA; 23 of 32 hold the canvas with their style's flat colour, no
  skeleton, no shimmer). The engine (`#engine`, Mapbox's container) is **hidden until its basemap is complete, then
  fades in whole** over `ambient` + `easing-out` — a scene arriving. 26 of 30 paint tile by tile and 0 of 30 fade
  the whole map; the owner chose the whole. It stays rendered while hidden (opacity), or the engine could not
  measure itself. `basemap`: `pending` → `loading` (tiles on their way) → `ready` (the engine's `idle`). **A ceiling:
  2 s after `loading` the engine is shown, finished or not** — the fade must not become a second wait. Nothing fades
  under reduced motion.
- **Track C — the parcels first.** A map's skeleton is its parcels: each is drawn as a **dashed outline** until its
  data arrives, then its image fades in (`enter`), so what is missing is seen where it is missing, and a partial map
  is the natural end of the wait rather than a new drawing. The engine paints them, so the package ships the paint:
  `--ds-map-pending` (gray 500, 4.16:1 on the land) and `mapPending` in `./tokens/js` (`color`, `width` 1.5px,
  `dasharray` [2, 1.5] in line widths), with `mapLand`. **What moved from the board:** the board drew the outlines on
  the bare ground at phase 2, before the basemap. In one engine canvas the outlines and the basemap appear together,
  so with the whole-map fade they arrive *with* the basemap; earlier would cost the fade.
- **`MapStatus`** says what the map is missing, **on the map, never in its place**: a pill above the timeline
  (`MapOverlay position="bottom"`, after the timeline — the overlay stacks toward the centre), the map's surface
  chrome. One `state`; **the state picks the glyph and the ink** (ADR-0006), the product writes the words:
  `loading` (a spinner and the count, « 33 sur 89 » — NN/g: count a series; no product of 30 does), `fallback` (the
  TOLBI style failed and the map fell back to satellite — 1 product of 25 says so), `partial` (warning ink,
  `image-off`), `empty` (a project being computed), `failed` (error ink, with its action). `null` is nothing: the pill
  leaves as a surface and takes no room. A reader hears **the words once**, not every count; `failed` is said at once.
  `image-off` joins the icons.
- **Not done:** nothing under a second gets an indicator of its own (NN/g, Atlassian) — the instruments' placeholders
  are the signal until the count starts. No percentage: the wait is 2–11 s chained, the band for a looped indicator,
  and the count already says how much is left. The breadcrumb's project name while it is read stays the product's.
- Stories: `Données/Map` « Chargement — du clic à la carte » (the five phases replayed on Soubré's 89 parcels, traced
  from the owner's frame; the basemap image is © Mapbox © OpenStreetMap, served from `public/`, not shipped) and
  « Chargement — les quatre états »; `Données/Map/Canvas`, `Données/Map/Status`, and a waiting story for the legend,
  the timeline, the navigator and the panel. Filmed: engine at opacity 0 until `ready`, 0.78 one frame in, 1 after;
  the count rises to 89 and the pill leaves; the timeline opens on 2026 with its pill on it.
