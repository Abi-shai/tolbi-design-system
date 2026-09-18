# ADR-0033 — The indicator had only ever moved sideways

**Date:** 2026-09-18
**Status:** Accepted
**Extends:** ADR-0024 (`useSlidingIndicator`), ADR-0006 (a component owns its fg/bg pair),
ADR-0014 (a thing that is clicked is a control)
**Source:** Sprint 18, `1006:11093` — `Barre latérale`, and the `SideNav/Item` set at `615:344`
**Breaking:** internal only — `SlidingIndicatorStyle` loses `top`. `composables/` is not in the
package exports, so no consumer outside this repo can see it.

## Context

The product's left-hand column existed in Figma and nowhere in code. `HorizontalNavigation` was the
only navigation component in the catalogue, and `SideNav/Item` had been drawn with a Figma
description that said so out loud — *"No SideNavigation exists in the catalogue."*

This is ADR-0028's `IconButton` for the second time: a Figma component with no code counterpart,
which is ADR-0001 in reverse and which **a code-only audit never finds.** Worth naming as a pattern
now that it has happened twice — the catalogue is audited from the code side, and that sweep is
blind in exactly one direction.

The audit that opened this found the token layer clean — every colour, radius and border width in
both Figma components bound to a `--ds-*` semantic variable, no raw hexes, `Avatar/xs` matching
`components/Avatar` value for value. What was not clean was the component layer, and the specific
defect was that **the component and its only instance disagreed**: `SideNav/Item · État=Active`
painted `bg-neutral` on a transparent ground, while the one instance placed in the sidebar painted
`bg-default` on a grey one. The inverse of each other. Two idioms already shipped in code — `Tabs`
(grey track, white pill) and `HorizontalNavigation`'s active crumb (grey fill on white) — and the
Figma had one of each, in the same component.

## Decisions

### The selection is Tabs' pill, not `bg-selected`

A nav item reads as "chosen from a list", which is the literal description on `bg-selected`
(brand-50). Under ADR-0009's four admission clauses that makes selection a **state**, and the Figma
was spending a **ground** on it.

It stays a ground anyway, and the reason is that the sidebar is a page-level surface rather than a
control. The row does not tint in place; it **rises to `bg-default` off a recessed column**. That is
`Tabs` exactly — and `Tabs` is the only other component in the catalogue where selection is a
surface rather than a fill.

`brand` is not in play: ADR-0009 reserves it for interactive affordance, and every row here is
interactive, so tinting the selected one brand would say nothing the others do not.

### The ground is `bg-neutral`, and the token values chose it — not taste

`Tabs`' track is `bg-neutral-subtle`. Reproducing that value was the obvious move and it is wrong,
because **`bg-hover` and `bg-neutral-subtle` alias the same primitive** (`gray-light/50` in light,
`gray-forest/800` in dark). On `Tabs`' value the hover state is not faint — it is *absent*:

| | fond `bg-neutral-subtle` | fond `bg-neutral` |
|---|---|---|
| pill (light) | 1.045:1 | **1.102:1** |
| hover (light) | **1.000:1** | 1.054:1 |
| pill (dark) | 1.233:1 | **1.644:1** |
| hover (dark) | **1.000:1** | 1.333:1 |

1.000:1 in both modes. Identical colour, no separation at any threshold.

`Tabs` gets away with it because its track is a strip 44px tall with a border and no hover state on
the selected tab — the collision never surfaces there. A nav column is a full-height surface whose
rows are hovered constantly, so it does.

Two things fall out of the dark column that are worth keeping:

- **1.644:1 is not a new number.** ADR-0030 measured `border-subtle` at 1.644:1 and made it the
  thing that separates an elevated surface in dark, because the strongest shadow `gray-forest/900`
  can hold is 1.262:1. In dark, `bg-neutral` *is* `gray-forest/700` *is* `border-subtle` — so the
  pill's edge against its ground is the same step ADR-0030 already chose. The sidebar does in dark
  what that ADR said dark does: the edge separates, the shadow only grounds.
