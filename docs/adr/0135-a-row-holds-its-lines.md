# ADR-0135 — A row holds its lines

**Date:** 2026-11-08
**Source:** etolbi — the parcel lists of the dMRV and ARR panels (`OptionList layout="stack"` in a `MapPanel lg`): a row
is the parcel's code, a sentence (« Traoré Moussa · Djoutougbo 2 ») and a meta (« 17,5 ha »). A long sentence took two
lines and its row stood taller than its neighbours: the list lost its rhythm.
**Status:** Accepted

## Decisions

- **`OptionCard` takes `descriptionLines` and `labelLines`** (numbers, unset = wraps freely). The caller decides,
  because the same card is a list row in one place and a card with room in another.
- **One line is cut at the edge** (`nowrap` + `text-overflow: ellipsis`), not by `line-clamp`: a clamp breaks the line
  before the word that does not fit and leaves the rest of the line empty — « Koné Aminata Fatoumata ·… » with a third of
  the line unused. Two lines and more use `line-clamp`.
- **A cut line asks for no width** (`flex: 1 1 auto; width: 0`): unbroken, it reported its whole length as the card's
  minimum and the list grew past its 23rem — ADR-0133's defect, in a row.
- **The whole text stays.** The clamp is visual: the title and the sentence keep their ids, so the radio is still named by
  the whole title and described by the whole sentence. On hover an anchored `Tooltip` gives it back, **only when it is
  cut** (ADR-0109) — measured on width for one line, on height for several, re-measured on resize and when the text or the
  count changes. A sentence that fits is never said twice.
- Measured in a 23rem stack of four parcels with `descriptionLines: 1`: every row 76px, the list 368px, two sentences cut
  (526 → 256px, 482 → 256px), the tooltip on those two and on neither of the others.
