# ADR-0165 — The way out, and the browser's clicks

**Status**: accepted (etolbi, 13 Nov. 2026). Amends ADR-0164.

## Context

On the home page, `ModulesList layout="page"` lists links to the modules. Two remarks from the product:

- **Nothing on the block said it leads away.** Hover tinted the ground, as on any row.
- **`select(item, event)` fired on every click**, including ⌘/Ctrl, Shift, Alt. etolbi had to filter those itself
  (`useNavModules`) so the browser could open its tab, its window, its download. Otherwise its router would take a
  click the person meant for the browser.

## Decision

**An `arrow-up-right` at the block's end, page layout only.**

- It is 16px, in `text-subtle`. It arrives with the hover ground (`bg-hover`) and with the keyboard's focus, on the
  same pace: `duration-quick` + `easing-default`, opacity only. Reduced motion drops the transition.
- It is **always in the row, only transparent**, so its place is kept: the name's ellipsis is identical with or
  without it, and the arrow never pushes the name.
- Disabled entries carry none.
- The drawer (`panel`) is unchanged: a module chosen there replaces the page, it does not lead out of it.

**A modified click on a link is the browser's.** When the entry has an `href` and the click carries ⌘, Ctrl, Shift or
Alt, or a button other than the main one, `select` is **not emitted**. The browser does what the person asked. A
middle click raises `auxclick`, not `click`, so it never emitted. Entries without `href` are buttons and still emit on
any click: there is no browser behaviour to protect. The product can drop its own filter.

## Measured

`Navigation/ModulesList` « Sur une page », 1 200px:

| State | Ground | Arrow opacity | Name width |
|---|---|---|---|
| Rest | white | 0 | 49px |
| Hover | `bg-hover` (rgb 249, 250, 251) | 1, 13px from the block's end, `text-subtle` | 49px, unchanged |

The arrow's transition is `opacity 0.1s` on `easing-default`.

The `play` test dispatches four modified clicks (Ctrl, ⌘, Shift, Alt): `select` is not called. A plain click calls it
once.
