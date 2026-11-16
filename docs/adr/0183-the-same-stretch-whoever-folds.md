# ADR-0183 — The same stretch, whoever folds the panel

**Status**: accepted (etolbi, 16 Nov. 2026). This amends ADR-0182's scope.

## Context

The product folds the reading panel through `v-model:collapsed` when a sheet opens from the map, to make room, and
opens it again when the sheet closes. ADR-0182's shell ran only on a press of the fold, so both of those cases kept
the old swap and its 10px jump.

## Decision

**The surface takes the same transformation whoever changed `collapsed`.** That covers a press of the fold and a
product setting the model, and gives the same timing:
- the capsule ↔ panel shell over `considered`;
- the content fading;
- reduced motion's fade in place.

**What is drawn follows the model through one change, not directly.**
- A private `shown` state drives the template.
- A watcher on `collapsed` sends every change to it, in a queue: a change asked for while the surface is still
  moving waits for it, then goes to wherever the model stands by then.
- The fold button only sets the model. Its fold position is measured when the change starts, whoever asked.

**The focus still follows a press only** (ADR-0062). The model folding the panel leaves the reader's focus where it
was: on the parcel they clicked.

The panel at the end corner keeps the swap (ADR-0182's limit).

`Données/Map` « Sélection d'un objet » now shows the case: its panel folds when a parcel or a place opens a sheet,
and comes back when the sheet closes.

## Measured

**`Données/Map` « Sélection d'un objet », frames every 45ms**

| Gesture | Shell | Button |
|---|---|---|
| A sheet opens, the product folds | 24,24 394 × 783 → 26,25 → 29,26 → … → 35,29 53 × 55, then the capsule | (41, 35) on every frame |
| The sheet closes, the product unfolds | 35,29 55 × 59 → 34,28 → … → 24,24 399 × 793, then the panel | (41, 35) on every frame |

**`Données/Map` « Écran SIG »**
- The press on the fold still stretches the shell: 399 × 793 → 54 × 57, and back.
- The focus goes to « Afficher le panneau Baseline » after the fold, and to « Replier Baseline » after the unfold.
- Under reduced motion, the new form fades in place.

In the selection story the focus stays on « Parcelle P-2041 », the parcel that was clicked.
