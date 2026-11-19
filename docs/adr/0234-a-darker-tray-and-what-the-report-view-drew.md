# ADR-0234 — A darker tray, a smaller door, and what the « Rapporter » view drew alone

**Status**: accepted (the product's feedback of 19 Nov. 2026, afternoon: the home page's trays and credits door, and the
GIS project's third view, « Rapporter »). Amends ADR-0198/0199 (the tray's ground and hover), ADR-0231 (the door's
scale, `MetricValue xl`, `metric-2xl`, `TrayGrid`'s fade) and ADR-0079 (the foot's fade).

## Context

Everything on the two screens was built from the package; what follows had stayed local in etolbi, as overrides:

- a `.ds-tray { background: bg-neutral }` on the home page, and the same grey on the report view's two blocks;
- a door whose coins and figure dominated it;
- the report view's two blocks, redrawn by hand: open at the bottom, a badge beside the title, a foot copied from
  `Dialog` whose fade had to be rewritten (it was hard-coded to white);
- `report-tile.vue` (a file chosen by its picture) and `report-thumbs.vue` (a column of page thumbnails).

## Decision

### 1. `Tray` takes `bg-neutral`

Compared side by side (grey 50, 100, 150, 175, 200) on the home page and on a full-page view, the tray at grey 50
(`bg-neutral-subtle`) hardly separates from the white page, and the white surfaces it holds do not stand out. The
product chose grey 100, **`bg-neutral`**, everywhere. Grey 150 was explored and not kept; the package has no ground
between 100 and 200, which is the next place to look if the contrast is still short.

