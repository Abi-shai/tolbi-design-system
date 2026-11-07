# ADR-0126 — A row that holds an action

**Date:** 2026-11-07
**Amends:** ADR-0086 (`OptionCard`)
**Source:** etolbi — the documents of an ARR report (Rapport de 2026, Points du projet et de contrôle, Méthode, PD
pré-remplie, Dossier auditeur): each row is a file to download, not a place to go, and the chevron said navigation.
**Status:** Accepted

## Decisions

- **A third kind of row.** `OptionCard` was a choice (in an `OptionList`) or a row that leads (`href` / click, a
  chevron). With **`actionLabel`** it is **a row that holds one action**: the row stops being a control — a `<div>`,
  no link, no button, no hover contour, a default cursor — the chevron gives way to the action, and **the focus goes
  to the action** (one Tab stop per row). An action wins over a choice: a row is a choice or carries an action, never
  both, so it is not for an `OptionList`.
- **Props, not a slot** — `actionLabel`, `actionIcon`, `actionLoading`, emitting `action` (`MapStatus`'s and `Toast`'s
  shape). The component draws the control so it has **one shape**: `Button` `secondary-gray` `sm`, at the row's end
  on its top line (its top on the title's — measured 0px). A slot would let a second shape in (ADR-0112's lesson).
- `disabled` greys the row and the button; `actionLoading` is the `Button`'s own loading — it keeps its width
  (ADR-0027) while the file is made. The button is **named by its word and described by the row** (`aria-describedby`
  → the title and the sentence), so five « Télécharger » in a list each say which file.
