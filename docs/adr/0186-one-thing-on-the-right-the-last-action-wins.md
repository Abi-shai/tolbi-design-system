# ADR-0186 — One thing on the right: the last action wins

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0185, measured in the app on 0.151.

## Decision

### 1. An off tool can be seen as off

**The cursor**
- `Tooltip` makes a disabled trigger transparent to the pointer, so that its tooltip still comes (ADR-0082). The
  pointer was therefore on the tooltip's anchor, and the column's own `auto` cursor showed.
- The anchor now carries `cursor: not-allowed` when it holds a disabled (or `aria-disabled`) control. This is a
  `Tooltip` rule, so it applies across the catalogue.

**The ink**
- Off was `#667085` (`text-disabled`) against `#475467` (`text-subtle`) on: one step apart, which nobody could tell.
- Lighter or translucent would fall under 3:1 on glass. So the gap grows from the **other end**: the column's
  buttons are `IconButton variant="ghost"`, **`text-default` (`#344054`) at rest**.
- Off, a ghost takes the whole `text-disabled`, two steps away.
- Off measures 4.97:1 on white and 2.95:1 on the darkest glass, computed unblurred (ADR-0185).

### 2. One thing at a time on the right — the last action wins

Rechercher, Filtres, the mini-map and the sheet (`MapPanel`) exclude each other. **What opens last wins; the one
before goes out, its button too.** ADR-0185's « hidden, then back by itself » is replaced.

| Action | What happens |
|---|---|
| A tool's card opens | the mini-map is turned off (`minimap-open` → `false`) |
| The mini-map opens | the tool's card closes (`tool` → `null`) |
| A sheet arrives (a point or a polygon selected), or is there on arrival | the mini-map is turned off; it does not come back by itself, its button reopens it |
| A card or the mini-map opens while a sheet is there | the column emits **`claim`** (the value that opened); the product closes its sheet and turns « Informations » off |

The mini-map is hidden while a sheet is still present, as a safety for a product that does not close its sheet on
`claim`.

### 3. The mini-map at the top

Its card aligns with the **first tool's top**, the column's top line, no longer with its own button. A picture of
the whole map is read before the tools. It is measured when it shows and on mount.

## Measured (`Données/Map/Navigator`)

| Step | Mini-map | Card | Mini-map button | Sheet |
|---|---|---|---|---|
| Arrival | top 31 = the first button's top | — | on | — |
| « Rechercher » opened | off | Rechercher | off | — |
| « Rechercher » closed (Escape) | stays off | — | off | — |
| The mini-map pressed | on, top 31 | — | on | — |
| « Filtres » opened | off | Filtres | off | — |
| The mini-map pressed | on | none | on | — |
| « Fiche ouverte » story, arrival | off | — | off | yes |
| The mini-map pressed there | on | — | on | closed through `claim` |

« Informations » with no sheet: the cursor under the pointer is `not-allowed`, its glyph `#667085` against
`#344054` for the tools on.
