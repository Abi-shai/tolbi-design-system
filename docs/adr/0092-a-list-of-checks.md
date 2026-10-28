# ADR-0092 — A list of checks

**Date:** 2026-10-28
**Extends:** ADR-0006 (a tone never carries the meaning alone), ADR-0032 (the on-tint partner on
`bg-default`), ADR-0088 (a rule between, never around)
**Source:** etolbi, EUDR item 43 — « StatusList / StatusRow : une liste de contrôles, une ligne par
contrôle (icône d'état 16 + libellé + mot du statut à droite), quatre états… Le statut se lit par l'icône,
le mot et la couleur, jamais par la couleur seule. » Board « ↪ EUDR — Liste de contrôles · Benchmark et
pistes » (`3287:1427`), three tracks drawn in both modes; **track A validated**.
**Status:** Accepted

## Decisions

**Track A: the glyph, the name, and the word in the tone's ink** — no chip. B put a `Badge` after the
glyph and said the same thing twice; C dropped the glyph so the badge carried it, and with it went the
column of aligned marks the eye scans. The benchmark points the same way: **GOV.UK's Task list writes the
settled state as plain text** and tags only what needs an action; NSW, USWDS, Proximus and SAP Fiori all
make the icon optional and the **word never**; Linear and GitHub lead the row with the state glyph.

**It is a `<dl>`.** The check's name is the term, its state the definition — so the two are associated
without an `aria-describedby` to carry it, which is what GOV.UK needs because its rows are links. Those
are `DetailRow`'s own semantics and deliberately **not** `DetailRow`: there the label recedes
(`text-subtle`) and the value stands out, and here it is the other way round — the check is the content,
the verdict its answer. And `DetailRow` has nowhere to put a leading glyph.

**Measured, the obvious ink fails.** On `bg-default` in light, `text-success` is **3.906:1** and
`text-warning` **3.486:1** — under AA for a word. Their on-tint partners are **5.691** and **5.427**, and
in dark the two are the *same value* (6.031 / 7.089 / 5.972 either way). So the word and its glyph take
`--ds-text-on-{tone}-subtle`, which is ADR-0032's rule — *a tone-coloured figure on `bg-default` takes the
on-tint partner* — applying for the second time, now with the numbers that make it a rule rather than a
note. `neutral` keeps `text-subtle` (7.687 / 7.407): the absence of a verdict recedes instead of claiming
a colour.

**The word is the product's and it is required.** `status` has no default, because « En attente » and
« Non analysé » are two facts under one tone — a component that picked one would be deciding what the
product knows. The **tone picks the glyph** (`circle-check` / `triangle-alert` / `circle-x` / `circle`)
and the ink, and there is **no override**: a consumer free to swap the glyph is free to break the very
pairing ADR-0006 exists to keep.

**A rule between the rows, never around them** (ADR-0088) — `.ds-status-row + .ds-status-row`, so no
hairline comes to rest against the bottom of whatever holds the list, which is what `DetailRow`'s
per-row `border-bottom` does. The glyph sits in a `1lh` box, so it stays on the first line when the name
wraps (measured: a three-line name, the mark 0px off the first line's centre); the word never wraps.

## Still open

The row leads nowhere. GOV.UK makes the whole row a link because a task is something you go and do; an
EUDR check is a fact. A DDR's checks may want it, and that is the day to decide — not before.
No screen reader has heard it (the `Toast` and `Table` gap, ADR-0052 and ADR-0090).
