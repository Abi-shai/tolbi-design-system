# ADR-0047 — The rail keeps the sections, and the pages come to the pointer

**Date:** 2026-09-30
**Extends:** ADR-0046 (the second level), ADR-0021 (anything that floats uses `SurfaceTransition`),
ADR-0032 (a delay is a duration in another slot)
**Closes:** ADR-0046's first *Still open* item — hovering the collapsed rail showed a tooltip, not
the section's pages.
**Source:** a second Mobbin round on the collapsed form of two-level sidebars; the exploration
board's behaviour cell *Replié · survol* (Sprint 18, `1917:3939`)
**Status:** Accepted
**Breaking:** `#panel` became a function of the section — `#panel="{ section }"`. Unreleased
(ADR-0046 has not been tagged), so no consumer holds the old form.

## Context

Collapsed, the two-level column shows the rail of **sections** (level 1). The question was whether
it should show the **pages of the current section** (level 2) instead — Paramètres collapsed would
then be Profil, Notifications, Sécurité rather than Accueil, Parcelles, Producteurs. The argument
for it is real: collapsed, every page is two clicks away.

## The survey

Fifteen two-level products on Mobbin. **None puts the pages in the rail.** The three whose collapse
Mobbin records — [Sentry], [Intercom], [HubSpot] — hide the panel and keep the sections; in the
other twelve the rail never changes at all.

The level-2-first form exists, and in a different architecture: where level 1 is **a switcher in
the header**, not a rail ([Vercel], [PlanetScale], AWS). There the bar only ever holds the current
context's pages, so collapsed, it is the pages that show. A rail that swapped its icons with the
section would be both architectures at once: the icons' meaning would change on every click, and
leaving the section would need the panel opened first.

