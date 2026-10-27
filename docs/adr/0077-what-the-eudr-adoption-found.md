# ADR-0077 — What the EUDR adoption found

**Date:** 2026-10-26
**Amends:** ADR-0024 (where the segmented control's ground lives)
**Extends:** ADR-0039 (a defect that passes every check we own), ADR-0073 (what an integration finds)
**Source:** etolbi's adoption of 0.59.1 in the EUDR module — inventory in Figma « EUDR UI Update »,
section 3 (`3145:17812`), the four cards « Vus en adoptant » and the two notes beside them.
**Status:** Accepted

## Context

The product moved the EUDR module onto the package and sent back what was missing (eight components to
create, eight to complete) and what was **wrong** in what it adopted. This ADR answers the second list.
The first is work of its own, a component at a time.

## Decisions

### The segmented control's selection was never painted

`ButtonGroup`'s sliding indicator sits behind its items (`z-index: 0`), and every item painted
`bg-default` over it, so no segment ever showed as chosen — on « Zones | Cartographie » and « 2020 | 2024 »
the product could not tell which one was on. Since ADR-0024 the selection had moved correctly, invisibly.
The items are now **transparent** and the group paints the ground; the indicator lies between the two.

Measured: the chosen segment against its neighbours is **1.045:1** in light and 1.233:1 in dark — it
exists, it does not yet read. The tint is `bg-neutral-subtle`, which hover also uses (`bg-hover` aliases
the same primitive, ADR-0033), so at rest the selection and a passing pointer look the same. That is a
drawing, not a fix, and it is left open below.

### The drop zone speaks the screen's language

`FileDropzone` wrote « Cliquer pour téléverser / ou glisser-déposer » and « Retirer {nom} » in French,
whatever the screen's language. They are props now — `actionLabel`, `dragLabel`, `removeLabel` — with the
French as defaults. The sizes went the same way: `o / Ko / Mo` was hand-written, with a decimal **point**
(`1.9 Mo`, wrong in French too). `locale` (default `fr-FR`) hands them to `Intl.NumberFormat` as units:
`1,9 Mo` in French, `1.9 MB` in English.

### A legend mark carries the avatar's hairline

`ChartLegend`'s colour is the caller's, so it can be the ground's own: the parcel's confirmed
deforestation is white, and its mark vanished on the white legend. Every mark now carries
`--ds-border-inset` as an inset shadow — the token minted for exactly this, *a filled circular shape kept
legible against any background* (ADR-0015). Translucent, so it darkens a light swatch's edge in light,
lightens a dark one's in dark (ADR-0029), and leaves a saturated one as it was; inset, so the mark keeps
its size. The product asked for `border-subtle`: on white the two measure the same, but an opaque ring
would recolour the edge of every saturated mark, which is 6px of colour inside 8.

### `IconButton` is named `ariaLabel`, and that is a spelling rule

vue-tsc reported `ariaLabel` as missing where the product wrote `:aria-label`. Both spellings reach the
prop at runtime — Vue camelizes — but vue-tsc's `htmlAttributes` default is `['aria-*']`: it keeps every
`aria-*` as an HTML attribute and **never** camelizes it, so no declaration matches both spellings — a
kebab-case key only flips which one fails, and every consumer in the catalogue writes `ariaLabel`. The
prop stays required, because a button with no text has nothing else to name it, and the spelling is
written on the prop.

### Second round (27 Oct.) — a hint is more than a string

Item 16: `FormField`'s `hint` was a prop, so a hint with a link (« où le trouver ») or a word in bold could
not be written. It takes a `#hint` slot now, with the prop as its fallback — the catalogue's shape for a
string that sometimes needs markup (`PageHeader`'s `subtitle`, `Table`'s `emptyText`). The slot counts as a
hint: the message renders, and the control is described by it, as with the prop; an error still replaces
it. Phrasing content only — it is read inside the message's `<p>`. Where the hint sits (under the label in
the side panel's drawing, under the control here) is a different question, left with ADR-0079.

### Third round (27 Oct.) — the foot in English, and a click that lost its target

Item 26: `Table` handed its `Pagination` neither `locale` nor the foot's words, so an English list kept
« Précédent · Suivant · Lignes par page · sur ». `Table` takes `locale`, `prevLabel`, `nextLabel`,
`pageSizeLabel` and `ofLabel` and passes **only what was given** — absent, `Pagination`'s French defaults
hold. With `itemLabel` and `emptyText`, everything the table writes is now a prop; `TableColumnMenu`
already was (`label`, `title`, `resetLabel`). Measured: « 1–10 of 1,250 projects », « Rows per page »,
the arrows named « Previous » / « Next ».

Item 23: a `Dialog` closed when a click inside it landed on something that removed itself — a button
that hides on click. The scrim test was « whatever is not the surface », and a target that has just left
the document is not in the surface. The dialog now dismisses on **the scrim itself** (the scrim, or the
dialog's own padding), and only when the press **began** there too — so a selection dragged out of the
surface does not close it either. Measured: the vanishing button and the drag keep it open; the scrim,
Escape, and the scrim of a dialog `within` a region still close it.

### Fourth round (27 Oct.) — the key and the toast a modal kept for itself

The product's notes on 0.63 named what the third round had found from the title alone: item 23 is the
scrim rule above, as proposed.

Item 24: the dialog **stopped** Escape on its `<dialog>`, so a list or a window from another library open
inside it, listening on `window`, never heard the key — the dialog closed instead. ADR-0075 had stopped it
so that the dropdown a question was asked from would not close behind it. Now nothing stops it: whoever
handles it first cancels it. Over the page, the browser turns an Escape nobody cancelled into the dialog's
`cancel`; within a region, where there is no `cancel`, the dialog waits for every listener and closes only
if none took the key. The package's dropdowns already stop their own Escape (ADR-0078); on the document
they now also ignore one already taken, or one coming from a dialog that does not hold them — so the
history list stays open behind its question. Measured: a `window` listener that takes Escape gets it and
the side panel stays; without it, the panel closes; Escape in a package menu inside the panel closes the
menu only; Escape in Tolbi AI's delete question closes the question and leaves the list.

Item 25: a `ToastRegion` is `position: fixed` at `z-overlay`, and a modal `<dialog>` is in the top layer:
an error toast during a side panel was painted under it. The product proposed raising the region into the
top layer as a popover; it would have been seen and still not answered, because a modal dialog makes
everything outside it **inert**. So `Dialog` keeps a stack of the modal dialogs open
(`useModalStack`, internal) and the region moves **into the topmost one** while one is open — a `Teleport`,
disabled when none is, so it stays in the product's tree (its theme included) the rest of the time.
Measured: the toast is the element under its own centre over the panel's scrim, its close dismisses it
with the panel still open, and the region is back in its place once the panel closes.

## Still open

- **The chosen segment's contrast.** Three tracks to draw before one is applied: `Tabs`' pill (a
  recessed track, the selection raised in `bg-default`), ADR-0050's mark (`bg-selected` and its ink), or
  a stronger neutral that hover does not share.
- **`PageHeader`, room beside the title** (item 22) — its text has not reached this record yet.
- **`Tooltip` anchors to nothing.** The product wants it to wrap its trigger, with placement, delay and a
  disabled trigger handled — the catalogue's own consumers each re-implement that with
  `useDelayedTooltip`. An API of its own.
- **A deletion `IconButton`** that turns red under the pointer. A tone, so a drawing first.
