# ADR-0055 — The card loses its banner

**Date:** 2026-10-06
**Amends:** ADR-0038 (the anatomy opened on a snapshot; `error` was the snapshot's failure),
ADR-0041 (the media corner it declined is gone)
**Supersedes:** ADR-0040's frame and `#snapshot` slot (its `17.5em` ceiling stands)
**Source:** the product: generating a map snapshot per project is more than its backend can carry.
Exploration board in Sprint 18, `2278:7785` (page « Onboarding explorations »); track A was chosen
the same day.
**Status:** Accepted
**Breaking:** `snapshot`, `snapshotAlt`, the `#snapshot` slot, `emptyLabel` and `state: 'error'` are
removed.

## Context

`ProjectCard` opened on a 128px banner: a map snapshot of the project, framed on the union of its
geometries (ADR-0038). Two controls sat on top of it: the status pill in the top-left corner and the
hover menu in the top-right. The product cannot afford one snapshot per project, so the banner has
to go, and with it the place those two controls lived.

## Decisions

### Three tracks, and the corners are kept

Three tracks were drawn on the page's ground, in both modes, from the real variants with the banner
removed:

- **A** keeps both corners in a head row: the pill on the left, the menu on the right. The card is
  298px tall.
- **B** moves the pill down to the footer, beside the date. The card is 272px tall, but on hover the
  menu, still in the corner, covers « Projet démo » on the title's line.
- **C** turns the status into a word of the identity line (`● En cours`). The card is 264px tall,
  but the line overflowed (« Casamai… ») and the hover menu covered the demo badge too.

**A was chosen.** It is the only track where nothing overlaps, and the status stays where a grid is
scanned first.

In code, the card's body takes `spacing-lg` all round; it used to start flush under the banner. A
head row holds the `md` Badge. The menu has not moved: it stays last in the DOM and is placed against
the card, 12px from the top and the right, so on hover it fades in exactly where it did before.
Measured: **378 → 296px**, the same height in all four states. The pill sits at (12, 12), the menu's
right edge at 12px, and the title starts 10px under the head.

### What the banner took with it

- **The contrast risk ADR-0038 named.** The pill and the menu stood on an arbitrary photograph, and
  neither was guaranteed a ground. They now stand on `bg-default`, a ground the card owns (ADR-0006).
- **`error`.** It was the snapshot's failure, not the project's. With nothing to fetch, nothing can
  fail, so the state goes. `state` is now `planned | running | done | loading`.
- **`snapshot`, `snapshotAlt`, `#snapshot` and `emptyLabel`,** with the frame that listened to its own
  `<img>`. ADR-0040's slot and frame have nothing left to frame.

### Loading holds the head

While loading, the card still carries neither pill nor menu: the wait says nothing (ADR-0038). But
the head row stays, with a skeleton bar of the pill's size — 68 × **20**, the `md` badge's own
height. At 24, the size the board drew, the content would have risen 4px on arrival (measured). The
bar takes the default emphasis and `inner-sm` corners, like every placeholder; a placeholder does not
borrow a control's radius.

### Figma follows

The `ProjectCard` set (`1488:4799`) was brought to the code the same day:

- eight variants, each with the head row and the menu in its corner;
- the 32px module mark on every loaded variant — it had one, carrying Source's artwork on a Yield
  card;
- the demo badge bound to `Projet démo` on every variant — Scan's ignored the property;
- the two `Erreur` variants deleted, after checking that no instance of them existed anywhere in the
  file.

One defect surfaced while doing it: the first variant rendered with its content laid over the head
until a relayout was forced. The structure was right and only the render was stale — ADR-0039's
lesson once more: read the pixel, not the property.

## Still open

- The pill's centre sits 6px above the menu's: 20px against 32px, both top-aligned at the corner
  inset. This was the banner's arrangement too, and the menu only shows on hover.
