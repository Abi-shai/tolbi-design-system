# ADR-0219 — Entering a GIS project, without a transition

**Status**: accepted (the owner, 18 Nov. 2026). This supersedes ADR-0217 for the product's entrance.

## Context

After trying `reveal` in 0.168 (ADR-0217: the map alone, then the bar opening its height), the owner retained something
else: **from the list, the GIS system is discovered all at once**. The map, its instruments and the project's bar
appear together, with no animation. Only the exit keeps a transition (`rise`, ADR-0218).

The product had laid this out in `app.vue` while waiting for the package. In doing so it measured, frame by frame, that
the app's bar hidden with `visibility: hidden` still held its 48px and pushed the map down for one frame.

## Decision

`BarTransition` gains **`variant="none"`**: a cut, both ways.

- **The leaving bar** takes `display: none` from `leave-active`, with no transition. It is gone at once and takes no
  room for the frame in which Vue still keeps it.
- **The arriving bar** gets classes that carry nothing, so it is simply there: no slide, no opening, no hold.

The variant in force when the bars swap decides **both** the leave and the arrival. The product passes
`:variant="inProject ? 'none' : 'rise'"`:

- into a project, `none`, and both bars cut;
- back to the list, `rise`, and both move up (ADR-0218).

`reveal` and `hold` stay in the package, though the product no longer uses them.

### Unchanged

- **The exit** (`rise`): the project's bar rises out, and the app's bar comes up 8px.
- **The map's instruments** are already in their place under the bar from the entry on (`--ds-map-overlay-top`), so
  nothing moves.

## Measured

Filmed every animation frame on entering (Storybook, Chromium):

| Frame | App bar | Project bar | Map top |
|---|---|---|---|
| Before the click | in place | — | 72 |
| The first frame after the click | `display: none` | 56px high, at y 0, opacity 1 | 0 |
| Every later frame | gone | unchanged | unchanged |

Nothing moves after the first frame.

The exit, re-filmed, is unchanged: the project's bar rises out, and the app's bar goes from +8px to 0 starting at
100ms.

## Consequences

The product passes `:variant="inProject ? 'none' : 'rise'"` and removes the `.app-bar.ds-bar-leave-active` and
`.app-gis-bar.ds-bar-enter-*` rules from `app.vue`.
