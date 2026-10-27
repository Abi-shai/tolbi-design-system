# ADR-0089 — A document that prints

**Date:** 2026-10-27
**Extends:** ADR-0001 (`DetailRow`, `Table`, `Badge`, `Logo`, `Button`), ADR-0004 (`printer` joins the icons)
**Source:** etolbi, EUDR item 5 — « Report — gabarit de document imprimable (en-tête, sections numérotées, DetailRow,
Table, pied, styles d'impression). DDS ; aussi rapports dMRV, Scan, Baseline. » Figma « ↪ EUDR — Rapport imprimable »
(`3218:1427`), 20 sources, print CSS measured in Chromium 148; validated « on va aller avec tes recommandations ».
**Status:** Accepted

## Decisions

**Track A, sober — as the official DDS is**: a head of one line (the mark, the status `Badge`), the title
(`heading-md`) and its reference and date, a `#summary` for the key facts (`DetailRow`s), then the product's
sections. **`ReportSection`** numbers itself (a CSS counter: 1, 2, 3 — the DDS's numbered fields) in `heading-sm`.
**`ReportSignature`** is Regulation (EU) 2023/1115's Annex II — « Signé pour le compte de / Date / Nom et fonction /
Signature », the statement as its slot, an empty value a line to write on: none of the ten documents benchmarked had
one, the regulation asks for it. The package draws the frame; the content (tables, figures, DetailRows) is the
product's.

**On paper**, A4 portrait with **20mm** margins, as its **own page type** (`page: ds-report`, `@page ds-report`) —
measured, an ordinary page printed beside it stayed Letter with no head or foot, so nothing else the product
prints is touched. From page 2 a running head (title · reference, date), on every page a running foot (`footer`,
« Page n sur N ») — **CSS margin boxes**, which Chrome supports since 131; Firefox and Safari print without them.
The margin boxes read custom properties from the **document's root**, not from the component, so the running texts
are set on `<html>` while the report is mounted and taken back when it leaves. A section's title never ends a page,
table rows, figures and the signature are never cut, a table's head repeats, a badge keeps its colour
(`print-color-adjust: exact`), and a table's cells **wrap instead of ending in an ellipsis** — on paper a cut
cell is a lost figure.

**On screen**, the sheet sits A4-wide on the recessed ground, with « Imprimer » (`Button`, the new `printer` icon)
above it, absent from the paper. The PDF is the browser's (« Enregistrer en PDF », tagged since Chrome 85) or the
product's server's — not the package's. What does not exist in Chrome and is not promised: a running section title
(`string-set`), page cross-references (`target-counter`).

Two defects found by printing: the sheet's screen frame and the button printed, because unscoped print rules lost
to the component's scoped ones (an attribute selector more) — they live in the scoped block now; and the table's
ellipsis cut « Café non torréfié » to « Café n… ».

Verified with Playwright's `page.pdf()` and PyMuPDF: 2 pages, 595 × 842 pt; page 1 without a running head, page 2
with it; « Page 1 sur 2 », « Page 2 sur 2 »; every table cell whole; the badge's tint printed.

## Still open

- The page prints what it holds: a report shown inside the app prints the app around it. A print view of its own,
  or the product hiding its chrome in print, is the product's call.
- A cover page for dMRV and Baseline (track B) is a later option on the same `Report`.