HubSpot answers the real cost differently: **pointing at a section floats its pages beside the
row** ([HubSpot's flyout]). The pages come to the pointer; the rail keeps meaning one thing.

## Decisions

### The rail keeps the sections, unchanged

The collapsed rail is ADR-0046's, box for box. What is added is only what the pointer can reach.

### The floated pages are the panel, lifted

Same width (`--side-nav-panel`), padding and ground (`bg-neutral`), and the same rows — so the pill
and the hover read exactly as they do docked. `bg-default`, the catalogue's usual floating fill,
would have lost both: the white pill vanishes on white, and `bg-hover` is 1.04:1 there. What floats
is the chrome every floating surface carries — `elevation-overlay`, a contour, `z-popover` — with
`radius-surface`, the value `ModulesList`'s panel already takes for a panel of content.

The contour is **`border-default`**, where `Dropdown` takes `border-subtle`: on `bg-neutral` the
subtle step reads as nothing (ADR-0034), and in dark, where elevation stops separating (ADR-0030),
the contour is what is left.

Hovering the current section floats its pages with the current page's pill on it; any other
section floats with none.

### The motion is the house entrance, from the row

`SurfaceTransition`, not a new curve (ADR-0021): in over **`duration-enter` (200ms) on
`easing-out`**, from **`scale-enter` (0.96)** and transparent; out over **`duration-exit` (100ms)
on `easing-in`** — the exit faster than the entrance. The origin is the consumer's to set, and it
is **the hovered row's centre** (`0 31px`), so the surface grows out of the icon rather than out of
its own corner. `top` and the origin are written inline; the scale is the transition's stylesheet
`transform`, which nothing here writes inline — HelpIcon's lesson, an inline `transform` silently
cancels the entrance's scale.

Two delays, both durations in another slot (ADR-0032), read off the cascade like the column's
travel:

- **Opening waits `quick` (100ms)** — the scale's own words, "responds before you finish the
  gesture" — so a pointer sweeping down the rail does not flash a panel at every row.
- **Closing waits `moderate` (150ms)**, the grace a pointer needs to cross the 8px between the row
  and the panel without the panel leaving under it.

Once one is open, the next row switches **at once**, without replaying the entrance — a menu bar's
rule: the intent was already shown. The list inside is keyed by section, so its pill never slides
between two sections' pages.

### Placed from the row, and from the row's rhythm

8px beside the row — the rail's tooltip's own offset. The title row sits level with the hovered
row, the panel's padding above it, which is exactly where the docked panel's title sits beside the
rail's first row; near the column's foot it is clamped inside. Measured first at 1px low: the
placement counted the padding and not the contour.

### The slot became a function of the section

The rail must ask for the pages of a section **other than the selected one** — the one under the
pointer — so `#panel` receives the section it is rendering for: the docked panel passes the
selected section, the floated one the hovered section. "No pages" is the same test for both, which
is also what keeps a section without pages on its tooltip.

### Pointer and focus stopped answering the same way

A rail item's tooltip used to open on hover or focus alike. Now the pointer on a section with pages
floats the panel, which carries the label as its title, so the tooltip would only stack on it;
**focus keeps the tooltip**. A section without pages keeps its tooltip for both, and pointing at it
closes an open panel at once — a panel lingering beside the wrong row is a wrong answer.

The row a panel floats from **keeps its hover** while the pointer is over the panel, so the panel
reads as coming from that row. The board drew it so; HubSpot does the same.

### A page picked there is a section and a page at once

It emits the section, then the page, and closes; the column stays collapsed. A shell that lands a
new section on its first page must keep a page that already belongs to it — the story's shell does,
and that is the shell's job, not the component's.

### Dismissal

Escape closes it (WCAG 1.4.13: dismissible), as do choosing a section, collapsing and expanding. It
stays while the pointer is over it (hoverable) and until the pointer leaves (persistent).

## Measured

Chromium, `Navigation/SideNavigation` → *Deux niveaux — réduite*:

- Nothing at 50ms of hover; open by 250ms. First frame: opacity 0, `matrix(0.96…)`,
  `ds-surface-enter-from ds-surface-enter-active`; last frame opacity 1, `transform: none`.
- Box: 200 wide at x 60; title row level with the hovered row, **0px off on all four rows** (1px
  before the contour was counted); origin `0px 31px`; `bg-neutral`, 1px `border-default`, 12px
  radius, `elevation-overlay`, z 100; the list a `group` labelled by its title; no tooltip on that
  row; the row's own background `bg-hover` while floating, transparent once closed.
- Into the panel: it stays. Onto Parcelles (the current section): switched 20ms later with no
  transition class, *Toutes les parcelles* pilled. Onto Accueil: leaving at once, and the
  tooltip *Accueil* shown.
- Leaving: still present at 100ms (the grace); then `ds-surface-leave-active` with
  `opacity 0.1s cubic-bezier(0.4, 0, 1, 1)` — `exit` on `easing-in`; gone after.
- Escape: leaving at once.
- Picking Producteurs › *Enquêtes* (not its first page): section *Producteurs*, page *enquetes*,
  panel closed, column still collapsed; reopened, *Enquêtes* carries the pill.
- Keyboard focus on a rail item: the tooltip, never the panel. Expanded: hover keeps the tooltip.

## Still open

- **The keyboard has no way into the floated pages.** Its path to a page is the panel, one toggle
  away — recorded as a limit, not an oversight. A menu-button pattern (ArrowRight into the pages)
  would be the next step if the floated pages ever became the main route.
- **Touch has no hover.** A tap selects the section, as it always did; nothing floats.
- **The rail's own tooltip still pops.** It centres itself with `transform: translateY(-50%)`, a
  scoped rule that outweighs the entrance's unscoped `scale` — wrapped in `SurfaceTransition` as it
  stands, it would repeat HelpIcon's defect, the fade without the scale. It wants the independent
  `translate` property first.

[Sentry]: https://mobbin.com/flows/a8130a01-49f7-4121-a466-d2c10decf445
[Intercom]: https://mobbin.com/flows/ad151b2d-f310-4371-a658-da78240808a9
[HubSpot]: https://mobbin.com/flows/91a8518e-28e7-4565-8e4f-6a48cc34ce11
[HubSpot's flyout]: https://mobbin.com/screens/34d85e42-273f-4e4e-a4b1-4f2bf9380a33
[Vercel]: https://mobbin.com/screens/ed59aac0-5d5a-4b41-be26-aa2ae1374596
[PlanetScale]: https://mobbin.com/screens/d48698dd-a218-4cfe-b594-fa049b2464b3
