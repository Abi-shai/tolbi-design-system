# ADR-0178 — The folded panel is its button alone

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0173 §5.

## Decision

ADR-0173 (0.145) put the panel's title beside the folded panel's button. **The owner had not asked for it, and it is
removed.**

**Folded**, a `MapPanel` with its own head (`lg` or `#header`) shows only its button:
- the same `IconButton sm subtle` as the open head, 36px;
- on the same pixel;
- in its capsule of pilot glass (`radius-surface` since ADR-0177), which now hugs the button alone: 8px around it,
  **54 × 54**.

The panel's name stays in the button's accessible name: `expandLabel` followed by the title (« Déplier Baseline » by
default, « Afficher le panneau Baseline » in the « Écran SIG » story). A reader hears the name; nothing writes it.

The press on the title is gone with the title; the button alone reopens the panel. A small panel keeps its titled
`Button` (ADR-0099).

## Measured (`Données/Map` « Écran SIG »)

| What | Value |
|---|---|
| Open fold button | (41, 42, 36 × 36) |
| Folded button | **(41, 42, 36 × 36)**, the same pixel |
| Capsule | 54 × 54, no text in it |
| Folded button's name | « Afficher le panneau Baseline » |
| A press on the button | reopens the panel |
