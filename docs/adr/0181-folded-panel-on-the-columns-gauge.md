# ADR-0181 — The folded panel on the tools column's gauge

**Status**: accepted (the owner, 16 Nov. 2026). Since ADR-0179 the tools column is 52px wide with 40 × 40 buttons
at 8px. The folded `MapPanel` kept a round 36px button in a 54 × 54 capsule: two neighbouring controls, two sizes.

## Decision

**The fold button is `IconButton size="md" shape="square"`**: 40 × 40, glyph 20, 8px. It is the column's button.
It is the same button open (in the head) and folded, and it sits on the same pixel: ADR-0173's measured place is kept.

**The folded capsule is 52 × 52**, the column's gauge:
- `radius-surface` (12px);
- the same pilot glass as the column;
- the 40px button centred, 6px from the outer edge on every side (`spacing-sm`, the border counted).

Its offset is that 6px, so the button keeps its pixel.

**The open head does not grow.** The 40px button lends 2px above and below (`margin-block: −spacing-xxs`).
- A head with only a title stays **60** (it was 64 with a plain 40).
- Beside the tabs (44) it changes nothing: **70**.
- With a search under the tabs: **120**.

## Measured

| Story | Open fold | Folded button | Capsule | Head |
|---|---|---|---|---|
| `Données/Map` « Écran SIG » | (41, 40, 40 × 40) | **(41, 40, 40 × 40)**, 8px | 52 × 52 | 70 |
| `Données/Map/Panel` without tabs | (33, 27) | (33, 27) | 52 × 52 | 60 |
