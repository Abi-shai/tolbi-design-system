# ADR-0202 — The band of 14 September, compact

**Status**: accepted (the owner, 17 Nov. 2026 — variant N2). This reverses ADR-0048's ramp and replaces ADR-0031's
capsule layout. The band's role and its motion (ADR-0032) are kept.

## Context

Over its versions, the home page's dark band (`ModuleBanner motion="marquee"` + `ModuleCapsule`) lost what made it
fine:
- it went green-grey (`gray-forest`, the app's dark mode);
- the capsule became lighter than the band (ADR-0048's rising ramp);
- the tile took the row's whole height (74px);
- the text grew.

The owner compared the current band on the real page with a rebuild of the band of **14 September** (product commit
`9ea5b391`, before the package) and four variants. He retained **N2**: that band, more compact, on the package's
tokens.

## Decision

### Colour: neutral greys, dark on any page

| Part | Value |
|---|---|
| Band | `gray-light-800` (#182230) |
| Capsule | `gray-light-900` (#101828), **darker than the band**, hollowed into it |
| Tile | `gray-light-800` |
| Rules | `gray-light-700` |
| Strong ink | `gray-light-100` (#f2f4f7, the step nearest the drawing's #f5f5f6) |
| Secondary ink | `gray-light-400` (#98a2b3) |
| Spread | lead part `success-500`, other parts `success-800`, rest `gray-light-700` |

- **The band does not follow the theme.** It is dark on the light home page, so these values are its own, not the
  app's dark mode. They are primitives under ADR-0010's categorical clause, with named suppressions, as `MapPin`'s
  inks are.
- **No `gray-forest` anywhere in the band.**
- Both components carry **`data-theme="dark"`**, so what they render (the status `Badge`) takes its dark tones. Its
  greens and oranges measure 6.43 / 7.56:1 on the capsule.

### Geometry: compact

- **The band**:
  - `spacing-sm` above and below, `spacing-lg` at the sides;
  - `spacing-md` between capsules;
  - `radius-surface`.
- **The capsule**:
  - padding `spacing-sm spacing-lg`, `radius-control`;
  - `spacing-lg` between its zones;
  - height from its content: **60px** (the figure's 28px line and its context line).
- **The tile** is a **40px** chip at `radius-control`, with the module's illustration at **28px**. It no longer takes
  the row's height.
- **Rules** are **40px** high, not the row's height. There is one, after the identity.
- **Identity**: **170px, fixed**, so two capsules of one module are one width and the marquee's loop never jumps.
  - The module's name in `label-md`, secondary.
  - The row's name in `label-lg-strong`, on one line with an ellipsis.

### Content

- **How much**:
  - the figure in `heading-lg`, with tabular figures;
  - the unit just after it in `label-md`, on the same baseline;
  - under them **one** line of context in `body-sm`, and only when it says something the figure does not.
- **Made of what** (Scan, Source):
  - an 8px bar of rounded parts, 2px apart, the lead part a bright green and the others a dark green, the rest grey;
  - its legend in `label-md` (« Arachide 58 % · Mil 27 % »).
  - The bar is **8.5rem on every capsule**: a scale is read against one ruler.
- **Where it stands**: the status badge (small, outlined by default) over the date or the freshness. Without a
  status, the date alone.

### The props of the first form still work

The product passes its capsules unchanged, so the old props are read into the new form:

| Old prop | Becomes |
|---|---|
| `signals` that are **shares** (every label ends in « N % ») | the **spread**: « Arachide 58 % · Mil 27 % » |
| other `signals` | the **context line**, joined by « · » |
| `progress` | a spread of **one part** (its share, the rest grey), legend « {label} {value} % » |
| `delta` | the context line, when nothing else gives one |

**New props** say it directly: `context` (the one line) and `spread` (`{ label, value }[]`).

**No longer drawn**, deprecated: `valueBadge` (for Data it repeated the « 298 validés » signal), `attribute`, the
delta's glyph, `unitPlacement` and `unitStyle`.

### Typography

The package's smallest role is 14px (ADR-0144); the band of 14 September went down to 11–12px (Inter). It stays at
14px. The gap is accepted.

### What stays

The marquee (pause under the pointer, drag), the entrance (`RevealTransition`) and the accessibility (`article`
named by its title, the band a named `group`) are unchanged.

## Measured (`Données/ModuleBanner`, the product's ID, Scan, Data, Source and Scan)

| What | Value |
|---|---|
| Band | 72 high, `rgb(24, 34, 48)`, padding 6 12, radius 12 |
| Capsules | 60 high, `rgb(16, 24, 40)` |
| Tile | 40 × 40, `rgb(24, 34, 48)` |
| Identity | 170 wide |
| Rule | 1 × 40, `rgb(52, 64, 84)` |
| ID | context « 2 316 parcelles · 4 120 ha », the date alone |
| Scan | spread « Arachide 58 % · Mil 27 % », « Terminé » over « 2026 » |
| Data | context « 298 validés · 44 en attente » |
| Source | context « 18 agents · 6 étapes », spread « Traçabilité 46 % » |
| Contrast on the capsule | strong 16.11:1, secondary 6.89:1 |

## Still open

Yield, Carbone and INA are still hand-made markup in the product (`section-project-metric.vue`). The package has no
climate glyph, no progress without a bar and no INA module. Until `ModuleCapsule` carries them, they keep the old
rendering.
