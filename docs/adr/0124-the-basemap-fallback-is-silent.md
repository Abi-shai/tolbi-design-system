# ADR-0124 — The basemap fallback is silent

**Date:** 2026-11-06
**Amends:** ADR-0122 (`MapStatus`)
**Source:** product decision, 6 Nov.
**Status:** Accepted

## Decision

- **`MapStatus` has no `fallback` state.** When the TOLBI style fails and the map falls back to satellite, nothing
  says so — on the map, in the legend or anywhere else. The map stays readable on the satellite and the reader has
  nothing to do with the news; a message that asks for no action and changes no reading is noise. `MapStatusState`
  is `loading | partial | empty | failed`; the glyph, the default words and the story are gone.
- The benchmark had counted this silence as a gap (1 product of 25 says it, ADR-0122). It was the 24's answer, and
  the product's: a state is worth a word when it changes what the reader does or how they read the map — `partial`
  (some parcels have no data), `empty` (nothing to read yet), `failed` (an action to take) do; a different basemap
  under the same data does not.
