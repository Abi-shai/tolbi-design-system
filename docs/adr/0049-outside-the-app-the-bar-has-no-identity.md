# ADR-0049 — Outside the app, the bar has no identity

**Date:** 2026-10-01
**Extends:** ADR-0042 (the identity slot, the way out, the second beat), ADR-0047 (the credits chip,
left open), ADR-0027 (one cell, two occupants), ADR-0023 (movement must explain), ADR-0024 (one
owner)
**Source:** etolbi's Paramètres — direction « 3A », Sprint 18 `2067:5918`; the product's report on
0.25.0 (`app/components/layout/header.vue`, the bar's only caller)
**Status:** Accepted
**Breaking:** `credits` has no default any more. A caller that omitted it showed `0 crédits`; it now
shows no chip.

## Context

In etolbi's Paramètres the app's column gives way to the settings' own, and the 3A frame draws the
bar with **no mark**: the way out opens the bar, reads « Retourner sur l'app » behind a left arrow,
and returns to the page the user left. The bar could not draw it. The identity slot always rendered —
the module's mark, else the Tolbi lockup — and the way out's glyph was hard-coded to `house`, which in
Paramètres says the opposite of what the button does.

The same report asked for three smaller things: a place for « Créer une organisation », which left the
Organisation page's header; a bar without the credits chip, which neither the shell (`1130:16686`)
nor 3A shows; and a choice with a preview for Préférences › Apparence.

## Decisions

### The glyph says what kind of way out it is

`homeIcon: 'house' | 'arrow-left'`, default `house` — a place, or a return. `homeLabel` was already the
product's, because the product knows where the way out leads, and the glyph follows the same
reasoning. Two values rather than `IconName`: the way out has two meanings, and a glyph that says
neither should be unwritable (ADR-0041, the type is the coverage).

The name keeps the `home` family — `homeHref`, `homeLabel`, the `home` event. In Paramètres "home"
now means "the way out", and renaming three APIs to say so would break the only caller for a word.

### `lockup: false` closes the slot

Named after what it removes, like `Breadcrumbs.home` and `SideNavigation.toggle` (ADR-0034). The
report offered a single axis instead — `identity: 'module' | 'tolbi' | 'none'` — and it would have
been two owners: `module` already decides *which* mark, and a second prop able to say "module" is
ADR-0024's defect.

Without an identity the bar is **never at home**. `atHome` was "no module and no path"; it is now
also "the Tolbi lockup is showing", so with no identity the way out always renders — it is the first
thing in the bar and the only one left that says where the user can go. The bar keeps its 48px: the
window's floor does not depend on its width.

The window sits in a grid track that goes `1fr → 0fr`, and the 12px to the way out moved off the
block's gap and onto the window, so it closes with the slot. The clip around the window is
load-bearing: a `0fr` track still counts its item's margins.

### Two beats, and nothing slides

Module → Paramètres changes three things at once: the mark leaves, the slot closes by 60px, and the
way out and the trail change content. The two obvious builds both move something visible. A track
that **travels** slides the outgoing pair 60px while it fades — movement that explains nothing
(ADR-0023). A track that **steps** when the mark has gone shoves the pair 60px at full opacity.

ADR-0042 already had the answer, in its home → module direction: the slot changes width at the end of
the roll, while the way out and the trail are not yet visible, and they fade in where they will stay.
So here the pair is **replaced, not moved**. It is one element, keyed by `lockup`; the outgoing one
fades where it stands, the incoming one waits its `enter` in the same grid cell (ADR-0027), and the
track's step — a `0s` transition delayed one `enter`, in both directions — lands between the beats.

| | module → Paramètres | Paramètres → module |
|---|---|---|
| **1** · 0 → 200ms | the mark rolls out; the way out and the trail fade **in place** | the way out and the trail fade in place |
| *between* | the slot closes, unseen | the slot opens, unseen |
| **2** · 200 → 400ms | « Retourner sur l'app » and « Paramètres » fade in **where they stay** | the mark rolls in; the way out and the trail fade in where they stay |

One cell for **both**, not one each: a cell is as wide as the wider of its two occupants, so a cell
around the button alone would have pushed the trail the moment a longer label arrived.

**An arrival waits for the place it lands in to be free.** Paramètres → module, the mark would land
where the way out is still fading, so it waits one `enter` as well — `--opening`, set by a `pre`
watcher before the render that mounts it — and arrives with everything else. Every other arrival rolls
at once: module to module, or past the Tolbi lockup leaving the same window, which is the crossing the
roll was designed for.

Which means the DOM no longer groups the left side by meaning. The gaps do — 12px binds the mark to
the way out, 32px separates the trail — and the elements group by **motion**: the window with its
12px, then the way out and the trail with their 32px.

Measured on all four passages (module ⇄ Paramètres, home ⇄ Paramètres), slowed 10×: **no visible
element moves sideways**. The track steps at 200ms, when the outgoing pair is at opacity 0 and the
incoming one has not started. Home ⇄ module and module ⇄ module are unchanged.

### Slow the tokens, not the clock

The first film said everything was over in 20ms. CDP's `Animation.setPlaybackRate` slows the CSS
transitions, but Vue ends a `<Transition>` on a JavaScript timeout read from the computed duration —
and timers are not slowed — so the leaving mark was removed at 200ms of real time with 1.8s of its
transition still to run. Overriding `--ds-motion-duration-*` ×10 on `:root` slows both, because Vue
reads the same value the transition runs on.

### A stale class name, found on the way

The reduced-motion rule for the way out and the trail read `.ds-hnav-trail-enter-active`, a name left
from before the transition became `ds-hnav-away` — so under reduced motion the pair still waited one
`enter` and faded in. It now swaps at once, like the identity.

### The credits chip renders when there is a balance

ADR-0047 left the chip as the product's call, and the product has made it: neither its shell nor 3A
shows the chip, and Paramètres has its own Facturation page. `credits` absent ⇒ no chip; `0` is a
balance, and renders. It is the presence rule `CreditsChip` already applies to `reminder` (ADR-0028),
one level up — and not a deletion: a product with a balance to show keeps showing it.

### « Créer une organisation » goes in the switcher's footer

`WorkspaceSelector` gains `#actions`, rendered in a new `Dropdown` `#footer` — the header's twin, under
a rule and **outside the scroll**, because an action on the list has to stay reachable however long
the list grows. The product fills it with `DropdownItem`s (`icon="plus"`) and closes the panel through
the slot's `close`, as `select` does for a row: the switcher cannot know where an action leads.

No prop fallback. The convention (ADR-0040, ADR-0046) gives a prop to the common *string*, and an
action is a string and a handler.

### No component for a choice with a preview

Préférences › Apparence (Système / Clair / Sombre) takes `ButtonGroup`, the product's own fallback.
A choice-with-preview component would have one consumer, and one consumer is not a pattern
(ADR-0032).

### Figma caught up

Code is the source of truth, so the Sprint 18 file moved. `Breadcrumbs` gained `Maison`, and its
current segment sits on `bg/default` (ADR-0047). For `Maison: false` to start the trail with no
chevron, every chevron now **trails** the node it leaves — `Séparateur — actuel` became
`Séparateur — maison`. All 17 instances have `Niveau actuel` on, so none of them changed.

`Button` gained `Size = lg | sm`: six `sm` variants on `control-padding/sm-{y,x}` and
`label-lg-strong`, their property references re-bound by hand, because cloning a variant drops them
(ADR-0034).

## Still open

- **Module → home still lurches.** Measured while filming: the incoming Tolbi lockup is in flow from
  frame 0, so the window grows 48 → 77.73 and the way out and the trail jump 29.73px right at full
  opacity, then fade. ADR-0042's roll needs the wider window during the crossing; fixing it means
  making the lockup wait, which changes a validated choreography. Not touched.
- **The chip has no transition.** A product that shows it in the app and not in Paramètres would see it
  pop on the way in and out.
- **The footer exists only in code.** `WorkspaceSelector`'s Figma set has no open panel to draw it in.
- `Button`'s Figma default `Source icône` is Google's « G », from the onboarding: every new instance
  with an icon starts with it.
