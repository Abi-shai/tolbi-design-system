# ADR-0034 — The rail is the same component

**Date:** 2026-09-18
**Status:** Accepted
**Extends:** ADR-0033 (`SideNavigation`), ADR-0006 (a component owns its fg/bg pair)
**Source:** Sprint 18, `1406:5614`; a survey of 20 shipped web sidebars on Mobbin
**Breaking:** none. `collapsed` defaults to `false`, which is what shipped.

## Context

A sidebar that collapses to icons is not one pattern. The survey found three, and they are not
variations on each other:

| | Width | Label | Examples |
|---|---|---|---|
| **Icon-only rail** | 36–48px | in a tooltip | Weavy, Midday, Aboard, Shop, Copilot, Fabric |
| **Icon + caption rail** | 64–72px | under the icon, 10–11px | Employment Hero, Turo, Hootsuite, Sentry |
| **Two-tier** | rail + panel | in the panel | Gorgias, Mintlify, Featurebase |

The third is not a collapse at all — the narrow rail is permanent and the panel beside it changes
with the section. It was ruled out on that basis, not on looks.

The most useful single find was ClickUp, which does not present this as a collapse. It is a setting,
under *Appearance*, with two options named **"Icons only"** and **"Icons & Labels"** — our first two
rows, treated as a display preference rather than a state of the chrome. That framing is why
`collapsed` is a prop with no built-in toggle; see below.

## Decisions

### Icons only, which makes the tooltip structural

The brief said "only the icons", so the first row. The consequence is the part worth recording:
**in that form the `Tooltip` is not a nicety, it is where the label lives.** A rail without one has
items with no name — on screen and in the accessibility tree both. So `SideNavItem` renders a
`Tooltip` on hover and focus, and sets `aria-label` to the same string. Neither is optional and
neither is the consumer's job.

The second row would have removed that dependency entirely — a caption under the icon never leaves,
and `label-xs` (11px) already exists to set it. It is the better answer for a rail that must work
without hover, and it is recorded here as the alternative rather than dismissed.

### The group owns `collapsed` **and** the toggle — reversed, same day

`SideNavigation` already owns the selection (ADR-0024) and the ground (ADR-0006). `collapsed` joins
them, passed to items through the same context — an item cannot know the rail's form on its own, and
a per-item prop would allow half a rail to collapse.

This ADR first said the component should *not* ship the control that flips it. The reasoning was
that the survey had put the toggle in a header (Fibery), on an edge handle (Toggl) and in a settings
panel (ClickUp) — three products, three placements, therefore a shell concern.

**Three was not a sample.** Asked the obvious follow-up — "then which button?" — and ten more
products answered it almost in unison:

| Placement | Products |
|---|---|
| **Top of the column, trailing edge, on the mark's row** | Suno, Sentry, Charma, Clay |
| Bottom of the column | Neon, Linear |
| Top bar, outside the sidebar | Frame |
| Text link rather than an icon | Coursera |

Four of ten in one place is a convention. The first three had looked like disagreement only because
three points cannot show a distribution. So the component ships an `IconButton` with `panel-left` —
the glyph VS Code, Linear and Figma all use, already in the manifest — at the top of the column on
the trailing edge, and `toggle: false` removes it for a shell that places its own.

`IconButton` needed no adjustment: it is already 8px around a 20px glyph, so 36px, which is exactly
the rail's row.

The accessible name changes rather than the state being announced separately —
*Réduire la navigation* / *Déployer la navigation*, and no `aria-expanded`. A name that says what the
next press does and an `aria-expanded` that says what the current state is will double-report.

### The rail's width is derived, and the row's height does not move

The row stays **36px** in both forms. That is the constraint everything else follows from: the pill
slides *and* resizes between forms, and a row that also changed height would have it resizing on two
axes at once.

So collapsing narrows the pill and never shortens it — measured at 228×36 expanded and 36×36
collapsed, the height identical.

