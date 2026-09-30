# ADR-0046 — The second level is a panel, and the rail never folds

**Date:** 2026-09-30
**Extends:** ADR-0034 (the rail is the same component), ADR-0024 (selection that moves), ADR-0037
and ADR-0045 (the collapse travels, the column owns the easing), ADR-0042 (the current item is
derived, never declared twice)
**Reverses:** ADR-0034's *"two-tier … is not a collapse at all. It was ruled out on that basis"*.
It is still not a collapse. It is what the rail is *for*.
**Source:** Sprint 18, `1924:3907` (the validated frame); the exploration board `1913:3357`; a
survey of eight shipped two-level sidebars on Mobbin
**Status:** Accepted
**Breaking:** none. `#panel` is opt-in, and a column that does not declare it renders as before —
measured box for box below.

## Context

ADR-0034 surveyed three ways a sidebar folds and kept the first. The third — a permanent rail beside
a panel that changes with the section — it set aside as "not a collapse". The product now has areas
with **two levels of destinations**: sections, and the pages inside each. One column can hold both
only by nesting, as Cloudflare's and GitLab's disclosure rows do, and that was not the brief: the
brief was the collapsed rail with the expanded column beside it — *deux sidebars en une*.

## The survey

Eight products: [Sentry], [Supabase] (a section with pages and one without), [Intercom],
[Featurebase], [ClickUp], [HubSpot], [Gorgias]. They agree on five things:

1. **The rail never folds.** The panel opens and closes; what is left is the rail — which is our
   collapsed form, already built.
2. **The panel is titled with the selected section.** That title is what names the selection of a
   rail that has no labels.
3. **The panel is denser than the rail**: small group titles, rows often without icons, sometimes
   counts.
4. **Two families of ground**: one ground and a rule (Sentry, Supabase, Featurebase), or two
   contrasting grounds (ClickUp, HubSpot, Zendesk).
5. **A section without pages has no panel** (Supabase's home, Mintlify's).

## Three tracks, one chosen, then revised from its own drawing

Drawn on the column's real ground, open, closed and in dark, before any code:

| | Separation | Selection in the panel | Cost |
|---|---|---|---|
| **A — one ground, a rule** | `border-default`, 1.338:1 on `bg-neutral` | the same pill | two pills on screen at once |
| B — the panel as a surface | `bg-default` against `bg-neutral`, 1.102:1 | `bg-selected` 1.165:1 + `text-on-brand-subtle` 8.83:1 | two selection idioms; the panel reads as a second page |
| C — a contrasted rail | `bg-inverse`, 17.1:1 | the same pill | a hover and a rule to mint on the inverse ground; `bg-inverse` flips with the mode (ADR-0029), so in dark the rail turns light |

A was chosen — it mints nothing and holds in dark — and then **revised in Figma** (`1924:3907`):
the toggle left the rail for the panel's title row, and the panel narrowed from 240 to 200.

## Decisions

### Declaring `#panel` makes the column two levels — declaring, not filling

Fill the slot and the column becomes a row of two boxes: the **rail**, which is the collapsed form,
always — a section list that also carries a page list never needs its labels back — and the
**panel**, titled with the selected section and holding its pages. `collapsed` then closes the panel
and nothing else. The header slot is told the rail's form (`#header="{ collapsed }"`), so the
workspace switcher renders its rail box without the shell tracking which form the column is in.

Two levels are decided by the slot's **declaration**, not its content. A section with no pages
renders nothing into the slot, and if emptiness switched the column back to one level, walking from
Parcelles to Accueil would give every rail item its label back and double the column's width for one
page.

### Two selections need two lists, so the list became a component

A selection is scoped by `provide`: an item registers with the nearest list above it. The rail's
items and the panel's items sit in the same `SideNavigation`, so one `provide` would have made them
one list — one pill for both, and a page able to deselect its own section. A component boundary per
level is the only way to scope two contexts inside one parent, so the machinery the rail kept inline
— registry, pill, `ResizeObserver` — moved into an internal `SideNavList`, which both levels use.
Written once, because two copies of the pill are two owners of it (ADR-0036).

The panel's list is **keyed by the section**. A different section is a different list; a pill that
slid from Parcelles' third row to Producteurs' first would be claiming the two were one.

The panel's selection is its own model, `v-model:page`, and `aria-current` says which is which:
**`true` on the rail's section** — the current one *of a set* — and **`page` on the panel's page**,
the destination.

### The title is read off the rail

The panel's title is the selected rail item's label, registered as a getter so a renamed item
renames its panel. Not a prop: a title that is a second prop is a title that can disagree with the
pill beside it — ADR-0042's rule, the current item derived rather than declared twice.

### The toggle is drawn in the panel's title row, and rides its edge home

Figma moved the toggle to the panel's title row, and it is ADR-0034's convention intact — top of the
column, trailing edge, first row. Only the column got wider.

