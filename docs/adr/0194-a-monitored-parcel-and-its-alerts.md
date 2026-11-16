# ADR-0194 — A monitored parcel, and its alerts on the glyph and the cluster

**Status**: accepted (the owner, 16 Nov. 2026 — the Carbone (dMRV) map, track M2). This extends ADR-0190.

## Context

The dMRV map takes the ARR cockpit's principle (ADR-0190):
- clusters from afar;
- one glyph per parcel closer;
- the parcel itself up close, with the glyph and the shape relayed.

What the package lacked was coded provisionally in the product:
- a `leaf` swapped by hand into the package's SVG, and into `MapCluster` through a `MutationObserver`;
- an alert ring drawn as a separate Mapbox `circle` layer;
- an alerts badge added to the marker with inline styles.

## Decision

### 1. A third family, `monitored`

`MapGlyphFamily` gains `monitored`: the project's disc with Lucide's `leaf`. What is followed in dMRV is the
vegetation's carbon; the leaf is clear at 24px and is mistaken for neither the ARR parcel nor the sight.

- Sizes are the project's: 40px, 46px under the pointer, 56px chosen.
- Its clusters are the project's steps: 44 / 56 / 68px.
- Its default cluster name is « N parcelles ».
- The legend can show it too: `ChartLegendShape` gains `glyph-monitored` (ADR-0192).

A **family, not a free `pictogram` option**. A glyph names a kind of object, and the kinds are the package's
vocabulary, so a new kind is a new family. Each family is drawn and checked here, at the sizes it is shown, the way
ADR-0190's small sight was.

### 2. The alert ring

`MapGlyphOptions` gains `severity` (`blocking | watch | review`, ADR-0143's three).

- The ring is 3px thick, at the severity's hue (`--ds-chart-status-critical / -warning / -neutral`, exported as
  `MAP_GLYPH_SEVERITY_COLOR`).
- Its centre is at **half the size + 3px**, as the product drew it.
- On a chosen glyph it moves out with the thicker contour, so the two never touch.
- The ring is **part of the image**, so it is part of the name (`ds-glyph-monitored-blocking-40-…`), and the image
  grows to hold it: 40 → 50.25px. The chosen glyph's 84px box already holds it.
- A control point can carry the ring too: a rounded square ring, at the same distance from its edge.
- The product's separate `circle` layer goes.

### 3. `MapCluster`'s alerts

`MapCluster` gains `alerts` and `alertSeverity`. They draw a second badge, the count's badge mirrored to the **bottom
left**:
- it is 1.375rem high, in `label-md-strong`, ringed in white;
- its colour is the hue of the gravest severity in the cluster (blocking > watch > review);
- it is absent when there is no alert.

The button's name says it too: « 18 parcelles, dont 3 en alerte ».

**Two departures from the brief.**
- **The figure is in ink, not white.** Measured, white is under the 4.5:1 a text needs on all three hues (3.76, 2.35,
  2.58), and ink is over it on all three (4.72, 7.56, 6.89). It is ADR-0191's rule: the ink that measures better.
- **The text role is `label-md-strong`.** The brief named `label-sm-strong`, which does not exist in the package.

### 4. Flights

`flyGlyphs` takes any `MapGlyphOptions`, so dMRV's bursts and gatherings fly with `family: 'monitored'` exactly as
the cockpit's do.

## Measured (Storybook)

| What | Value |
|---|---|
| Ring at 40px | r 18.4 units = 23px (20 + 3), 2.4 units = 3px; hues `#f04438` / `#f79009` / `#98a2b3` |
| Image box at 40px | none 40 · in alert 50.25 · chosen 56 in alert 84 |
| Image names | `ds-glyph-monitored-40-079455`, `ds-glyph-monitored-blocking-40-079455` |
| Cluster names | « 18 parcelles, dont 3 en alerte », « 9 parcelles » |
| Cluster badge | 22px; red / orange / grey ground, ink figure `rgb(16, 24, 40)`; absent without alerts |

## For the product to remove once installed

- `app/utils/dmrv-map-glyphs.ts`.
- The `dmrv-dots-alert` layer.
- The alerts badge added to the marker, and the `MutationObserver`.
