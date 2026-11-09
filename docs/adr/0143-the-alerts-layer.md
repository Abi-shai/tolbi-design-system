# ADR-0143 — The alerts layer

**Date:** 2026-11-09
**Source:** etolbi, « Couche Alertes (ARR · dMRV) » — the owner's recap, decided (Figma `4037:5437`: « Alertes : le bloc »,
« Alertes : le modèle », « Interactions »). Cancels the « Alerte » element of ADR-0139's lot 2: an alert is a row.
**Status:** Accepted

## Decisions

- **`PanelBlock`** — the reading block of a map's panel: sunk surface, title, an optional `help` (`HelpIcon`), `#aside` on
  the title's line, the body in a column. It is **`SectionCard` at a compact density**, rendered not redrawn (ADR-0001):
  the product's `ArrPanelBlock` was ADR-0097's titled block at 12 / 8 where a form breathes at 20 / 16. `SectionCard`
  gains `density: 'compact'` and `help`.
- **`OptionCard density="row"`** — one 40px line: the icon on a 28px `bg-neutral` tile (`radius-inner`), the title in
  `label-md-strong` cut on its line, **the badge right after the title** (not at the end, as in a card), the meta at the
  end, the chevron when the row leads. No sentence. The badge stays part of the row's description for a reader.
- **`AlertsBlock`** — a `PanelBlock` « Alertes » with its count (`Badge` error), then the alerts as rows: the kind's glyph
  (terrain, mesure, méthode), « code · objet », the severity's badge — **Bloque / À surveiller / À revoir** → error /
  warning / neutral — and the delay. Each row emits `select` with its item; the product decides (map and sheet, or the
  data window).
  - **Three lines at most; « Tout voir (n) » only past three** (the owner, the same day). With three or fewer, no
    button and nothing to unfold.
  - **One button, its words turning** (the owner, amending the first cut): « Tout voir (n) » **unfolds the block in
    place** and becomes « Réduire », which folds it — a disclosure (`aria-expanded`, `aria-controls` the rest), its
    chevron down then up. The first cut kept « Tout voir » and set a second « Réduire » at the foot's other end: two
    controls for one state, and the second said nothing the first could not. So there is no `see-all` event — the data
    window's alerts tab stays the product's, reached through « Toutes les données ». A press on the block itself (not a
    row, not the button) unfolds it too, a pointer shortcut; `v-model:expanded`. The rest opens its own space
    (ADR-0025, `enter` in, `exit` out).
  - **An alert that blocks** (`followUps`): its line alone at the head, then its next steps (rows without gravity, one
    to three), and no « Tout voir ».
  - **No alert, no block** — nothing is rendered, no empty state.
- **`--ds-chart-status-critical / -warning / -neutral`** (and `chartStatus` in `./tokens/js`) — a parcel's outline and its
  key: Badge's error / warning / neutral hues at their middle step (500, 500, gray 400 — not gray 500, which is
  `--ds-map-pending`'s dashed outline). **Measured, no single step clears 3:1 on both grounds** — on the light basemap
  3.14 / 1.96 / 2.15, on dark imagery 2.07 / 3.31 / 3.02 — so an outline drawn on imagery wants a light casing (the
  engine's paint).
- Measured: rows 40px, the badge 8px after the title, the block 12px around; « Tout voir (5) » with five alerts, none
  with three; nothing rendered with none. « Se déplie au clic » carries a `play` test (block press → five rows and no « Tout
  voir », « Réduire » → three, « Tout voir (5) » `aria-expanded="false"` → five, « Réduire » → three, a row → `select`,
  no unfold).
