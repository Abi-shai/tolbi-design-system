# ADR-0041 — A prop that decides nothing

**Date:** 2026-09-24
**Status:** Accepted
**Extends:** ADR-0038 (*there is no `module` prop*; nothing wraps; the wait says nothing),
ADR-0005 (`ModuleIcon`'s two levels — the illustration is the primitive), ADR-0031 (the modules the
system has no artwork for), ADR-0028 (the direction a code-only audit cannot see), ADR-0011
(`label-xl-strong` is 16/24 in both type scales)
**Source:** Sprint 18 — `1488:4740` (`Module=Yield, État=En cours`), and `1215:1909`
(`ModuleIllustration`)
**Breaking:** none. One new optional prop; a card that does not pass it is unchanged.

## Context

A grid of project cards had no way to say **whose project** each one was.

Yield and Scan do draw different things, but that is something you *read*, not something you *see*:
the two differ by a 12px label three lines down the tile — "Stades phénologiques" against
"Répartition des cultures". The module is the first fact about a project and it was the last one
legible on the card.

Figma explored it and landed in the obvious place: the module's artwork, 24px, in front of the name.

## Decisions

### There is a `module` prop now, and it decides nothing

ADR-0038 says it in as many words: *"There is no `module` prop, and a third module adds a block here
rather than an axis."* That sentence is not reversed here. Its subject is.

The rule protects **derivation** — what the card *draws* comes from the data it is handed (ADR-0028),
so no module can buy itself a special case. That still holds, unchanged: `spread` reads `stageLabel`
and `crops`, the pill reads `state`, a third module still adds a block rather than an axis. **Nothing
in `ProjectCard` branches on `module`.**

What the prop carries is **content**: which module this project belongs to. That is a fact no other
prop holds and no data on the card can derive. `stageLabel` correlates with Yield today by accident
and two modules reporting stages would end it; a card in `loading` has no data at all. A prop that
*is* a fact and a prop that *selects a rendering* are different objects, and only the second was ever
forbidden.

**The test that keeps this honest is mechanical:** if anything in that file ever reads `module` in a
condition, this decision has been broken. The `v-if` that hides the mark when the prop is absent is
not that — it is the prop being empty, not the prop being consulted.

### It goes on the title's line, and the row pays for the size

The line is not in question. The alternative was the media corner, where the status pill already
sits, and it was declined: ADR-0038 records that the pill and the overflow button sit on an arbitrary
photograph with **no guaranteed ground**, and that is a risk to hold at one, not to double. The
title's line has `bg-default` under it.

The size is the interesting part, because **there was a free size and we did not take it.**

24px is exactly one line box: `label-xl-strong` is 16/24 in *both* type scales (desktop, and
`[data-typography="mobile"]`, which raises the size to 17px and leaves the line at 24). At 24 the
mark is as tall as the name it precedes, the demo badge is `md` and also 24, and the identity row
measures the same with the mark and without. It costs nothing.

It also **does not read**. At 24px the eleven drawings are coloured blobs — distinguishable from each
other, which is half the job, but not identifiable as the module they name, which is the other half.
A mark you have to learn is a mark that does not work in the first week. So the size is **32px**,
chosen over the free one, and the row grows to 32 to meet it.

**The cost of that is not the eight pixels.** It is that the presence of a mark would otherwise
become a height decision: a card carrying a module would stand 8px taller than one whose module the
system has no artwork for, and a grid of two card heights is the thing ADR-0038 spends the most rules
avoiding. So `--project-card-mark` is read **twice** — it is the artwork's box *and* the identity
row's `min-height` — and every card pays the 8px whether or not it has a mark. One value, because
the two must never disagree; ADR-0034's `--side-nav-rail-row` for the same reason, and a variant
switch rather than a token under ADR-0010.

Measured, three cards in one grid — Yield, Scan, and one with no module — in both type scales:
identity row **32px** ×3, card height **391.08px** ×3.

### The illustration, not the logo — and this is now a pattern

`variant="illustration"` (ADR-0005). The card is already the surface, so the logo's tile would be a
tile inside a tile, fighting the card's own radius.

That is the third consumer to make the same call, after `ModulesList` (the item button supplies the
surface) and `ModuleCapsule` (the capsule does). Three is enough to state the rule ADR-0005 only
implied: **the primitive is what a component reaches for when the component is already the surface.**
The logo is for surfaces that have none of their own.

### The mark is named, where the other two are not

`ModulesList` and `ModuleCapsule` both pass `aria-label="null"`. Here the mark keeps `ModuleIcon`'s
default, which is the module's name.

The difference is not the component, it is the surface: there, the module's name is visible text
right beside the artwork, and naming it twice is noise. Here **nothing else on the card says which
module this is** — the mark is the sole carrier of the fact, so it has to carry it for assistive
technology too. The general form: *the artwork's accessible name is decided by what else is on the
surface, never by the component.*

