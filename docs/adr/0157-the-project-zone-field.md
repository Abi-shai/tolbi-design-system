# ADR-0157 — The project's zone is a field: `ZoneField`

**Status**: accepted (etolbi, decided 11 Nov. 2026; inventory Figma `4134:1427`)

## Context

Nine creation panels choose the zone a project covers: Yield, dMRV, Crop, Crop View, EUDR, Conformité, ARR ×2 and
Data OS. They draw the block by hand from two product components. Once filled, the block shows only a `Tag` naming
the method (« Producteurs sélectionnés »). It shows neither what was chosen nor how large it is.

The product decided on 11 Nov. that the block becomes one field of the package. Once filled, it shows the result (the
area) and the method. The window that chooses the zone (methods, map, file…) stays the product's for now: the field
only says « I want to define / change it ».

## Decision

**`ZoneField`** — the name the product proposed, kept. It sits beside `InputField`, `PhoneField`, `DatePicker`: a
value given to a form.

**One shell in every state**: `Card sunk`, padding `md`, the title (`label-lg-strong`, « Zone du projet ») and the
sentence (`body-md`, `text-subtle`). Title → sentence is 4px (FormSection's, ADR-0094), sentence → what changes 12px.
Only the element under them changes:

| State | The element | Emits |
|---|---|---|
| Empty | `Button secondary-gray sm`, `map`, « Définir la zone » | `define` |
| Filled | a row on `bg-brand-subtle`, `radius-control`, no border (see below) | `edit`, `remove` |
| Area pending (`area: 'pending'`) | a placeholder in the area's line box, the rest unchanged | |
| Area unknown (`area: null`) | « Surface inconnue », `body-md`, `text-subtle`, not bold | |
| `readonly` | the row without its two actions: a project being edited, a baseline launched from a zone | |
| Error | in a `FormField` with `error`, the card takes a control's border in `border-error-solid` and keeps its sunk ground; the message is FormField's, under the block | |
| Disabled | as every field: the buttons off, the row's ink `text-disabled`, the drawing at 0.4 (`OptionCard muted`) | |

The filled row reads left to right:

- the zone's drawing: `ProjectGlyph` at 40, with the product's `kind`, `count`, `seed` (and optional `status`);
- the area, `label-lg-strong` — the result;
- the method, `body-sm`, `text-subtle` — words, no figure;
- « Modifier la zone » (`square-pen`) and « Retirer la zone » (`x`): `IconButton ghost sm`, each with its anchored
  `Tooltip`.

**`method` decides that the field is filled** (presence decides, ADR-0028). There is no `filled` prop beside it that
could contradict it. `area` is independent: a filled field may have its area still pending, or unknown.

**One row height whatever the drawing.** The glyph sits in a 52px slot, the box a pile of three parcels takes
(ADR-0148). A drawn parcel (`count: 1`) and a producer's three stand on the same 68px row.

**The area is the component's to write**, from `locale`, never abbreviated:

- one decimal under 10 ha (« 0,4 ha »), whole hectares above (« 412 ha »);
- the locale's thousands separator (« 12 480 ha », « 1 248 300 ha »);
- `Intl`'s own `hectare` unit, so the space before « ha » is the locale's and the figure never breaks from its unit.

The decimal is shown only when it carries something: 5 ha is « 5 ha », not « 5,0 ha ». 9.96 rounds to « 10 ha ».

**A placeholder on a tint needed a skeleton that reads there.** On `bg-brand-subtle`, `Skeleton`'s neutral greys
measure 1.06:1 (default) and 1.02:1 (strong): the mock's « barely visible ». `Skeleton` gains
**`surface: 'neutral' | 'tinted'`**. Tinted, the bar is a veil of `text-strong` — 10 % / 4 %, strong 14 % / 6 % —
which stacks on any tint in either mode, ADR-0111's idea. It is a ground axis, not a weight: `emphasis` keeps meaning
the weight of what is coming. Strong, it measures **1.33:1** in light and **1.45:1** in dark.

**The row's inks stay the neutral pair the product drew**, and they hold on the tint:

| | Light | Dark |
|---|---|---|
| `text-strong` | 15.24:1 | 11.00:1 |
| `text-subtle` | 6.60:1 | 6.48:1 |

**The actions take the row actions' veil.** A ghost's `bg-hover` on the tint is the tint again; the veil measures
1.15:1 in light and 1.20:1 in dark (ADR-0111).

**Remove asks nothing**:

- `remove` is emitted at once. The product empties the field and shows a neutral `Toast` « Zone retirée » with
  « Annuler ». Nothing is confirmed in the component.
- The pressed button leaves with the row. Once the product has emptied the field, **the focus goes to « Définir la
  zone »**, where the next move is, not to the page's body.

**Read as one sentence.** The block is a `group` named by its title and described by its sentence, plus FormField's
message when there is one. It takes FormField's id, so the wrapper's wiring holds. The row reads « Zone du projet :
412 ha, Mes producteurs », through two visually hidden joints. While the area is pending, the row is `aria-busy` and
reads « Surface en calcul » (`pendingAreaLabel`) in the placeholder's place.

## Measured

`Saisie/ZoneField`, light and dark:

- **Shell**: the card is 420 wide, 160 high empty and 190 high filled; the row is 68 in every filled state.
- **Area**: written « 412 ha », « 0,4 ha », « 12 480 ha », « 1 248 300 ha », « 10 ha » (from 9.96).
- **Error border**: `rgb(217, 45, 32)` in both modes.
- **`play` « Parcours »**: define → « 412 ha » after the computation; the group reads « Zone du projet : 412 ha, Mes
  producteurs »; remove → the focus on « Définir la zone »; « Annuler » in the toast puts the zone back.

## Still open

- The choosing window (methods, map, file, administrative zone, check) is still the product's.
- The component is tagged `wip` until the nine panels use it.
