# ADR-0142 — A closable panel keeps its name

**Date:** 2026-11-09
**Amends:** ADR-0099 (`#header` replaces the title line), ADR-0130 (the head's grid), ADR-0139 (`closable`)
**Source:** etolbi — a parcel's sheet (`MapPanel lg closable` with tabs in `#header`) showed no title: `#header` replaces
the title line, so `title` was only heard in the close's name (« Fermer … ») and the product had to write it again in
`#header`.
**Status:** Accepted

## Decisions

- **A closable panel with a `title` and a `#header` keeps its title on the close's line, and `#header` goes under it**
  at the head's whole width (the fold, if any, stays first on the line). Derived, not a prop: a panel the reader opened
  and closes is about **one thing**, and its name is what tells which sheet is open; the screen's reading panel (not
  closable) is named by the screen, so there `#header` is still the head, as ADR-0099 decided.
- Measured: title and close centred on one line (0px apart), the tabs under it at 366px; the cockpit's reading panel
  without a close is unchanged (no title, tabs at 322px).