- **The pill recesses in dark.** `bg-default` is `gray-forest/900`, its ground is `/700`, so the
  surface that rises in light sinks in dark. ADR-0029's rule is that a layer rises in dark, and this
  is that rule applied to the ground rather than to the pill. `Tabs` has behaved this way since dark
  shipped; naming it here because on a full-height column it is much more visible.

**This was decided by drawing it, not by reasoning about it.** Both grounds were built side by side
in Figma with all four states on each. The hover row being invisible in column A is what settled it;
no amount of reading the token file was going to surface a collision between two tokens that are
never named together.

### `useSlidingIndicator` carries both axes — the second was never exercised

The composable already returned `top` and `height` alongside `transform` and `width`. It looked
axis-agnostic and was not: `top` was emitted as **static position**, and `top` is not what either
consumer's transition list animates. A vertical consumer would have **jumped**.

The bug was latent, not introduced. Two horizontal consumers never moved that axis, so the broken
half shipped in ADR-0024 and sat there for seventeen days looking like a feature.

Both offsets now go through the transform — `translate(offsetLeft, offsetTop)` — and `top` leaves
the returned shape. For a row `offsetTop` is constant, so `translate(x, 0)` is precisely what
`translateX(x)` was: the change costs `Tabs` and `ButtonGroup` nothing, which is the only reason it
could be made in the composable rather than behind an `axis` flag.

**Which axis animates stays the consumer's CSS.** A row transitions `transform, width`; a column
transitions `transform, height`. The composable measures; it does not decide what moves. An `axis`
option would have put that decision in the wrong place and then had to be threaded through both
existing consumers to say what they already say in their own stylesheets.

### The group owns the ground, not only the selection

ADR-0024's lesson transfers verbatim — `SideNavigation` takes `v-model`, items register through a
`provide`/`inject` context in DOM order, and no item carries `active`. One selected row by
construction, and the group knows *where*, which is the precondition for moving anything.

