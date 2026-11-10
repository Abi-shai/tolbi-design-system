# ADR-0151 — A masked row keeps its action

**Status:** accepted — 10 Nov. 2026 (etolbi; the owner's frame, Figma `4104:2850`, « Retenu »)

## Context

In an eligible zone's « Parcelles écartées » (ADR-0148), each exclusion reason has an eye that **masks** its parcels
on the map, reason by reason. The owner's frame: the masked row takes the disabled look — « le pâle du grisé » —
while its crossed eye stays sharp, because it is what brings the parcels back. `OptionCard disabled` greys the whole
card **and** disables the action: once masked, nothing could unmask.

## Decision

**`OptionCard muted`** — the media fades (0.4: it is decorative), the title, sentence and meta take
`text-disabled`; the card's ground, edge and geometry do not move, and the action stays live and sharp. Not
`hidden`: that is the HTML attribute, and it would remove the card. `disabled` wins over `muted` when both are set.

**The action's glyph and name are the product's to turn**, as with every `OptionCard` action (ADR-0126/0127):
`eye` → `eye-off`, « Masquer Contour invalide » → « Afficher Contour invalide ». **No `aria-pressed`**, against the
request: WAI-ARIA's toggle button pattern is one *or* the other — a name that changes, or a fixed name with a
pressed state. Both together announce « Afficher Contour invalide, enfoncé », which says the opposite of what is
on the map, and the tooltip — the same name — would contradict the glyph for a sighted user if the name stayed
fixed. A name that says the next action is the one both readers and eyes get right.

## Measured

`Structure/PanelBlock` « Zone éligible »: the row 374 × 86px before and after, ground `rgb(255, 255, 255)` and edge
`rgb(234, 236, 240)` unchanged; a `play` test presses « Masquer Contour invalide », finds « Afficher Contour
invalide » enabled on a `--muted` row, presses it back.
