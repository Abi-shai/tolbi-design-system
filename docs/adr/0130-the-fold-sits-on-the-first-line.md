# ADR-0130 — The fold sits on the first line

**Date:** 2026-11-08
**Amends:** ADR-0099, ADR-0128 (`MapPanel size="lg"`'s head)
**Source:** etolbi — an ARR eligible zone, tab Parcelles: `#header` holds the `Tabs`, then a search (`InputField sm`)
that must stay while the list scrolls. The head was a centred flex row, so the fold centred on the whole header and
fell between the tabs and the search.
**Status:** Accepted

## Decisions

- **A head of its own is a grid**: the fold and the **first** child of `#header` share the first line, the fold centred
  on it — on the tabs, whatever follows. **Every later child takes the head's whole width**, under the fold too. The
  header box is `display: contents`, so its children are the grid's: they must be **direct children** of `#header` (a
  wrapper around both would be one child, on the first line).
- 8px between the fold and the tabs (as before), 12px between lines (`spacing-lg`). Without `collapsible` there is no
  fold column, so nothing is indented. ADR-0128's untabbed head (the fold, then the title) is the same grid with one line.
- Measured: fold centre = tabs centre (52px), the search 16 / 16px from the head's edges; the tabbed and untabbed
  panels without a search unchanged (fold centre = first line's centre).