It sits **inside the `<h3>`**, before the control rather than beside the heading, so the module
qualifies the name. Read back off the browser's own accessibility tree rather than off the markup
(ADR-0039):

| element | accessible name |
|---|---|
| the heading | `Yield Rendement Arachide Nord` |
| the card's control | `Rendement Arachide Nord` |
| the mark | `Yield` |

The control keeping the title alone is the right half of that: the module is not where the click
goes. Heading navigation through a grid of twenty gets the module; the tab order gets the project.

### Two gaps on one row

`spacing-xs` (4px) from the mark to the name, `spacing-md` (8px) from the name to the badge. Two
values on one row because they are two kinds of adjacency: the mark and the name are one unit —
*this project, of this module* — where the badge is a separate statement, and about the account
rather than the project. Figma draws 4 and 8; the reason is why we kept them apart rather than
averaging to one gap.

### The type is the coverage

`ModuleName` spells the **11 modules the system has artwork for**. `Eudr`, `ina` and `conformite` are
deliberately absent (ADR-0005, ADR-0031), so a project of one of those cannot be given a wrong mark —
the compiler refuses the string, the prop stays empty, and the card renders as it did before.

No `moduleLabel` here, unlike `ModuleCapsule`. There, the label exists *because* there is no artwork
and the capsule still has to name the module. Here the card already has a title, and a module with no
drawing simply has no mark. **A wrong mark is worse than no mark; a mark that cannot be spelled wrong
is better than either.**

### The skeleton reserves nothing

No square in the loading state. Not because the module is secret — the skeleton previews the card's
**blocks, not its ornaments**, and it already leaves out the demo badge, the identity glyphs and the
metric pill. It costs nothing to omit, now that the row declares its own floor: the loading card is
the same height as the loaded one either way.

### Figma has the component, and it has two modules of eleven

ADR-0028 and ADR-0033 recorded the direction a code-only audit cannot see: Figma has the component,
code has nothing. This is a third variety — **Figma has the component and it is incomplete.**

`ModuleIllustration` (`1215:1909`) ships `Source` and `Yield` across six `Size` variants
(16/20/24/32/48/64): twelve symbols. Code ships **eleven modules at any size**, because `size` is a
number and the artwork is one `viewBox="0 0 48 48"` drawing — which is ADR-0031's own finding, that a
`viewBox` makes `size="44"` identical to the 48-grid export, arriving where it costs the most.

So the two sides disagree on **what a size is**: an enum there, a number here. Six variants are
unnecessary in code and six variants' worth of work in Figma, multiplied by the nine missing modules.
The code is the source of truth and the file is what has to be completed.

## Consequences

- **Every card is 8px taller**, mark or no mark. That is the trade, and it is the version of the
  trade that keeps a mixed grid on one height.
- **The mark is not what truncates the title — the demo badge is.** Measured on the Yield card at
  280px: "Rendement Arachide Nord" needs 218px and, with the mark and no badge, *gets* 218px. It is
  not cut at all. Add "Projet démo" and the name drops to 102px and clips at "Rendemen…". Since
  `demo` is a condition of the account rather than of the project, the ordinary card is uncut, and
  the badge is what gives if the crowded one ever has to be relieved.
- **The name no longer left-aligns with the line beneath it.** The mark hangs at the body's left
  edge and the title indents 36px past it. Deliberate, and the same stagger every icon-and-title row
  in the industry carries.
- **The `<h3>` is a flex container now**, which is why `.ds-project-card__link` gained
  `flex: 1 1 auto; min-width: 1px`. Without the `min-width` a flex item will not shrink below its
  content, and the mark — not the name — is what would have been pushed out of the card.
- **Dark mode is unchanged**, because the artwork is unchanged: it carries its own colours and takes
  no token. `ModuleCapsule` already ships these drawings on a dark `bg-default` at 44px, so 24px is
  the same pairing smaller.

## Still open

- **`ModuleIllustration` in Figma covers 2 modules of 11.** Nine to draw, and the `Size` axis to
  reconsider while doing it — code needs none of it.
- **32px is still a downscale nobody drew for**, just a survivable one: the artwork is a 48-grid
  drawing at two thirds, so Yield's 1.78px stroke renders at 1.19px. That is the reason 24 failed
  (0.89px) and the reason 32 was picked by eye rather than derived. If a module's mark ever turns out
  unreadable, the answer is a drawing at that size, not another step up — the row is already paying
  for this one.
- **The darkest greens in the artwork lose contrast on `gray-forest`.** Not new — true of
  `ModuleCapsule` at 44px since ADR-0031 — and not a contract violation, since this is artwork and
  not text. Recorded because the mark now appears in far more places than the capsule did.
