# ADR-0218 — Leaving a GIS project, both bars move up

**Status**: accepted (the owner, 18 Nov. 2026). This amends ADR-0216's exit.

## Context

In 0.167, leaving a GIS project (« Retour » to the list) made the project's bar rise out while the app's bar came
**down** from the top. The two moved in opposite directions, and the passage did not read as natural.

## Decision

There is **one movement, upwards**:

- **The project's bar** rises and fades as before (`enter`, `easing-in`).
- **The app's bar** comes **up 8px** as it fades in:
  - `translateY(spacing-md) → 0` and `opacity 0 → 1`;
  - over `process` (300ms), on `easing-out`;
  - **one `quick` (100ms) after** the leaver starts.

This is `SwapTransition rise`'s mechanism, and the two bars travel the same way.

The app's bar only ever enters in this case, because it is otherwise always there. So this is now `BarTransition`'s
**default arrival**: `variant="rise"`.

- `slide`, its 0.167 name, is still accepted and read as `rise`, so a product that passes it gets the new arrival.
- The entry into a project is unchanged: `reveal` (ADR-0217).
- Under reduced motion it is immediate.

## Measured

Filmed every animation frame on leaving (Storybook, Chromium):

| Time | Project's bar | App's bar |
|---|---|---|
| 0 → 100ms | rises: −13.4px at 104ms, opacity 0.76 | holds, invisible, at +8px |
| 100 → 204ms | goes on rising: −48.7px at 204ms, then gone | opacity 0.11 at 129ms, 0.62 at 204ms |
| 204 → 404ms | — | goes on rising, at 0 (opacity 1) at 404ms |

The app's bar rises 8 → 7.15 → 4.07 → 0.74 → 0. Both translations only decrease: one direction throughout.

## Consequences

The product passes `:variant="inProject ? 'reveal' : 'rise'"`. `'slide'` still works.
