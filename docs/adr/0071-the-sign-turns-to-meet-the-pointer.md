# ADR-0071 — The sign turns to meet the pointer

**Date:** 2026-10-08
**Departs from:** ADR-0002 (motion principles: length) — 1.65s on a hover, the awakening's own, with the
owner's acceptance
**Amends:** ADR-0070 (the launcher) — its hover; ADR-0063 (the awakening) — its turn, alone, leaves the
first opening
**Extends:** ADR-0057 (the loop is the sign of work), ADR-0044 (focus is hover by the other input),
ADR-0068 (Web Animations ask reduced motion themselves)
**Source:** Figma, « Tolbi xAI exploration », `16 · Le lanceur au survol — le signe s’anime`
(`2482:14612`) — three tracks prototyped on the real launcher and filmed frame by frame; track C chosen
by the owner on 8 Oct.
**Status:** Accepted

## Context

The owner wanted the sign on the launcher (ADR-0070) to move when the pointer arrives, with one of the
system's own animations: « the loading animation when you open the panel ». The sign has two, and the
sentence fits both — the thinking loop (ADR-0057), the light going round the leaves while Tolbi AI works,
the waiting line's loading animation; and the awakening (ADR-0063), 3.2s, played on the panel's first
opening. Three tracks were prototyped on the real launcher and sampled every frame:

- **A, the loop, while the pointer stays.** Two cuts: in one frame three leaves drop from 100 % to 20 %
  and the spark goes, and the reverse on leaving — no frame of the loop has four leaves lit, so it can
  neither start from rest nor come back to it. And it says Tolbi AI is working, which ADR-0057 keeps for
  work in progress, never shown alone.
- **B, the whole awakening, once per approach.** One cut on entry, masked by the turn — the spark goes,
  three leaves drop, the sign shrinks 6 % — and none on exit: it ends on rest. But 3.2s on every pass makes
  the first opening's exception ordinary, and a click while it plays opens the panel on a second awakening.
- **C, the awakening's turn, alone.** No cut.

The owner chose **C**.

## Decisions

### One turn, the awakening's

When the pointer arrives on the disc — or the keyboard's focus, hover's other input (ADR-0044) — the
leaves turn once, with the awakening's turn: its 1.65s and its ease-out, `cubic-bezier(0.18, 1, 0.3, 1)`.
The spark stays where it is and nothing dims, so the turn leaves rest and comes back to it, 360° being 0°.
Measured every frame on the launcher: 0° → 360° with no reversal, no leaf and no spark changing opacity,
about 20° in the first frame; a third of the turn is done at 100ms, more than half at 200ms, 92 % at 600ms,
99 % at 1s.

Those values are the exception's, kept as they are: the scale's `easing-out` over the same time would be
another turn. That departs from ADR-0002 on length — 1.65s on a hover, accepted from the filmed track.
What the eye follows is the first 600ms, the scale's `ambient`; the last second settles 29°.

Everything that made the awakening an exception stays with the first opening: the leaves lighting in two
rounds, the spark's arrival, its glow. And the loop stays the sign of work.

### Once per approach

A turn under way is not restarted — a pointer grazing the edge would otherwise stutter it — and it plays
to its end if the pointer leaves; the next approach turns again. Measured: three approaches, the second
during the first turn, two turns. It does not turn when the focus is handed back as the panel closes
(ADR-0070): the disc is arriving then, and one movement is enough — the ring says where the focus is.
Under reduced motion nothing turns; the tooltip still comes.

### A thing the sign does, not a state it is in

`TolbiAiSpark` gains `turn()`, exposed, rather than a fifth `state`. A state is what the sign is for a
while — at rest, off, thinking, awakening — and the turn is something it does once and is done with. As a
state, the launcher would have to set it, hear its end, and reset it whenever the disc is hidden, since a
hidden CSS animation is cancelled and never ends; as a call, it asks, and the sign keeps the count.

`turn()` is Web Animations on the leaves' group. Its duration and curve are read off the cascade —
`--tolbi-ai-spark-turn` (1650ms) and `--tolbi-ai-spark-turn-curve` — written once more beside the
awakening, whose keyframes hold the same values as literals because a `var()` there is dropped (ADR-0057);
the two must stay equal. Only a sign at `rest` turns, and a state that moves the leaves itself cancels a
turn under way. Web Animations are outside motion.css's reach, so `turn()` asks reduced motion itself
(ADR-0068). Both turns pivot on the drawing's centre: `transform-origin` moved from the awakening's rule
to the leaves' group.

## What changes

- `TolbiAiSpark`: `turn()`, exposed; private `--tolbi-ai-spark-turn` and `--tolbi-ai-spark-turn-curve`.
  Story « Le tour — au survol ».
- `TolbiAiLauncher`: the sign turns when the pointer arrives and on keyboard focus.
- In the product: nothing to do.

## Still open

- **Figma** shows the tracks (section 16, C marked retained), not the motion: `TolbiAI/Lanceur` carries no
  Motion data for its hover.
- **Touch** has no hover: a tap's `pointerenter` starts a turn that the opening panel covers at once.
