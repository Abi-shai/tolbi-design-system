# ADR-0002 — Motion Principles

**Date:** 2026-06-09
**Status:** Accepted

## Context

Motion tokens were introduced pragmatically to replace hardcoded durations, but the token naming and easing values did not reflect Tolbi's brand identity. The voice and tone document (Confluence: spaces/Design/pages/721147) defines four brand voice traits that translate directly into motion behaviour.

## Brand voice → motion

| Voice trait | Motion expression |
|---|---|
| **Compétent et précis** | The interface responds before you finish the gesture. State changes are immediate and exact. |
| **Concret et orienté décision** | Motion serves the decision, not the aesthetic. No decorative choreography, no staggered list entrances. |
| **Engagé, sans être moralisateur** | No spring, no bounce, no fanfare. The voice doc calls out *faux enthousiasme* as a trap — it applies to motion too. |
| **Ancré africain, ouvert au monde** | Grounded, weighted deceleration. Things settle with gravity, they do not float or overshoot. |

## Decision

### Duration tokens — named by semantic intent

| Token | Value | Intent |
|---|---|---|
| `instant` | 50ms | Imperceptible confirm — press states, focus rings |
| `quick` | 100ms | Immediate feedback — responds before you finish the gesture |
| `moderate` | 150ms | State changes that communicate meaning — buttons, toggles, inputs |
| `enter` | 200ms | Entering elements — the interface makes room |
| `process` | 300ms | Data in motion — progress bars, calculations |
| `considered` | 400ms | Heavy surfaces — modals, drawers, destructive confirmations |

The `considered` duration for destructive confirmations is intentional: the extra time communicates gravity without a single word.

### Easing tokens

| Token | Value | Intent |
|---|---|---|
| `default` | `cubic-bezier(0.25, 0, 0, 1)` | Grounded — immediate start, smooth deceleration. State changes. |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit — accelerates away. The interface steps aside. |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter — decelerates into position. The interface makes room. |
| `in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Spatial — lateral movement. Tab indicator, drawer slides. |

`default` was changed from CSS `ease` to `cubic-bezier(0.25, 0, 0, 1)`. CSS `ease` has a subtle ease-in at the start — it hesitates. The brand responds immediately then settles.

### Enter/exit asymmetry

Entering elements use `enter` (200ms) + `easing-out`. Exiting elements use `moderate` (150ms) + `easing-in`. The interface makes room for you when you arrive; it steps aside efficiently when you leave.

Applied to: HelpIcon tooltip, Dropdown panel. Future: Tooltip, Modal, Drawer, Combobox.

### Progress fill

ProgressBar and ProgressCircle use `easing-out` on fill — data decelerates toward its final value. `easing-default` on a progress fill creates a fake ease-in that hides real progress, which conflicts with the "concret et orienté décision" voice trait.

## Hard constraints

1. **No shake on error.** Error states enter with the same calm motion as any other element. Shake = apology. The voice doc is explicit: Tolbi does not apologize.
2. **No spring/bounce.** No `cubic-bezier` with values > 1. No spring physics.
3. **No fanfare on success.** A single clean state change. No confetti, no over-animated checkmarks.
4. **Exits are shorter than entries.** `moderate` (150ms) for exits vs `enter` (200ms) for entries.
5. **No decorative choreography.** No staggered list entrances, no parallax effects.
6. **Progress reflects reality.** Do not ease-in-out progress fill to fake smoothness.

## `prefers-reduced-motion`

A global override in `motion.css` disables all transitions and animations for users who have requested reduced motion. This is an accessibility requirement, not a feature — it applies to the entire system unconditionally.

## Consequences

- All component files updated to new token names
- `easing-in` token added, enabling asymmetric enter/exit transitions
- `instant` and `considered` tokens added for future use
- HelpIcon tooltip and Dropdown panel use asymmetric transitions
- ProgressBar and ProgressCircle use `easing-out` on fill
- `@media (prefers-reduced-motion)` global override in `motion.css`
