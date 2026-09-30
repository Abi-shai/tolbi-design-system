# ADR-0047 — The bar's margins are the page's

**Date:** 2026-09-30
**Extends:** ADR-0028 (the bar carries no ground), ADR-0040 (where the component stops and the
product starts), ADR-0042 (the identity slot's 48px floor)
**Source:** Sprint 18, `1982:57462` — the bar of the `06a · Une seule porte` shell (`1130:16686`,
page *Onboarding explorations*), inside its column `1982:57583`
**Status:** Accepted
**Breaking:** visually. A shell that relied on the bar's own 12/16px must now give its column the
margins — see *What a shell does now*. No prop changes.

## Context

The bar padded itself, `spacing-lg` / `spacing-xl`, as Figma's `Nav/HorizontalNavigation` set still
does. Redrawn inside the product's shell, it has **no padding at all**: it is one row of a column
that holds the bar, the module band and the page's content, and the column carries the margins —
12 above, 12 on the right, 8 on the sidebar's side, and 12 between its rows.

The right-hand side was redrawn with it. The avatar is the last of the actions, 8px after the
modules button, where the code had set it 16px apart as a block of its own.

## Decisions

### The margins belong to the column, not to one of its rows

The bar, the band and the content share one left edge and one right edge. A margin that one row
carries puts its edges where the other two are not: with its own 16px, the bar's lockup sat 16px
inside the content's left edge, and its avatar 16px inside its right edge.

It is ADR-0040's question asked of the bar — where does the component stop and the product start?
The page's margins are the product's. So `.ds-hnav` has **no padding**, as it has no ground and no
rule (ADR-0028), and for the same reason: it takes the surface it is put on, and now the margins
too.

### One block of controls

`Apprendre`, the three icon buttons and the avatar are **one block on one `spacing-md` rhythm**. The
avatar stood `spacing-xl` apart, a block of one — a separation with nothing to separate, because it
is a control like the four before it (it emits `user`). What stays `spacing-xl` away is the credits
chip: a balance, not an action.

### The credits chip stays

The frame hides it — both of its instances are hidden layers, one of them absolutely placed. A hidden
layer in an exploration is not a deletion: `credits` is a live prop and the product shows a balance.
So it keeps its place before the controls. Whether it leaves the bar is a separate decision, open
below.

### 48, not the frame's 40

The frame's bar is 40px — the avatar, with the Tolbi lockup at 24. The code's is **48**, because
ADR-0042's identity slot has a 48px floor in both forms (the module mark is 48) and a bar that
changed height on navigation would be the defect. The frame draws home only; its 40 is the old
component's content box, 64 less 2 × 12, which predates that floor.

48 also buys an alignment the frame does not have. It is `SideNavigation`'s header row
(`--side-nav-header-row`), so with both columns starting 12px down, the bar and the sidebar's head
sit on **one line**, 12 → 60 — where the frame's 40px bar is centred 4px above the workspace selector
beside it. The row is therefore still ADR-0042's 72 (12 + 48 + 12), now split between the bar and
its column.

## What a shell does now

```css
.page-column {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg) var(--ds-spacing-lg) 0 var(--ds-spacing-md);
}
```

The stories sit the bar in exactly that (a decorator), and the stories that stack several bars take
the column's gap between them. The `Yield — Tableau de bord` assemblage keeps its look by giving its
bar a wrapper with the old 12/16.

## Measured

Chromium, `Navigation/HorizontalNavigation` → *Accueil*, 1180px wide (the frame's column):

- The bar at (8, 12), **1160 × 48**, `padding: 0` — the frame's 1160. The lockup at x 8 and the
  avatar's right edge at **1168**, both the frame's.
- Credits → 16 → `Apprendre` → 8 → 8 → 8 → avatar, the last step **8** (was 16); the avatar is a
  child of `.ds-hnav__actions`.
- Vertically the content sits 4px lower than the frame — lockup y 24 against 20, avatar 16 against
  12 — the floor, above.
- `SideNavigation`'s header row 12 → 60 with the selector centred at 36; the bar 12 → 60 with the
  avatar centred at 36.
- At 1440px, in a module: the same geometry, the mark 48 × 48 at (8, 12).

## Amended the same day: the current crumb rises off the page's ground

Seen in the product, the trail's current crumb had **no fill at all**. It was `bg-neutral`, and so is
the page the bar sits on: 1.000:1, with "you are here" said by the crumb's weight alone. The fill had
been chosen on white, one step below hover so that *where you are sits lower than where you might
go* — true in Storybook, whose stories drew on white, and false wherever the bar actually is.

It is now **`bg-default`**, which is `SideNavigation`'s pill on the same ground (ADR-0033): 1.102:1
light and 1.644:1 dark, with `bg-hover` between ground and fill (1.054 / 1.333). Ground → hover →
current runs one way, as it does in the sidebar, and the page has one idiom for "you are here"
instead of two. The ink stays `text-strong`, 17.75:1 on the fill and 12.58:1 in dark.

That makes the ground part of the pairing, so `Breadcrumbs` supports **one surface** (ADR-0006): on
`bg-default` the fill would vanish. Its only consumer is the bar, and the bar sits on the page. Both
components' stories now draw on `bg-neutral` — the bar's decorator is the page's column with its
ground, the trail's a `bg-neutral` panel. Drawing on white is also what hid the defect: the stories
showed a grey pill the product never did.

Measured, *Yield — 5 nœuds*: `Dashboard` 95.5 × 28, `rgb(255 255 255)` on `rgb(242 244 247)`, hover
`rgb(249 250 251)`; dark `rgb(24 32 28)` on `rgb(54 69 61)`, hover `rgb(38 49 43)`.

## Still open

- **The credits chip.** Hidden in the frame, kept in code. If the balance leaves the bar,
  `credits`, `creditsReminder`, `creditsTone` and the `credits` event go with it — a breaking change,
  and the product's call.
- **Figma's `Nav/HorizontalNavigation` set** (`1582:2276`) still pads itself 12/16 and sets the
  avatar apart, at 64px. It and the frame disagree; the code follows the frame.
