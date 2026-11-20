# ADR-0235 — File glyphs, a name that leads, and a document's handoff

**Status**: accepted (the product's feedback of 20 Nov. 2026 on the « Rapporter » view, after explorations with the
owner — reference: Obvious's file cards). Amends ADR-0234 (`FileTile`) and ADR-0216 (`SwapTransition rise`'s exit).

## Context

etolbi redrew the report's file list locally (`report-file-card.vue`, `report-file-glyph.vue`) and wrapped its viewer in
two hand-placed `SwapTransition`s (`report-view.vue`). The owner asked for a handoff « plus smooth » that has a meaning
in the system.

## Decision

### 1. `FileTile layout="header"`: the name leads

The tile gets a second layout: the format's glyph (20) and the name on **one line**, cut by an ellipsis; the picture
comes under them. Nothing sits under the picture. The format text repeated the glyph, and a modified date was tried and
withdrawn.

- **The glyph** comes from `glyph` (a `FileGlyphFormat`, drawn by `FileGlyph` at 20) or from the `#glyph` slot (an
  issuer's mark at the same size, `object-fit: contain`).
- **The picture's ground is `bg-default`** whatever the file. There is no plate fallback in this layout: no
  `bg-brand-subtlest` for outlines, no grey.
- **The download** still sits on the picture's top end, 6px in, placed below the head's line (`--file-tile-head`,
  20 + `spacing-sm`).

Everything else is the tile's: no frame, the hover, the active state, and the download shown on hover, on keyboard focus,
and always without hover. `layout="picture"` (ADR-0234) is unchanged and stays the default.

**The active state arrives at `instant`** (it was `quick`): the tile answers the press before the viewer starts its
handoff — « the interface responds before the gesture ends ». Leaving the active state keeps `quick`.

### 2. `FileGlyph`: the formats' known colours, not drawn here

- **The boxes are Material Design Icons'** (mdi, Apache 2.0), chosen after three benchmarks (monochrome glyphs,
  coloured illustrations, constructions): `file-pdf-box`, `file-word-box`, `file-excel-box`, `code-json`,
  `file-document`. Their paths are kept as the set ships them.
- **The colours are the formats' known ones**, « patterns not to abandon »: PDF `error-600`, Word `display-blue-700`,
  a spreadsheet `success-600`, JSON's braces `display-orange-500`. They are **categorical** (« PDF is red »), so they
  alias primitives straight under ADR-0010, with named suppressions, and do not follow the theme.
- **The letters are white in both modes.** mdi cuts the letter out of the fill, so on a dark page the page would show
  through it. A white ground sits under the cut-out (`base-white`, a named suppression).
- **Geospatial files**, construction C: the same box with the format **written** in it, as mdi writes « PDF » —
  `GEO` (outlines) and `PTS` (points) in `brand-500`, `KML` in `display-blue-light-700`. The text is Poppins (the family
  token), weight 600 as an SVG attribute (no Bold, ADR-0003), 6.4 units on the 24 grid.
  - Declined on the way: monochrome glyphs (polygon, pin, globe), tinted emoji, fills without a box.
  - There is no blue-green primitive (`display-teal`), so outlines took the brand's green.
- **`file`** is any other document: mdi's sheet, in `text-subtle`.
- **Its size is on `Icon`'s ladder** (16 / 20 / 24 / 32). It is decorative: the name says what the file is.

**An issuer's document takes its mark** in place of its format: a Verra project description carries the VCS logo. That
is the job of the slot where the glyph sits (`FileTile #glyph`). `FileGlyph` draws formats only, and the package ships
no third-party logo.

### 3. The handoff from one document to another — `FileViewer`, and `SwapTransition rise`

ADR-0002's rules, applied to a viewer that shows one thing at a time:

- **A handoff, not a move.** The files are a grid with no order. A sideways slide (`in-out`, « spatial ») would say
  « next / previous », which is false. The new document arrives with a fade and 8px of rise over `enter` on
  `easing-out`. The old one only fades, over **`exit` on `easing-in`**: the exit is shorter than the entrance
  (ADR-0021), and nothing bounces.
- **The tile answers first, the viewer follows** (§1).
- **One handoff per gesture.** A heavy document (the 60-page Word PD, about a second to render) arrives with its frame at
  once. Its content then resolves inside the frame through the plain `SwapTransition` (`loading` → content): a state, not
  a second rise.
- **What changes size does not animate.** The column of pages fades over `quick`. The sheet takes its width back with no
  layout transition. A column on its way **in** waits for the document it belongs to: it appears at the arriver's
  `before-enter`, never under the leaver, which it would narrow mid-fade.
- **Choosing the shown file again replays nothing**: the handoff is keyed by `documentKey`.
- **Reduced motion**: `motion.css`'s global override is enough.

**`SwapTransition rise` is now that handoff** wherever one thing is shown at a time: a viewer changing document, a
parcel's sheet changing parcel, a window changing tab, the map giving way to its analytics (ADR-0216). Its exit moves
from `quick` / `easing-out` to `exit` / `easing-in`. The duration is the same (100ms) and the curve is ADR-0021's.

**`FileViewer`** carries it, so the product stops wrapping by hand:

- `documentKey` keys the handoff;
- `pages` shows `PageThumbs` for a paginated document (`#page` is its thumbnail, `v-model:page` from 1);
- `loading` shows `#loading` in the document's frame (a `Skeleton` by default);
- the document is the default slot, and the viewer takes the height it is given.

## Measured

At 1 280px in the Storybook story, with the duration tokens set to their own values and sampled every animation frame:

| Gesture | What happens |
|---|---|
| Report → table | Leaver fades 1 → 0 over ~100ms, the column fading with it. The stage widens 670 → 782 at the frame where both are at 0. The arriver comes in from 8px / 0 to 0 / 1 over 200ms. |
| Table → report | Leaver fades over 100ms. The column (0 → 1, `quick`) and the stage narrowing (782 → 670) come with the arriver's first frame (opacity 0). |
| The same file again | Nothing moves. |

Two documents are never visible in the same frame (`out-in`).

**`FileTile` in its header layout**: picture 32px under the tile's top, the download 6 / 6 inside the picture's corner,
the picture's ground `rgb(255, 255, 255)`.

`FileGlyph`'s eight formats were checked at the four sizes, on light and on dark: the letters stay white.

Plays: a header tile chooses; the viewer drops the pages for a table and brings them back with the report.

## Consequences

In etolbi:

- `report-file-card.vue` becomes `FileTile layout="header"` with its preview in `#picture`, and the VCS mark in
  `#glyph`;
- `report-file-glyph.vue` becomes `FileGlyph` (`report` → `pdf`, `table` → `csv`, `code` → `json`, `shapes` → `geo`,
  `points` → `points`, `kml` → `kml`, `doc` → `file`);
- the two `SwapTransition`s in `report-view.vue` become `FileViewer`.
