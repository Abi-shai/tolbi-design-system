# ADR-0162 — The Inset module mark, derived by subtraction

**Status**: accepted (etolbi, decided 12 Nov. 2026)

## Context

The module shown today with the « Carbone » mark (permission DMRV) becomes **insetting**. An agro-industrial company
measures each year the carbon its own supply chain absorbs — its suppliers' parcels — and declares it in its Scope 3.
Offsetting, crediting and selling stay with ARR, whose mark is « Forest ». The product asked for a `ModuleName`
« Inset » in the family, about suppliers' parcels and what they absorb, with no credit and no market. « Carbone »
stays until the product has moved.

## Decision

**Three tracks** were drawn from the family's own pieces, each swapping its sign for a single ↓, carbon going into the
parcel:

| Track | Built from | Trade-off |
|---|---|---|
| A | Forest's fields | twins Forest |
| **B** | Redd+'s trees, the Carbone family | **chosen**: the continuity of today's mark |
| C | Yield's crops | twins Yield |

**Derived by subtraction.** A module mark is a drawing exported from the brand file, never authored in code (ADR-0005).
The Figma connector was read-only on 12 Nov. on both files, and the product asked to go ahead in code. So `Inset` is
**Redd+'s export with its ↑ removed**: the same trees, the same ↓ at the family's own stroke, the group renamed
`Module=Inset`.

- **No vector is added, moved or redrawn.** An earlier preview recentred and thickened the ↓; the subtraction was
  kept instead because it authors no coordinate.
- **It holds both variants**, the illustration and the logo on its tile.
- **The generator owns the derivation** (`derive: { from, drop }`), so the output stays build output. It **fails** if
  either dropped path is not found exactly once: a re-exported Redd+ that changed would otherwise silently yield a
  wrong Inset.

**`Carbone` stays** in `ModuleName` until the product has moved to `Inset`. Adding a name breaks no consumer.

## Still open

- **The brand file** needs `Module=Inset` in « Module illustration » and « Modules logos ». Once it is there, export it
  to `scripts/module-art-raw/*/inset.svg` and delete `derive`. The drawing may then be refined, for instance the ↓
  recentred over the yellow tree.
- **Inset and Redd+ differ by one arrow**, as Carbone and Redd+ differ by their sign. That is the family's grammar, and
  the cost of B.