The less obvious half: the group also paints the **ground**. The pill is `bg-default`, so a
`SideNavItem` shipped without its recessed column is white on white — the component would ship a
bug rather than a default. ADR-0006 already covers this ("a component that puts text on a coloured
surface owns the pair"), and the sidebar is the case where the pair spans two components.

Which forces the complement: **the row has no background at all.** Not `bg-default`, not
`transparent` as an afterthought — an opaque row would simply cover the indicator sliding behind it.

### Default and selected share one weight

Figma drew both states in SemiBold, and the instinct was to correct that — a default row at semibold
leaves no headroom to emphasise the selected one. Keeping it is the right answer for a reason that
only appears once the pill moves: **the pill's geometry is what travels.** A weight that changed on
selection would change the row's width, and with `width` in the measurement the pill would resize
mid-flight.

Colour promotes instead, `text-default` → `text-strong`. The pill carries the rest.

Same reason the label truncates rather than wraps: a taller row would resize the pill vertically
while it is moving to it.

### `aria-current="page"`, not `aria-pressed`

`ButtonGroupItem` uses `aria-pressed`, which describes a toggle. This is navigation, and the
selected row is the current page — `aria-current="page"` is the one that says so. The row renders
`<a>` when given `href` and `<button>` otherwise (ADR-0014).

### What was not added

**A `prefers-reduced-motion` guard *in this component*.** One was written and removed. The guard
exists on `Skeleton` and `Spinner` — both looping animations — and on `useMarquee` (ADR-0032), but
neither `Tabs` nor `ButtonGroup` guards its indicator. Adding it to the third consumer of one shared
composable would have made this component the inconsistency rather than the fix. It went into the
composable instead, for all three at once — see the closed item below.

**A collapsed/rail width.** Figma has not drawn one. A width the design has not drawn is a guess,
and ADR-0031 already paid for reproducing a width literally.

**`WorkspaceSelector`.** It is a `Dropdown` trigger in all but name, and `Dropdown` already shipped
`trigger` as `button | icon | avatar` with `control-padding-md`, `border-default`, `radius-control`
and `elevation-control`. ADR-0001 says extend that set rather than compose a fourth one. Done in a
separate pass rather than here: `DropdownTrigger` now owns the boxed chrome and the content is a
slot, `Dropdown` takes a `#trigger` slot, and `WorkspaceSelector` ships whole. That pass also found
the boxed trigger had **no `:focus-visible` rule at all** — the chrome was not only drifting in
Figma, it was incomplete in code.

## Measured

Live in the browser, `Navigation/SideNavigation`:

- The pill starts at `translate(16px, 16px)`, 36px tall. Selecting the fourth row it lands at
  `translate(16px, 136px)` — 16 + 3 × (36 + 4), the row height plus the `spacing-xs` gap, exact.
- 90ms into the move it reads `translate(16px, 108.365px)`. A non-integer intermediate is the
  interpolation itself; a jump would have shown only the endpoints.
- `height` holds at 36px throughout. The transform carries the whole travel.
- `aria-current="page"` follows the selection. The row renders `BUTTON` with no `href`.

Non-regression, same session:

- `Tabs` — `translate(6px, 6px)` → `translate(275px, 6px)`, width 130px held. The `6` on the vertical
  axis is the container's padding, previously carried by the inline `top` and now by the transform.
  Same pixel, different property.
- `ButtonGroup` — `translate(0, 0)` → `translate(161px, 0)`, width 65px held. Matches the figure
  ADR-0024 recorded for the same interaction.

`npm run build` green: tokens, lint (16 rules, 0 findings), 32 tests, `vue-tsc`, `vite build`.

## Still open

- ~~**`prefers-reduced-motion` on the sliding indicator.**~~ — closed in the same pass. The guard is
  in the composable, not in three stylesheets: `ready` never turns true under
  `(prefers-reduced-motion: reduce)`, so the consumer's `--animated` class never lands and its
  transition is never applied. A fourth consumer inherits it without knowing. `transition: none`
  turned out to be the honest reduced form here — ADR-0032's rule bit on the marquee because
  stopping the loop *hid* the clipped content, whereas a selection that jumps still says which item
  is selected. Nothing is lost but the travel.

  **The test for it is weaker than it looks.** Playwright's `reducedMotion: 'reduce'` forces *every*
  transition duration in the page to `1e-05s`, including ones the change never touched — verified
  against `.ds-side-nav-item`'s own background transition, which reads `0.1s, 0.1s, 0.05s` normally
  and `1e-05s` under emulation. So the duration proves nothing: under that emulator the result looks
  identical whether or not the composable does anything. The one discriminating assertion is that
  the `--animated` class is **absent**, since that comes from `ready` through Vue rather than from
  CSS. Real browsers do not blanket-override transition durations, which is exactly why the guard
  has to exist — but no test in this repo can currently show that, and pretending otherwise would be
  ADR-0018's broken linter again.
- ~~**`WorkspaceSelector` as a `Dropdown` trigger.**~~ — closed. It takes `size="sm"` (8/12), which
  with a 24px mark reaches the same control height `md` reaches with a 20px line box. The
  asymmetric `8px 12px 8px 8px` is gone.
- **`control-padding-*` descriptions are 2px short.** They read "40px control", "44px control" and
  so on, computed as padding plus line box with **no border**. Every bordered control in the
  catalogue is 2px taller than its token claims — `Button`, `Dropdown`'s text trigger and
  `WorkspaceSelector`'s all measure 42px at `md`. Found while checking that two routes to one height
  agreed; they do, at 42. The geometry is right and the prose is wrong, which is ADR-0009's reason
  for measuring rather than describing, arriving one tier down.
- **Control padding has no Figma representation.** `--ds-control-padding-*` are composite strings
  (`"8px 12px"`), which a Figma FLOAT variable cannot hold, so designers reach for the spacing ramp
  and land on values that happen to match. Here 8/12 *is* `control-padding-sm` and the pixels came
  out right, but the provenance is wrong and `control-padding-md` (10/14) could not be expressed at
  all — the spacing ramp has no 10 or 14. This will keep recurring until the scale is split into
  paired `-y`/`-x` variables in Figma or the code stops pairing them.
- **The shell above the list.** `SideNavigation` is the navigation list and its ground. The column in
  Figma also holds the workspace selector at a `spacing-3xl` remove, and the frame's own padding and
  widths (260/228) are still unbound literals. Whether the shell is a component or the app's job is
  undecided.