The rail is then `36px + 2 × spacing-md` = **52px**, written as that sum rather than as `52px`.
The row size is a private component token (`--side-nav-rail-row`) set on the group and read by the
item off the cascade — an own-value, so a component token under ADR-0010, and private because
nothing outside needs it. Two stylesheets have to agree on this number or the rows sit off-centre in
their own rail; naming it is what stops them drifting.

### The wrapper is what gets registered

`SideNavItem` gained an outer element, and it is not cosmetic. The tooltip anchors to it, which
makes it `position: relative` — and a button inside a positioned wrapper reports `offsetTop: 0`,
which would have left the sliding indicator measuring from the wrong origin and parking on the first
row forever.

So the group registers the **wrapper**, not the button. The button keeps the focus ring, the
`aria-current` and the click. Written into `SideNavigationContext`'s doc comment, because the next
person to add an element here will re-derive it the hard way otherwise.

### The workspace mark loses its box

Collapsed, `WorkspaceSelector` drops `DropdownTrigger` entirely and renders the bare `Avatar` as a
button. Every icon-only rail in the survey does this — Weavy, Midday, Aboard and Shop all leave the
workspace mark unboxed.

It is also the only option that lands on the scale. A 36px box around a 24px avatar leaves 5px of
padding once the border is counted, which is on no ramp; the bare mark is a 24px avatar in the
rail's 36px column, 6px each side, which is `spacing-sm`.

Its panel cannot align to a 36px trigger, so it keeps `Dropdown`'s own 240px and opens *beside* the
rail rather than under the mark.

## Measured

Live, `Navigation/SideNavigation` → *Déployée vs réduite*:

- Expanded — rail 260px, row 228px, indicator 228×36.
- Collapsed — rail 52px, row 36×36, indicator 36×36. **Height identical across both.**
- `aria-label` is present only when collapsed, and carries the label.
- The label element is absent from the DOM when collapsed, not hidden.
- Hovering the third row shows the tooltip reading `Producteurs`, left-arrowed, clear of the rail.

Clicking the toggle, *Repli — le bouton*: nav 260px → 52px and back; the button's name goes
*Réduire* → *Déployer* → *Réduire*; the header's `flex-direction` goes `row` → `column`; the
indicator goes 228×36 → 36×36; `WorkspaceSelector` swaps its boxed trigger for the bare mark. Three
clicks, no drift.

## The Figma pass, and one thing it cost

`SideNav/Item` gained a second axis — `Forme = Étendue | Icône` × `État` — eight variants, mirroring
the prop rather than a separate drawing. A comparison frame holds both assembled sidebars.

**Cloning a variant in Figma drops `componentPropertyReferences`, silently.** Every variant cloned
to build a new state lost its binding to the `Libellé` and `Icône` properties, so setting either on
an instance did nothing — the rail rendered five house icons. It was visible only because five rows
were meant to differ; the `Survol` and `Focus` variants created in ADR-0033's pass had been broken
the same way for a day and nothing showed it, because nobody had set a property on them.

Re-bound on all six. Worth knowing before the next variant is cloned: the fix is to copy
`componentPropertyReferences` onto the clone's layers by hand.

## Still open

- **The caption rail.** Row two of the survey, 64–72px, `label-xs` under each icon and no tooltip
  dependency. If the rail ever has to work on touch or without hover, that is the form to build, and
  it is a third value of the same prop rather than a new component.
- **The transition between forms.** Collapsing is currently instantaneous. The pill has a
  transition and moves correctly, but the rail's own width and the label's disappearance do not —
  ADR-0025's `0fr → 1fr` grid is the tool for the label, and the width is a plain transition. Left
  out because a half-animated collapse reads worse than an honest cut.
- **Nothing pins the rail's width to the row.** `--side-nav-rail-row` makes them agree, but a
  consumer setting `width` on the collapsed nav would override the derived value and knock the rows
  off centre. No lint rule can see that.
