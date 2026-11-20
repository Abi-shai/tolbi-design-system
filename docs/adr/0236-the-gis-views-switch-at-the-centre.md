# ADR-0236 — The GIS views switch, at the centre of the bar

**Status**: accepted (the product's brief of 20 Nov. 2026, explored all day in etolbi). Replaces the 18 Nov. brief (track
V1) and keeps its corners. Amends ADR-0216 (the switch and the bar's glass) and ADR-0084 (`ButtonGroup` gains a size).

## Context

`MapTopBar`'s view switch tells the user the SIG has three modes: Explorer, Analyser, Rapporter. The owner wants it to
weigh in the bar's hierarchy. etolbi replaced the `ButtonGroup` through `#center` with a local component
(`gis-view-switch.vue`, its glyphs in `gis-view-icons.ts`). The product also forced the bar's height
(`:root:has(.view-switch--*)`) and its glass (`.gis-bar--72`) from `app.vue`.

## Decision

### 1. `ViewGlyph` — the three modes' glyphs, a package set

- **Source**: Fluent UI System Icons, the « Color » set (Microsoft, MIT) — `globe`, `data-bar-vertical-ascending` and
  `document-text`, at 24. The paths are kept as the set ships them; nothing is drawn.
- **Recoloured with one rule for the family** (« one must not feel a difference »):
  - every shape takes the **same gradient in the same frame**, (3, 2) → (21, 22) of the 24 box, `userSpaceOnUse`,
    light to dark;
  - the details (meridians, the folded corner, the document's lines) are a flat **pale**;
  - an effect only one icon carried is dropped (Fluent's shadow under the document).
- **Tones**:
  - lit (the view shown): `brand-100 / 300 / 600`;
  - at rest: `gray-light-300 / 400 / 500`, set back but not disabled.
  - The inks are the glyph's own: categorical primitives with named suppressions (ADR-0010). They do not follow the
    theme.
- **The tone travels**: `stop-color` and the pale `fill` over `moderate`, `easing-in-out`, with the switch's indicator.
- **The charter forbids gradients.** This style is kept knowingly: an exception, recorded here, for these three glyphs.
- **The moving piece is exposed**: the meridians, the three bars with their rank (`--view-glyph-step`) and the lines.
  `arrived` plays it:
  - the glyph settles, 80 % → 100 % over `enter` on `easing-out`;
  - the meridians turn, −30° → 0 over `considered`;
  - the bars rise one after another, `scaleY` 0.2 → 1 over `process`, `instant` (50ms) apart;
  - the lines write themselves, `scaleX` 0 → 1 over `process`, 50ms late.
  - Nothing plays under reduced motion.

Its API is `view: 'map' | 'analytics' | 'report'`, `active`, `arrived`, and `size` on `Icon`'s ladder. It is decorative.
`MapTopBarView` gains `glyph` beside `icon`.

### 2. `ButtonGroup size="lg"` — the switch is the package's, not a redrawing

The product's switch was a segmented control drawn again. ADR-0001 asks to widen the real one, so `ButtonGroup` gains
**`size="lg"`**, 48px:

- **Segments** of 40: `label-xl` (`label-xl-strong` for the chosen view), a 24px glyph, `spacing-md` / `2xl` / `md` /
  `xl` in.
- **The rail is drawn inside**: an inset edge (`--on-glass-sunk-edge`) in place of the border, so 48 is the declared
  height.
- **The chosen tile** carries its own inset edge (`--on-glass-raised-edge`).
- **Corners are Tabs'**: the rail `radius-surface-sm`, the tile and the segments `radius-inner`. Not a pill, and not the
  panel blocks' 16, which are container corners.
- **The indicator travels over `moderate`** with the glyphs' tones. It does not move on first placement
  (`useSlidingIndicator`).

`ButtonGroupItem` gains an **`#icon` slot** (`{ selected, size }`) in place of `icon`, which is how a `ViewGlyph` gets in.

**States at `lg`**, per ADR-0002 (no bounce, no glow):

- **Hover** on a view at rest: the glass's veil (`--on-glass-hover`, half a surface off glass), the label in
  `text-default`, and the glyph lifted (`translateY(-1px) scale(1.08)` over `quick` on `easing-out`).
- **Press**: the view sinks, `scale(0.97)` at `instant`.
- **Reduced motion**: neither transform.

### 3. In `MapTopBar`

- **The switch** is `ButtonGroup size="lg"`, each view with its `ViewGlyph` (or its `icon`). It replaces the 18 Nov.
  pill.
- **A view just chosen plays its glyph's arrival.** Not on load (the switch is ready one frame after mounting), and not
  on choosing the shown view again (the value does not change).
- **The layers are the map panel's**: the rail is a hollow (`--on-glass-sunk` plus a 4 % `text-strong` inner line), and
  the chosen view a raised tile (`--on-glass-raised`, `elevation-map-selected`, a 6 % inner line). The bar now defines
  `--on-glass-sunk-edge` and `--on-glass-raised-edge`, which only `MapPanel` had.
- **A solid bar** (ADR-0223): the rail takes `bg-neutral` and the tile `bg-default`.
- **The bar's glass is the map controls'**: `bg-map-control` (72 %) under `backdrop-map-control`, in place of the
  reading glass (90 %).
  - Tried: white at 55 % without a shadow, and no ground at all. With no ground, place names mixed with the project's
    name.
  - The rule and `shadow-md` stay as the product rendered them (ADR-0220).
- **The end never runs under the switch.** The end column is `minmax(min-content, 1fr)`: when its controls need more
  than half of what is left, the switch moves aside and the project's name gives. Measured at 1 280px with an action,
  search, basemap, download and share: it overlapped by 38px, and now the switch shifts 50px. At 1 440 the switch is
  centred as before.

### 4. One size, and a public height

- **48 was retained.** 44 (with a 56 bar) and 52 (with a 64 bar) were tried in the product, and 52 was too exposed.
  There is **no `viewsSize` prop**: one that offered the two sizes the product turned down would be the `blur-*` ramp
  again (ADR-0015).
- **The row is 3.75rem with or without views.** A bar whose height changed between projects would be ADR-0042's defect.
- **The height is public**: `--ds-map-top-bar-height` (3.75rem, on `:root`). What starts under the bar reads it — the
  map's overlay top, `calc(var(--ds-map-top-bar-height) + var(--ds-spacing-lg))`, and a view laid under the bar.

## Measured

At 1 440 × 760 in Storybook, on « Sur la carte »:

| What | Value |
|---|---|
| Bar | 1440 × 60 |
| Switch | 464 × 48 at (488, 6), radius 10 |
| Segments | 142 / 147 / 159 × 40 (the chosen one at weight 600) |
| Indicator | 142 × 40 at 4px in |
| Glass | ground `rgba(255, 255, 255, 0.72)`, backdrop `blur(24px) saturate(1.6) brightness(1.12)`, rail ink 4 % |
| Solid | ground white, no backdrop, rail `rgb(242, 244, 247)` |

The chosen view's heavier weight changes its own width by 2px. The switch's total width stays 448 + insets, so the
group does not move.

A quarter-speed film shows the indicator travelling with the tones, then each glyph's arrival; choosing the shown view
again plays nothing.

Plays: the 18 `ButtonGroup`, `MapTopBar` and `ViewGlyph` stories pass, including a check that the view just chosen
carries its arrival.

## Consequences

In etolbi:

- `gis-view-switch.vue` and `gis-view-icons.ts` are deleted. The views go to `MapTopBar` with
  `glyph: 'map' | 'analytics' | 'report'`, and `#center` is no longer filled.
- In `app.vue`, the forced height (`:root:has(.view-switch--*)`) goes and `--gis-bar-height` becomes
  `--ds-map-top-bar-height`. The `.gis-bar--72` glass goes, and so do the 18 Nov. `.ds-button-group--pill` rules,
  already inert.

`ButtonGroup` with `shape="pill"` stays for whoever uses it; `MapTopBar` no longer does.

## Amended (20 Nov., the owner's answer)

**`viewsSize` after all** (`sm | md | lg`, default `md`). It sets the switch and the row together, and
`--ds-map-top-bar-height` follows on `:root` (`:has()` on the bar's size class):

| `viewsSize` | Switch | Row | Notes |
|---|---|---|---|
| `sm` | 44 (`ButtonGroup lg-compact`) | 3.5rem | segments 36, `spacing-sm` / `xl` / `sm` / `lg` in |
| `md` | 48 (`ButtonGroup lg`) | 3.75rem | retained |
| `lg` | 52 (`ButtonGroup xl`) | 4rem | segments 44, a 28px glyph, **`label-2xl` / `label-2xl-strong`** |

`label-2xl` and `label-2xl-strong` are minted (20/28, medium / semibold, web and mobile): « heading-lg's size at a
label's weight », which the role-completeness rule allows no other way to write (ADR-0011).

§4's « no prop » is reversed: the owner keeps the way back to 44 or 52 open. The row still does not depend on whether
there are views.

**No shadow under the bar.** On the map controls' glass the `border-inset` rule is the only edge: the map shows through,
and the bar reads as one of the map's controls rather than a layer over them. This amends ADR-0220, and §3's « the rule
and `shadow-md` stay » is reversed. The solid bar was already without one.

Measured at 1 440: bars of 56 / 60 / 64, switches 440 × 44 / 464 × 48 / 503 × 52, chosen segments 36 / 40 / 44, glyph
24 / 24 / 28, label 18 / 18 / 20px, and the bar's shadow the inset rule alone.
