# ADR-0190 — What a map draws its points with

**Status**: accepted (the owner, 16 Nov. 2026 — the ARR cockpit, validated in the product, taken into the package).

## Context

The Dynamic baseline cockpit (ARR) draws two kinds of points:
- the project's points (parcels);
- their control points (reference plots).

The product coded and validated all of it locally:
- `utils/arr-cockpit-glyphs.ts`, with copied Lucide paths;
- `arr/cockpit-map.vue`, with its clusters, ghosts and glyph ↔ shape relay;
- one cursor rule and one hover-bubble rule, copied into three maps.

The package draws no map (ADR-0006), so what moves into it is everything that is not the engine: the drawings, the
cluster marker, the motion, and the rules. The product keeps its sources, layers and expressions.

## Decision

### 1. Glyphs — `mapGlyph.ts`

- **Two families, told apart by shape first.**
  - The project's point is a disc (r 13 in 32) with `land-plot`.
  - The control point is a rounded square (22, radius 6 in 32) with `crosshair`.
- **The drawing.**
  - The ground is the datum's colour, with a 2.5 white edge and a 1.4 ink contour.
  - The pictogram is in ink, and turns white **only where white measures better (WCAG)**. On the sequential ramp, that is
    only `success-800`.
  - Chosen: a contour of 3 and a drop shadow (dy 3, blur 2.6, ink at 38 %).
- **The sight at small sizes.** Lucide's `crosshair` keeps its ticks inside the ring, so at 24px it reads as a plain
  ring. **Under 32px** the control takes a small sight: the ring at half (r 5.5), four ticks outside it, short (3) and
  thick (3.4 at scale 0.6). Lucide's sight stays from 32px up (the chosen controls' 34). It is not a Lucide icon and
  not in `components/Icon/`: an ornament inside a glyph (ADR-0004).
- **The inks do not follow the theme.** They are primitives (`gray-light-900`, `base-white`), as `MapPin`'s are
  (ADR-0169), because the imagery has no dark mode. Every colour is resolved through the cascade, so the product may
  pass `var(--ds-chart-sequential-3)`.
- **What is exported for an engine.** A symbol layer cannot recolour a picture that is not a distance field, so it
  is one image per family × colour × size.
  - `mapGlyphSvg(o)` returns the markup.
  - `mapGlyphName(o)` returns a stable name.
  - `loadMapGlyphs(map, glyphs)` rasterises the glyphs at 2× (or the screen's ratio) and adds the missing ones to
    anything with `hasImage` / `addImage` (Mapbox, MapLibre). It is idempotent, so call it again after a basemap change.
  - The product no longer needs the icon paths.
- **One departure from the product.** A chosen glyph's image is **48** units, not 44, with the drawing **centred**.
  The product's 44 offset the drawing by (−6, −4) to leave the shadow more room below. That put the glyph 2/32 of its
  size above its point, because an engine anchors the image's centre.

### 2. `MapCluster`

- **What it shows.** The family's glyph at the cluster's mean colour, and the count in a badge.
  - The badge is 1.625rem, `label-md-strong`, in the same ink for both families, ringed in white.
  - It grows by steps with the count (< 10 / < 30 / beyond): a project's 44 / 56 / 68px, a control's 36 / 44 / 52px.
- **It is a button.**
  - Its name is « N points du projet » or « N points de contrôle »; `label` overrides it.
  - `click` lets the product zoom until the cluster opens (`getClusterExpansionZoom`).
  - It has a `focus-ring-map` and a 1.08 lift under the pointer; `muted` steps it back.
- **The engine places it**: `render(h(MapCluster, …), markerEl)`.

### 3. Motion — `mapMotion.ts`

All of it runs over `process` (300ms) on `easing-out`, read off the cascade. **Nothing moves under reduced motion**:
every call resolves at once.

- **Burst.** The parent fades on the spot (`clusterLeave`), and its children fly from it to their places
  (`flyGlyphs`, ghosts over the map while the product hides the real symbols).
- **Gather.** The reverse: `flyGlyphs(…, 'out')` and `clusterArrive`.
- **Only what is on screen flies.** A flight with neither end inside the map is dropped. A gathering from the
  regional view sent some sixty ghosts converging and blurred the picture.
- **Glyph ↔ shape.** A point with a shape is **its glyph or its shape, never both**.
  - Each parcel swaps when its short side reaches 40px on screen (`legibleZoom`), never before the end of the
    clusters (`minZoom`).
  - What leaves fades over the first 60 % while closing to 0.6. What arrives comes over the last 60 %.
  - Several swaps can run at once. `createMapRelay` holds them and gives their weights each frame (`active()`), so
    the engine's expressions can be built from them.
- **The Mapbox trap.** An expression on `['zoom']` mixed with data (`step` / `interpolate` over a `get`) is
  evaluated **at the tile's whole zoom**, not the camera's. The hand-over is driven from JS at the quarter zoom
  (`quarterZoom`), never by an expression.

### 4. Cursor and hover bubble

- **`MapCanvas overObject`.**
  - The arrow is the default on the map (Mapbox puts its open hand everywhere).
  - The pointing hand shows only while the product says the pointer is over something clickable.
  - The closed hand shows while dragging.
  - These are rules on Mapbox's and MapLibre's canvas containers. Never set a cursor inline on the canvas: it would
    stand in front of the drag's.
- **`MapHoverCard at` / `MapTooltip at`.** Given the pointer in the map's pixels (`event.point`), the bubble places
  itself:
  - `spacing-xl` to the pointer's right, centred on it vertically, over the map;
  - **to the left** when the right would run past the map's edge and the left has room, measured off the rendered box.
  - The hover card still takes no pointer. The tooltip keeps its (it has a close). Without `at`, nothing changes.

## Measured (Storybook)

| What | Value |
|---|---|
| Image sizes, rasterised at 2× | glyph 40 = 80 × 80; chosen 56 = 168 × 168 (its 84 box); control 24 = 48 × 48 |
| `loadMapGlyphs` called twice | no duplicate images |
| Pictogram ink | white on `success-800`, ink on the other four steps |
| Cluster steps | 44 / 56 / 68 and 36 / 44 / 52 |
| Cluster names | « 5 points du projet » … « 120 points de contrôle » |
| Burst | 300ms, the ghosts from the cluster to their places at 0.3 → 1, the parent 0.9 → 0 |
| Gather | the reverse |
| Relay | glyph gone by 99ms (scale 0.6), shape from 66ms to 1 at 299ms |
| Cursor | `default` on the ground, `pointer` over a point, `grabbing` while dragging (with Mapbox's own `grab` rules loaded) |
| Bubble at a point at x 140 | 156–323 (16px right), centred on the pointer's y |
| Bubble at x 860, near the right edge | 658–844 (flipped, 16px left) |

## For the product to remove once installed

- `utils/arr-cockpit-glyphs.ts` and its copied paths.
- The `.arr-cluster*` / `.arr-ghost*` styles and the local motion in `arr/cockpit-map.vue`.
- The cursor and bubble-position rules in `arr/map`, `arr/cockpit-map` and `dmrv/monitoring-map`.
