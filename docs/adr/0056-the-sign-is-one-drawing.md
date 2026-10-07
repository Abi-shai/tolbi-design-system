# ADR-0056 — The sign is one drawing

**Date:** 2026-10-07
**Extends:** ADR-0005 (artwork is extracted, not transcribed), ADR-0043 (one ladder for every
drawing)
**Source:** Figma Sprint 18, page « Tolbi AI — retenu, vers le paquet » (`2412:15834`), component
`TolbiAI/Étincelle` (`2341:12352`), settled by the owner on 7 October. The first of eight steps that
bring Tolbi AI into the package, one release each.
**Status:** Accepted

## Context

Tolbi AI is the assistant in the product's Yield module, and everything it shows is hand-built in
the product today (`tolbi-ai-panel.vue`): a gradient orb on the welcome screen, Lucide's `sparkles` on
the launcher, three bouncing dots while it works. None of it is in the package.

Its sign is now drawn: the « Feuilles » spark — four leaves pointed at both ends, no core, in
brand/500, and a small four-point spark in accent/400. The component set has **96 variants**:
`Taille` (16 → 128) × `État` (Repos, Éteinte, Gauche, Haut, Droite, Bas) × `Petite étincelle`
(Avec, Sans).

## Decisions

### Ninety-six variants are one drawing

Measured with the Plugin API, every variant's layers, normalised to the 48 grid, sit within
**9.5e-7px** of the 48px variant's, and the six states differ only in each leaf's layer opacity (1 or
0.2). So the drawing is extracted once, from one export, and a `viewBox` draws every size — ADR-0031's
argument for `ModuleCapsule`'s 44, applied to a whole set. Rendered at 4× against Figma's own export,
the 48px sign at rest differs on 45 pixels of 36 864, all of them on anti-aliased edges; `off` on 4.

### Four of the six states are a motion

Gauche, Haut, Droite and Bas light one leaf at a time: they are the frames of the thinking loop (the
next step), not states a caller picks. So `state` is `rest | off`, and the drawing keeps each leaf a
**separate path named by compass point**, listed from the west clockwise — the order the light goes
round. The structure of the drawing is the motion's API.

### The inks are bound, not copied

`npm run tolbi-ai-art` is `generate-module-art.mjs`'s extraction — only the variant's own `<g>`, so
the section's backdrop is dropped by construction — with a different output: path data and **no
colour**. The component binds the two primitives Figma binds, `brand/500` for the leaves and
`accent/400` for the spark. That is ADR-0010's categorical clause: on every neutral ground the leaves
are the brand green, which is "this one is green", not a role. The linter knows only `display-*` as
categorical, so the two declarations carry a named suppression.

And the generator checks the export's hexes against `primitives.json`, failing when they disagree. A
different hex in the file is Figma drifting from its own variables — to be fixed in Figma, never
shipped. Nine tests hold the generator to that, each of its four checks mutation-proven (ADR-0018).

### The ladder gains 96 and 128

`ArtworkSize` is now `16 | 20 | 24 | 32 | 48 | 64 | 96 | 128`: Figma's two top rungs, the welcome
screen's sizes. They continue the ladder's own alternation (×1.5, ×1.33) and they are, again, what
Figma draws. `Logo` and `ModuleIcon` take them for free. `size` is **strict** here, like `Logo`'s: a
brand mark has no off-ladder caller.

### `surface` decides the leaves' ink, and nothing else

`neutral | brand | inverse` — `BrandPattern`'s three grounds, in its words. On a coloured ground the
leaves take that ground's exact partner, `text-on-brand-solid` or `text-on-inverse`, never a literal:
`inverse` flips with the mode, so its leaves are white on a light page and `gray-forest/900` on the
light inverse of a dark one. The small spark stays accent/400 on all three. Measured in light, the
leaves stand at 6.81:1 on `bg-default`, 7.70:1 on `bg-brand-solid` and 18.86:1 on `bg-inverse`.

This is the shape ADR-0006 removed from `MetricValue`: a prop to remember on a coloured ground, or
green goes on green. It comes back because the sign cannot paint its ground — it is placed on one —
and the two coloured grounds are named in the decision. Each value names an exact partner rather than
opting out of a pairing, and the failure is total rather than subtle: forgotten, the leaves vanish and
the yellow stays, where `MetricValue`'s was a readable-looking 1.38:1.

### `off` dims the leaf, not the ink

The 20 % is a layer opacity in Figma and an `opacity` here, so a dimmed leaf is the same leaf fainter
on every ground, white on brand included. The spark keeps its full yellow: what has not loaded yet is
still recognisably the sign.

### The name is the surface's call

« Tolbi AI » by default; `null` where the sign sits beside a visible « Tolbi AI », which is most
places it will appear. ADR-0041's rule: what else is on the surface decides, never the component.

## What changes

- New `TolbiAiSpark` (`Identité & média/TolbiAiSpark`, `wip`, `primitive`): `size`, `accent`,
  `state`, `surface`, `ariaLabel`; types `TolbiAiSparkState`, `TolbiAiSparkSurface`,
  `TolbiAiSparkLeaf`.
- New `npm run tolbi-ai-art`: `scripts/generate-tolbi-ai-art.mjs`, the raw export and its README in
  `scripts/tolbi-ai-raw/`, `scripts/tolbi-ai-art.test.mjs`. `components/TolbiAiSpark/art.ts` is build
  output.
- `ArtworkSize` and `ARTWORK_SIZES` gain 96 and 128.
- In the product: the gradient orb and the launcher's `sparkles` give way to the sign.

## Still open

- **Dark mode on the neutral grounds.** A primitive has no mode, so in dark the leaves stay brand/500:
  **2.44:1** on `bg-default` and **1.49:1** on `bg-neutral`. A mark is exempt from the 3:1 a control's
  glyph owes, but 1.49 is barely there. Figma's frames are all light; a dark ink is a decision for the
  drawing, not a value to derive here.
