# ADR-0105 — What is not there yet is written « — »

**Date:** 2026-11-05
**Amends:** ADR-0100 (`ProjectCard`'s `computing` figures said « en calcul » in words)
**Extends:** ADR-0104 (`CreditCost`'s unpriced cost), ADR-0026 (skeleton → content)
**Source:** the owner, 5 Nov.: « il y a ce dash là, c'est le même dash qui est utilisé pour les crédits avant qu'il y
ait une valeur estimée … c'est des patterns qu'on a déjà décidés. Si c'est pas dans le design system, il faudrait
l'inclure ». His drawing: the ARR card in computing (Figma `3074:10268`).
**Status:** Accepted

## Context

Two answers had been written for one question — a value the screen cannot show yet. The owner's screens (the ARR
card in computing, the credits cost before it is priced) write **« — »**. The package said **« en calcul »** in
words in `ProjectCard` (ADR-0100, on the argument that « a dash reads as nothing »), and nothing at all for a curve
(an empty 32px box in the stories). A decision the owner had already made existed only in Figma, and the package
disagreed with it.

## Decisions

### A value not there yet is « — »

In the **type of the value it stands for** — a figure's dash is `heading-lg`, a reading's dash is its reading's role —
and in **`text-subtlest`**, the receding ink (Figma: `text/subtlest`). The unit goes with the number: « — », never
« — tCO2e ». The state is **read**, not seen: the dash is `aria-hidden` and a visually hidden word says what it means
(`ProjectCard`'s `pendingLabel`, « en calcul »; `CreditCost`'s `unpricedLabel`, « Pas encore calculé »).

The dash is not a skeleton. A **skeleton promises seconds** (ADR-0026: it previews what is arriving now); the dash
says the value **is not computed yet**, for as long as it takes. `CreditCost` has both because it has both states:
« — » while the form cannot be priced, a placeholder while the price is on its way.

### A curve not there yet is a flat dashed line

`Sparkline` with fewer than two points draws a **flat dashed line** across its box — `border-default`, 1px, `4 4`
(the owner's `Courbe d'évolution / Tracé=Vide`) — and draws no comparison: nothing is compared against nothing.
Its `label` says the state (« En calcul »).

## Where it applies

- `ProjectCard`: a metric whose `value` is `null` (every `computing` card).
- `CreditCost`: `cost` absent (ADR-0104).
- `Sparkline`: `values` with fewer than two points.

A new component that shows a value or a trend not yet known writes it this way, and reads it with a word.
