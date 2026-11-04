# ADR-0098 — A window of data

**Date:** 2026-11-04
**Extends:** ADR-0075/0079 (`Dialog` and its sizes), ADR-0090 (`Table`), ADR-0024 (`Tabs`)
**Source:** ARR · Dynamic baseline, « Toutes les données » (`3610:9048`, four tabs, 1312 × 820 on 1440);
brief items 4, 6, 7, 14. Lot 3.
**Status:** Accepted

## Decisions

**`Dialog size="2xl"`** — 82rem, a ceiling like the others (`full` would fill a 1920 screen edge to edge). It
also takes the **full height**, so changing what the window shows never resizes it: four tabs measured 656 to
1034px tall in the drawing, and a window that jumped on every tab would be the defect.

**`#nav`** — between the head and the body, fixed; the body scrolls under it. What a body is navigated by
(`Tabs`) has to stay in reach. The rule under the head is the nav's, and the body follows without a second.

**No foot.** A window that only reads closes with × and Escape; a « Fermer » beside them was a second way to
do one thing, and cost 72px of height. `Dialog` already draws a foot only when it has actions — the product
simply gives none.

**`Tabs` names its panels.** It was a tab list with no panels — a tab said it was selected, not what it
showed. `id` ties tab `{id}-tab-{value}` to panel `{id}-panel-{value}`, and **`TabPanel`** renders the panel
(`role="tabpanel"`, labelled by its tab, focusable) wherever it lives — under the list, or in a `Dialog`'s body
while the list stays in `#nav`. Found on the way: `.ds-tabs` was `width: 100%` plus its border and padding in
`content-box`, **10px past its box** everywhere it filled a width; `border-box` now.

**`Table`** — a column can be **`numeric`**: right-aligned, tabular, and **6rem** wide at least unless a width
says otherwise — a narrow figure column printed « 0,… ». **`framed: false`** for a table inside a surface that
draws its own frame (a `Card`, a `SectionCard`): no second border, radius or shadow.