**Drawn there, not moved there.** It stays the rail header's child, absolutely placed against the
rail's box, one row in from the panel's far edge; collapsing then never swaps the element that
caused it (ADR-0044's reason: a remount drops keyboard focus mid-gesture), and the restack's FLIP
carries it home to the rail's first row. Because it is 16px in from an edge that closes on the same
curve, it rides that edge the whole way.

It did not at first. The FLIP ran on a transition, which needs a double `requestAnimationFrame`
before its inverse transform counts as a start value (ADR-0032) — so the trip began **two frames
after** the width. Invisible while the header only restacked; beside a closing edge, measured: the
gap between the toggle and the edge fell from 52px to **31.5**, the button overhanging the page by
4.5px. The FLIP now runs on the Web Animations API, which takes the start value as a keyframe, so
the trip starts on the frame the width does: **52 ± 1** all the way, in both directions. The single
column got the same fix for free — ADR-0045's sum, one eased trip, now holds frame by frame instead
of on average.

### No panel, no toggle

The toggle is the panel's control. A section without pages has nothing to show or hide, and a
control that stayed would flip a state nothing on screen reflects. With the panel open the rail's
head has no toggle either, so walking to Accueil changes nothing in the rail: the panel closes and
the mark stays where it was.

### 200px, a size and not a ceiling

The panel is Figma's width — 199 plus the 1px rule — and, for once, **a size**: ADR-0031's rule met
from its exception. A ceiling lets a box hug its content, and a panel that hugged its labels would
change width with every section, the page beside it shifting on each click in the rail. 68 + 200 is
268, the single column's 260 give or take its rule: two levels cost the page nothing. The price is
Figma's own: "Toutes les parcelles" truncates at the 167px row.

### The rule is the panel's left border

`border-default`, for ADR-0034's reason: on `bg-neutral` it is 1.338:1 where `border-subtle` is
1.073:1 and reads as nothing. It sits inside the 200px, which is what leaves the rows at exactly
Figma's 167. The frame had lost it on the way — wrapping rail and panel in one auto-layout frame
left the rule behind in the cell, and the 1px gap it left is the rule's width — so it is kept from
track A, whose name it was.

It travels to zero with the panel's width, or a 1px line would outlive the panel at the rail's edge;
and `visibility` lands at the end of the close, which is also what takes the closed panel's rows out
of the tab order.

### Two stacking contexts, each carrying one thing

Measured by switching each off:

- **The panel at `z-index: 0`** keeps the rail's tooltips readable. They open across the panel, and
  the panel's rows are raised (`z-raised`, for the pill beneath them): left in the column's
  stacking, they came later in the DOM at the same height and painted over the tooltip.
- **The rail at `z-raised`** keeps the toggle clickable. It is drawn over the panel's title row, and
  without the rail's own height the panel's head, later in the DOM, took the click.

### `SideNavGroup`

A titled run of rows. `label-md` in **`text-subtle`**: 6.98:1 on `bg-neutral` light, 4.50:1 dark —
`text-subtlest` is the obvious quieter pick and is 3.13:1 in dark, a 12px title that fails AA in one
mode. A group break is 16px, twice the row rhythm, and its title binds to its rows at 8. It carries
no selection and **no position**: its rows still register with the list above it, and an
unpositioned group keeps their `offsetTop` measured from that list. In a rail the title leaves the
screen and stays announced.

## Measured

Live, Chromium at 1280×800, `Navigation/SideNavigation` → *Deux niveaux*:

- Open: column **268** = rail 68 + panel 200 (rule 1px `border-default`); rows **167×36** at x 85;
  title `heading-md` at x 97; toggle 36×36 at **(216, 12)**; mark (16, 12); the rail's rule at y 56;
  first rail row y 81, first panel row y 72.
- `aria-current`: rail `true`, panel `page`; the panel's list is a `group` labelled by its title.
- Collapsed from the keyboard: column **68**; panel 0 wide, `visibility: hidden`, no focusable row
  left; toggle (16, 12), mark (16, 56), rule y 100 — the single column's rail, box for box. **Focus
  stays on the toggle**, both ways.
- Sampled every frame, collapse and expansion: **0 reversals** on the toggle's x and y, the mark's x
  and y and the column's edge; the toggle's gap to the closing edge **51.98–53.00** (was 31.5–52
  with the transition FLIP) and **51.98–52.22** opening (was 52–72.5).
- Accueil: column 68, no toggle, the mark still at (16, 12). Producteurs: title *Producteurs*, the
  rail's section `aria-current="true"`, and the page the story's shell lands on (landing a section
  on its first page is the shell's job, not the component's) `aria-current="page"`.
- One level, unchanged: 260 and 68; header 228×48; rows 228×36 at y 84 and 36×36 at y 125; the
  glyph's left edge at 28 and 23.5 — ADR-0034's and b8f19c8's numbers.

## Still open

- **Hovering a rail item while the panel is closed** shows the tooltip, not the section's pages.
  Sentry floats the panel over the page instead; drawn on the board, not decided.
- **A section without pages, collapsed.** There the toggle sits above the mark, so walking to
  Accueil removes it and the mark moves up 44px — the one place the rail's head still jumps.
- **Figma's `SideNavigation` set has no two-level variant.** `1924:3907` is the reference until one
  is drawn.
- **167px truncates real labels.** "Toutes les parcelles" does already; the width is the frame's,
  and a section whose pages are long French phrases will want either shorter names or a wider panel.

[Sentry]: https://mobbin.com/screens/890b184a-c629-481a-b975-df0e4749e450
[Supabase]: https://mobbin.com/screens/aaecbeeb-5370-4ae4-9bd7-30e0c3d06448
[Intercom]: https://mobbin.com/screens/d4d6efaf-d387-4211-9bdf-1c207d1f2714
[Featurebase]: https://mobbin.com/screens/ac4aab9f-532d-490f-950e-662030bac7ae
[ClickUp]: https://mobbin.com/screens/8d0b9d41-7212-492c-bacc-0d8b82a5ff5e
[HubSpot]: https://mobbin.com/screens/56cf36dd-2345-49d2-8284-df2965a29945
[Gorgias]: https://mobbin.com/screens/3f3d6403-2a2b-490c-8e75-0f9838f62d40
