# ADR-0161 — Actions at the foot's start

**Status**: accepted (etolbi, 12 Nov. 2026)

## Context

`#actions` sets every action at the foot's end. Some actions must stand apart from the others:

- a flow's way back: « Changer de méthode », « Retour » in the zone window, beside « Terminer »;
- a side action: « Recommencer », « Supprimer ».

Two groups, one at each end, is the common foot of a stepped dialog.

## Decision

**`#actions-start`**, a slot at the foot's start, beside `#actions`, which stays at the end.

- **Both are free.** Everything can stay in `#actions`, the case so far, unchanged. A foot without `#actions-start`
  renders exactly as before.
- **The same buttons on both sides**, with the same 8px between them: `.ds-dialog__actions` with a `--start`
  modifier, only the side differs. The order inside each slot is the code's.
- **With a summary** (ADR-0081): the start's actions first, then the summary, then the actions pushed to the end. The
  way back belongs to the foot's edge, where a flow's « back » always is; the summary describes what the end's actions
  will act on, so it stands nearer them. The product suggested this order.
- **Stacked** (the side panel under 40rem): the summary, `#actions` with the main one on top, then `#actions-start`
  under them (`order: 1`). The main action keeps the top, and a way back is not what the thumb should meet first.
- **The centred dialog** keeps its wrapping foot: when the line is short, the end's actions drop to the next line,
  still at the end.

**Read in the DOM order**: the start's actions, the summary, then the actions. Tab meets the way back first, as the eye
does.

## Measured

`Superposition/Dialog` « Actions au début du pied », button offsets in the foot (x, y):

| Case | « Changer de méthode » | Summary | « Annuler » / « Terminer » |
|---|---|---|---|
| Centred `xl`, 1 440 × 900 | 20, 16 | | 736 / 834, 16 |
| Same, with a summary | 20 | 268 | 736 / 834 |
| Side, 1 440 | 20 | | 292 / 390 |
| Centred, 500px wide | first line | | wrapped to the next line, at the end |
| Side, 500px wide (stacked) | under them, 117 | | « Terminer » 17, « Annuler » 63, full width |
