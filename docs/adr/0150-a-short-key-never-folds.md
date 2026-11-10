# ADR-0150 — A short key never folds

**Status:** accepted — 10 Nov. 2026 (etolbi, 0.125)

## Context

On an eligible zone's map the key by category has two entries, « Éligibles » and « Non éligibles ». Between the
`MapPanel` and the navigator, on a mid-size window, `MapLegend` (ADR-0137) folded the second into « +1 »: the key
said one colour of two, and the reader took it for another version of the map. « +N » was written for long keys
(the cockpit's symbols, ADR-0138), where folding the tail costs a detail; on a short one it costs the meaning.

## Decision

**Up to three entries, a key never folds.** When the line lacks room it gives way in this order:

1. **its spacing** (`--tight`) — the entries 8 apart instead of 12, the line's parts 4 instead of 6;
2. **its title and rule** (`--bare`) — « Parcelles » and the rule go; the title is still read, in the key's name
   (« Parcelles : Éligibles 219, Non éligibles 21 »). A title that is a chip — a choice of indicators — is a control
   and stays;
3. **the entries' words**, cut with an ellipsis, the figures whole — never an entry dropped.

Past three entries « +N » folds the tail as before. The legend now also watches **its container**: a key that hugs
does not grow when room comes back, so only the container can say a tight or bare line may open again. One pixel of
slack — measured widths are fractional, and a line that fits to the pixel fits.

## Measured

`Données/Map/Legend` « Légende courte », « Éligibles 219 · Non éligibles 21 » in a container of: 560 → at rest
(351px); 346 → tight (343); 330 → bare (270); 230 and 180 → bare, the words cut; back to 600 → at rest. No « +N » at
any width — a `play` test, mutation-checked (with the short rule off, it fails). The long key of « Par catégories »
still folds into « +2 ».
