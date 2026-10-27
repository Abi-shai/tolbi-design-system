# ADR-0090 — A header the page keeps

**Date:** 2026-10-27
**Extends:** ADR-0080 (`Table`, `Pagination`), ADR-0001 (one drawing of the header row)
**Source:** etolbi, EUDR items 35 and 36 — « Table : un en-tête de colonnes collé à l'écran » and
« Pagination : afficher “1–25 sur N” sans le sélecteur “Lignes par page” ». Both are the conclusions of the
table benchmark already drawn in Figma (`3182:1427`, section 4): the table keeps the height of its content and
scrolls with the page, the column header stays at the top of the screen past a dozen or so rows, and the
page-size selector goes (9 products of 17 carry none; NN/g calls it superfluous; a choice made in a foot is not
remembered).
**Status:** Accepted

## Decisions

### 35 — a sticky header cannot share a scroll container with the body

The product's diagnosis was right and the measurement says why. A `position: sticky` element resolves its
offsets against the **nearest ancestor scroll container**, whichever axis that container scrolls; the horizontal
scroller `Scrollbar` puts around the table is one, and it never scrolls vertically — so a sticky `<thead>` is
already where it would be stuck, and stays with the table. Probed in Chromium on the real component, scrolling
the page 300px:

| the viewport around the table | computes to | header pinned? |
|---|---|---|
| `overflow-x: auto; overflow-y: hidden` (today) | `auto` / `hidden` | no — it travelled the full 300px |
| `overflow-x: auto; overflow-y: clip` | `auto` / **`hidden`** | no |
| `overflow-x: auto; overflow-y: visible` | `auto` / **`auto`** | no |
| `overflow: visible` | `visible` / `visible` | **yes** — and the table is then simply cut off |

The last two rows are the old rule that `visible` beside a scrolling axis computes away; `clip` normalises to
`hidden` the same way. So there is no stylesheet that gives one `<table>` both a header pinned to the page and a
horizontal scroller of its own.

**So the pinned header is a second drawing of the row, outside that scroller** — the shape Ant Design ships and
the only one that holds. What we refuse is a second *markup*: the header row became **`TableHeaderRow`**, an
internal component rendered twice, once in the table and once in the copy (ADR-0001 — a pattern the catalogue
owns is imported, never redrawn). The copy is `aria-hidden`, its controls take `tabindex="-1"`, and `aria-sort`
stays on the real header: a reader meets the row once, Tab lands on the real one, and the browser scrolls it
back into view. Clicking a sort in the copy sorts — measured, ascending then descending.

**The copy carries the body's `scrollLeft`, not a transform.** A transform would move the pixels and leave a
fixed column with nothing to stick to; a real scroll offset means `position: sticky; left` inside the copy
behaves exactly as it does in the body. Measured with the body scrolled 400px: the frozen column's left edge is
at 25px in the body, in the real header and in the copy alike.

**The copy and the scroller share one grid cell** (`.ds-table__frame`), so the copy covers the header it repeats
instead of claiming a second row of height — measured 0.00px apart on all three of top, left and height at
rest — and its sticky containing block is that cell, so it leaves with the last row instead of floating over
what comes after.

**A measured width is a border-box width.** The copy's cells are cut to the widths measured on the real row, and
read them as `border-box` — content-box made every column its own padding wider, **48px each, accumulating
across the row** until the last column sat 288px off. With the box right, all eight columns land at 0.00px.

**The frame is `overflow: clip`, not `hidden`.** Both cut the table to its radius; only `hidden` makes a scroll
container, and a scroll container between the header and the page is the whole defect. This is the one line that
had to change outside the new code.

**The offset is the product's**: `--ds-table-sticky-top` (public, so semver covers it — ADR-0010), default
`0px`, set to the height of whatever the product keeps at the top of the screen. The package cannot know it.

The edge of a fixed column — a rule shown only while something passes under it (ADR-0080) — was read off
`Scrollbar`'s own `--at-start` / `--at-end` classes, which the copy is outside of. Both drawings now read it from
the row's props, so the two headers say the same thing; the body cells keep the ancestor rule.

### 36 — the range and the selector are two things

`pageSize` wrote the range *and* raised the selector. They are separated: **`pageSize` writes « 1–25 sur 42 »**,
**`pageSizes` offers the choice**, and an empty `pageSizes` keeps the range with no selector under it. The
default stays `[10, 20, 50, 100]` — the benchmark's conclusion is the product's call for its own screens, not a
new default for everyone.

`Table`'s rule for showing the foot said « more than the smallest page », and `Math.min(...[])` is `Infinity`,
so an empty list already fell back to « more than one page » — by accident. It is now written: a size is offered
only when there is a list of them to offer, and without one the foot shows only when there is more than one
page.

## Still open

Nothing in the catalogue reads a scroll container's axes, so the next component that puts something sticky
inside `Scrollbar` will rediscover this by hand. And the pinned copy has not been heard by a screen reader —
`Toast`'s gap (ADR-0052), now `Table`'s too.
