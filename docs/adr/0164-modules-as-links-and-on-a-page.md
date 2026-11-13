# ADR-0164 — Modules as links, and on a page

**Status**: accepted (etolbi, 13 Nov. 2026 — remarks from the home page)

## Context

etolbi's home now lists its modules at the bottom. `ModulesList` could not serve there, for two reasons:

- **Its entries were `<button>`s emitting `select`.** A page needs real links: middle click, a new tab, the address
  shown on hover.
- **It was the bar's drawer**: a fixed 3-column box of 48px drawings with its own shadow.

So etolbi recomposed it by hand (`app/components/home/modules-row.vue`). Separately, its hover transition was
written as a bare `0.12s ease`, off the motion scale and not cut under reduced motion.

## Decision

**`href?` on `ModulesListItem`.**

- Given, the entry is an `<a>` with that address. It **still emits `select`**, now with the click (`select(item,
  event)`), so a router can take the navigation over with `event.preventDefault()` while middle click and modified
  clicks keep the browser's behaviour.
- A disabled link keeps its look and drops its `href`, with `aria-disabled`: an `<a>` without one goes nowhere and
  takes no focus.
- The current module says `aria-current="page"` as a link (ADR-0033), and `"true"` as a button.
- `HorizontalNavigation`'s `module-select` passes the click through too.

**`layout: 'panel' | 'page'`**, `panel` by default and unchanged (ADR-0163). `page` is etolbi's recomposition, taken
as drawn:

| Part | Value |
|---|---|
| Grid | fluid `auto-fill, minmax(10rem, 1fr)`, `spacing-lg` between: 6 a row at 1 200px, 3 at 700px, 1 at 360px |
| Height, ground | no fixed height, no shadow, no ground of its own (the page is the ground) |
| Entry | a 56px row, bordered `border-subtle`, `radius-surface`, `bg-default` |
| Drawing | `variant="illustration"` at 32, then the name in `label-md-strong`, one line |
| Current module | the drawer's mark (`bg-selected`, `text-on-brand-subtle`, ADR-0050) |

No scroller: a page scrolls itself.

**The list is a list now.** `<ul>` and `<li>`, in both layouts. It used to be a `<div>` of buttons.

**The package's pace.**

- The hover's background moves over `duration-quick` + `easing-default`. It was a hand-written `0.12s ease`.
- The focus ring moves at `instant` (ADR-0022).
- **There was no focus ring at all**, so a keyboard reached the modules unseen. Entries now take `focus-ring-brand`.
- Under reduced motion the transition is cut.

## Measured

`Navigation/ModulesList`:

- **« Sur une page »**: entries render as `<a>`, 173 × 56 at 1 200px. A `play` test checks nine links, the current
  one `aria-current="page"`, and the `href`s.
- **The drawer**: unchanged at 270 × 288, buttons with `type="button"`, the ring on Tab, the transition cut under
  reduced motion.
