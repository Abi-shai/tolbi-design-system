# ADR-0204 — The capsule's end: a column at its right edge

**Status**: accepted (the owner, 17 Nov. 2026). This replaces ADR-0203's « date · badge » line; the rest of
ADR-0203 stands (the identity up to 15rem, the exact lap).

## Decision

The owner looked at the real capsule of each module and retained this form for the capsule's end:

- **A column at the capsule's right edge**: `flex-direction: column`, `align-items: flex-end`, centred vertically,
  and `margin-left: auto` so it sits against the edge whenever the capsule is wider than its content.
- **The status badge on top, the information under it**, both aligned right, `spacing-xxs` (2px) apart:
  « [Terminé] » over « 2026 », « [Collecte en cours] » over « Dernière saisie il y a 2 h ».
- **Without a badge** (ID, Inset, INA), the information alone, aligned right as well.

## Measured (`Données/ModuleBanner`, the product's five capsules)

| What | Value |
|---|---|
| The column | 12px from the capsule's right edge (its padding), centred to the pixel on a 60px capsule |
| With a status | the badge at top 9, the information at top 31, both flush right |
| Without a status (ID) | the information alone, at top 20, flush right |