**The hover moves one step up.** `--on-tray-hover` was `bg-neutral-subtle-hover`, which *is* grey 100: on the new
ground a hovered row read as a hole through the white surface. It is now **`bg-neutral-hover`**, minted under the state
clause (ADR-0009): grey-light 200, gray-forest 600 in dark. The plates that light with their row (ADR-0207 —
`ProjectList`'s picture, `ModulesList`'s plate, `ActionListItem`'s plate) read the same variable on hover, so the row
still lights in one tone. At rest they keep `bg-neutral-subtle`: ADR-0207 chose the softest grey so the eye goes to the
drawings.

**The door keeps its grey.** On the yellow, the tray was drawn at `bg-neutral-subtle`, and the product excluded it from
its override. `Door`'s aside hands down `--on-door-tray-ground`, which `Tray` reads before `bg-neutral`; a tray's
surface resets it, so a tray inside a tray does not inherit it.

### 2. The door, smaller

The coins and the figure dominated the block. Track 3 of four: `CreditCoins trim` at **64** (was 128),
**`MetricValue lg`** (was `xl`), **`Button md`** (was `lg`). The statement narrows to 217px, so at the home page's
47.25rem the aside has 475px and `TrayGrid` runs on **two columns**: four modules showing.

**`MetricValue xl` and `metric-2xl` are deleted.** They were minted this morning for this door alone (ADR-0231), and
the product went the other way the same afternoon. A role and a size nobody uses is the `blur-*` ramp again
(ADR-0015). `caption` and `loading` stay: the door's figure uses `loading`. The primitives `font-size.48` and
`line-height.56` go with the role.

**`TrayGrid`'s fade goes back to 24px.** With two rows in the door's 111px, ADR-0231's 64px fade washed out the whole
second row (52px): four modules showing, two of them greyed, which is not « none cut ». At 24px the four read whole and
the edge still says there is more. `fade="long"` stays in `Scrollbar` for the tray's foot (§5).

`Door` now documents this scale for its `#lead`: an illustration at 64, the figure in `MetricValue lg`, the action a
`Button md`.

### 3. `Tray bleed="bottom"`

A block that runs to the page's lower edge, as the report view's two blocks do and the home page's main surface does.

- The tray has **top corners only** (`radius-surface-lg … 0 0`), no hairline and no padding at the bottom, and takes
  the height it is given (`height: 100%`).
- The white surface is **open at the bottom** too (top corners only, no bottom padding) and takes what the head leaves.
- What it holds scrolls under the edge: with a `#footer` the tray scrolls it (§5); without one, the content scrolls
  itself (the document's pages and sheet each do).

One value, `bottom`. No other edge has been asked for.

### 4. `Tray badge` + `badgeTone`

A `Badge sm` after the title, `spacing-sm` apart, like `TrayCell`'s: a count (« Fichiers » · 19) or a state
(« Rapport de suivi 2026 » · Prêt). The title gives first; the badge keeps its width.

### 5. `Tray #footer`, and a fade that reads its surface

`#footer` is `Dialog`'s side foot, on the white surface:

- an inset hairline (`border-subtle`, `spacing-md` from the surface's edges, its pixel added above);
- the action under it, **full width**, `spacing-lg` above and below.

With a foot the surface becomes a column. The content scrolls in the package's `Scrollbar` (`fade="long"`: 64px at the
end, while there is more below), and the foot stays.

**The fade reads a surface variable, `--surface-ground`.** `Dialog`'s foot fade was written toward `bg-default`; on a
grey it drew a white band, and the product rewrote it toward the colour under it. Now:

- `Tray` sets `--surface-ground` on its ground (`bg-neutral`, or the door's grey) and on its surface (`bg-default`);
- `Dialog`'s surface sets it (`bg-default`), so a dialog inside a tray does not inherit the grey;
- `Dialog`'s side foot fade and `Scrollbar`'s painted fades (`--fade-color`) read it, falling back on `bg-default`;
- `ModulesList`'s drawer sets it on its own white scroller, since it sits on a tray without a surface.

**`MapPanel` has nothing to read**: its body fades through a mask (ADR-0173), and nothing is painted over glass.

### 6. `FileTile`: a file chosen by its picture

The tile has three parts:

- **The picture** is the product's (`#picture`, or `src`). The package draws the frame, which is the basemap
  thumbnail's (ADR-0221): 16 / 10, a `border-subtle` hairline, `radius-inner`, `bg-default`, `elevation-control`.
  Without a picture, the format's glyph sits on `ModulesList`'s plate (`bg-brand-subtlest`, `text-brand`).
- **The name** is in `label-md`, two lines at most.
- **The format** is a 16px glyph and « Tableau · CSV », in `body-sm` / `text-subtle`.

**The whole tile chooses** (`select`) the file shown beside it. It is `aria-current="true"`, one of a set, not a toggle.

**Downloading** is an `IconButton xs surface` at the picture's top end. A white disc on a picture is ADR-0187's shape;
the product had dressed a `ghost` as one.

- It shows on hover, on keyboard focus inside the tile (`:focus-visible`, not a click's focus), and always where nothing
  hovers (ADR-0111). It stays in the tab order.
- It is named by `downloadLabel` and described by the file's name (ADR-0126), so the label never has to place the
  name in a sentence.
- `:downloadable="false"` removes it.

**The active file** takes the basemap picker's chosen state:

- the tile on `bg-brand-subtle`, `elevation-raised`;
- the picture ringed (`border-brand-solid` + `0 0 0 1px` + `focus-ring-brand` + `elevation-control`);
- the name in `label-md-strong`, the name and the format in `text-on-brand-subtle`.

**Hover** takes `--on-tray-hover`, and the hairline steps to `border-default`.

The thumbnail (`report-preview.vue`) stays with the product. A separate component, not an `OptionCard` variant:
`OptionCard`'s media is a 40px tile at the start of a row, and this is a picture above its words.

### 7. `PageThumbs`: a document's pages

A column of thumbnails, one per page, `v-model` from 1. Each page is a button in a frame: its thumbnail (`#page`, the
product's, 88px wide at the page's `ratio`, A4 by default, in the same frame as above) over its number (`label-md`,
tabular).

**The page on screen** takes the active file's treatment: `bg-brand-subtle` wraps the thumbnail and its number, the
thumbnail is ringed, and the number is `label-md-strong` / `text-on-brand-subtle`. It is `aria-current="page"`, and the
column keeps it in view as the reader scrolls the sheet. Hover takes the tray's hover.

The column scrolls in `Scrollbar` and takes the height it is given. It is a `<nav>` named « Pages ».

It is not part of `Report` (ADR-0089). `Report` prints; this navigates on screen, and the product's document is not a
`Report` yet. A column of pages serves any paged document.

### Noted, no change

- `MapTopBar` takes three views without trouble; « Rapporter » takes `folder-open`.
- There is no `file-json` in the icon set; the product uses `braces`, and the stories do too.

## Measured

At 1 280px, Storybook, Chromium.

**The door** at 47.25rem (the home page at 1 440):

| What | Value |
|---|---|
| Statement | 217 wide |
| Aside | 475 wide |
| Cells | two columns of 225 × 52; the list's window 111 high |
| Modules | four whole; the rest below the edge |
| Tray inside the door | `rgb(249, 250, 251)` (grey 50, kept) |

At 60rem, still two columns (327).

**The « Rapporter » story**, 40rem high:

| What | Value |
|---|---|
| Trays | 448 and 784 wide, to the bottom edge, corners `16px 16px 0 0`, no bottom border or padding |
| Tray ground | `rgb(242, 244, 247)` (grey 100) |
| Files' foot | 430 × 67 |
| Files' end fade | toward `rgb(255, 255, 255)` (the surface) |
| `FileTile` | 204 × 180; picture 192 × 120 (16 / 10) |
| `PageThumbs` item | 100 × 158 |

Plays: a tile chooses and moves `aria-current`, a download emits with its file, and a page thumbnail goes to its page.
The tray's badge, region, foot and pages are all present.

## Consequences

In etolbi, the local overrides fall away:

- `dashboard.vue`'s `.ds-tray` rule;
- the report view's block grey and `--report-files-well`;
- `report-head.vue`, which becomes `Tray title` + `badge` + `#action`;
- `report-files.vue`'s redrawn foot, which becomes `#footer`, with `bleed="bottom"` for both blocks;
- `report-tile.vue`, which becomes `FileTile` with its preview in `#picture`;
- `report-thumbs.vue`, which becomes `PageThumbs` with its iframe in `#page`.

The door passes `CreditCoins :size="64" trim`, `MetricValue size="lg"` and `Button size="md"`, as it already does.

**Breaking:** `MetricValue size="xl"` and the `metric-2xl` role are gone. No screen used them.
