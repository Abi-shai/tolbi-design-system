# ADR-0109 — A card holds its own text

**Date:** 2026-11-05
**Amends:** ADR-0038 (« nothing wraps »)
**Source:** etolbi's feedback on 0.88 (`/dmrv`, real data): two figures overlapping, a name cut with no way to read it,
a chip cut mid-word. The owner, the same day: the name stays **one line**, in ellipsis; no « + » before a gain.
**Status:** Accepted

## Context

At 280px each figure column is **106px**. « +166 610 » in `heading-lg` is 84px, its unit 35px: the pair (123px) ran
out of its column into the next figure, because the value was `nowrap` with nothing to stop it. The name was cut on
one line with nothing to read it whole — the owner's own « FPH — Agroforesterie cacao » is cut at 206px. The identity
line was `overflow: hidden`, so a third chip was sliced (« Référenc »).

## Decisions

- **A figure and its unit hold one line, and never run into the neighbour: the figure is `heading-md` on every card
  of every module** (was `heading-lg`). At 20px « 166 610 tCO2e » was 114px in a 106px column; at 16px it is 99px. The
  pair keeps its baseline, and the « — » of a figure not there yet takes the same role (ADR-0105: the type of the value
  it stands for). The card loses 4px (296 → 292 with a module mark, 300 → 296 with a zone mark; loading matches). No
  ellipsis on a number — a cut number lies. Past ~12 characters with a unit the product writes it compactly.
  Three forms were shipped and reversed the same day: the unit **wrapped** under the number only when it did not fit
  (one card had a unit under and a unit beside — « il faut standardiser »); the unit **always** under, its line held by
  every card (+16px — « trop condensé » for the block below); the card **stepping down to `heading-md` only when it
  overflowed** (two sizes in one grid — « faut le faire partout »). One size everywhere is the rule.
- **The name keeps one line, in ellipsis** (the owner's call — two lines at 20px were drawn, cost 16px and still cut
  « FPH — Agroforesterie… »). **A cut name is given whole in a `Tooltip`**, only when it is cut (ADR-0069's rule), anchored
  on the title: the title's overlay covers the card, so pointing anywhere on it, or focusing the title, asks for it.
  The full name is already the control's text, so it is not added as a description.
- **The identity line says where the project is — the region, and nothing else** (the owner: no reference year, no
  type). Defensively, it **shows whole chips only**: the chips that fit are shown, the rest counted **`+N`** — the crops'
  legend rule (ADR-0038). They are measured whole in an invisible copy and fitted on resize; the counted ones stay in
  the list, visually hidden, so a reader hears every one. Only a first chip longer than the line takes an ellipsis.
- An anchored `Tooltip`'s one-line title **wraps inside its 20rem cap** instead of running out of its bubble.
- A gain carries **no « + »**: the word *gain* already says it. The product's formatting, recorded here because the
  stories write it.
