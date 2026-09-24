# ADR-0042 — The bar says where you are, and it only says it once

**Date:** 2026-09-24
**Extends:** ADR-0028 (the bar carries no ground; the 64px height), ADR-0024 (selection belongs to
the group, not to the item), ADR-0041 (`ModuleName` is the coverage; 24px is sub-pixel),
ADR-0043 (the shared artwork ladder, and the ink spread that makes the two rungs differ),
ADR-0027 (one grid cell, two occupants),
ADR-0037 (one gesture, one duration)
**Status:** Accepted
**Breaking:** `HorizontalNavigation` now derives the module switcher's current item from `module`.
A caller that set `ModulesListItem.active` by hand gets it overwritten. One prop replaces it.

## Context

The bar had two places that knew the user was inside a module, and the lockup was neither of them.

`modules[].active` marked the current item in the switcher. `breadcrumbs[0]` named the module in the
trail. The lockup said `Tolbi` at every depth — so the one element of the chrome that is *about*
identity was the one element that never carried it.

Two owners is the defect ADR-0024 named on `ButtonGroupItem`: a per-item flag lets a set have zero
or two current members, *and* it means nothing knows where the current one sits. The bar had it
again, and had been shipping a story (`WithActiveModule`) that set the flag by hand.

## Decisions

### One prop, and the switcher reads it back

`module?: ModuleName`. Absent is the product's home page.

The dropdown's current item is **derived** from it — `modulesWithCurrent` maps the list and sets
`active` — so `ModulesListItem.active` is ignored inside the bar. Zero or two current modules is now
unwritable, and there is one place to look for the answer. `ModulesList` keeps the prop for
standalone use; the bar is the group and the group owns the selection.

The type is the coverage, as in ADR-0041: `ModuleName` spells the eleven modules the system has
artwork for, so a module it cannot draw cannot be asked for. `moduleLabel` exists here where
ADR-0041 declined it, because this word *is* the lockup's name rather than a qualifier on a title
the card already had — `Data` ships as **Data OS** in the product. Defaulted, not required
(`Breadcrumbs.homeLabel`, same reasoning).

The bar does not route. It emits `module-select`; the product sets `module` back. Nothing inside the
component ever writes it.

### The module's form is the mark alone

`variant="illustration"` — the fourth consumer to make that call, and for a reason the other three
did not have. ADR-0041 stated the rule as *the primitive is what a component reaches for when the
component is already the surface*, and the bar is the awkward case: it deliberately carries **no
ground** (ADR-0028), so by that rule it is not the surface. The argument that decides it is
different and narrower:

> **The two forms alternate in one slot, so they have to be the same kind of object.** The Tolbi
> mark is untiled artwork. A rounded coloured tile where the brand mark was is not a smaller Tolbi
> lockup, it is a different register.

**The module mark is 48 and the Tolbi lockup is 24 — two rungs apart, deliberately.** That sentence
is only writable because ADR-0043 put the two on one ladder; before it, one said `md` and the other
said a number, and "two rungs apart" had no meaning.

The reason it is not one number is ADR-0043's measurement. **The ladder equalises the box, not the
ink.** The Tolbi mark fills its box edge to edge; the eleven module drawings sit inside their 48-grid
with their own margins, and those margins are not a constant — the ink runs from **8.53** units tall
(`Trace`) to **41.8** (`Carbone`), a 4.9× spread. At equal rungs the module reads smaller than the
brand: 14.2px of ink on average against the brand's 24. At 48 the eleven average **28.5px**, which
is the first rung where a module mark carries as much of the eye as the brand does.

48 is also the artwork's **native grid** — the one rung that is not a downscale at all, so it is
where the drawings are sharpest. ADR-0041 left that open on 32 (*"still a downscale nobody drew for,
just a survivable one"*); here it closes.

**What it costs is the bar's height: 72px, not ADR-0028's 64.** 48 is the one thing in the bar
taller than the 40px avatar, so the identity drives the height now — on **every** page, including
pages with no module, because the slot's floor is 48 in both forms. That last part is not the waste
it looks like: a bar that changed height on navigation would be the real defect.

24 and 32 were both built and measured on the way here. At 24 a 48-grid drawing renders Yield's
1.78-unit stroke at **0.89px** — sub-pixel, the reason ADR-0041 rejected it. 32 puts it at 1.19px and
keeps the bar at 64.

**And no name.** The first draft put the module's word beside its mark, on the reasoning that a
lockup is a mark *and* a name and that a lone glyph would read as an icon. Rendered, the objection
that mattered was the other one: `breadcrumbs[0]` already names the module, so the word appeared
**twice, 32px apart**, on every module page in the catalogue. A lockup that repeats its own
neighbour is not a lockup, it is a duplicate.

Dropping it is also what makes the slot behave. Measured at 1440px:

| identity | width | height | Δ vs Tolbi |
|---|---|---|---|
| Tolbi, `size={24}` | 77.73px | 24px | — |
| **all eleven modules** | **48px** | **48px** | −29.73 |

With the name, the eleven ran 55.92 (ID) to 111.11 (Carbone) and the trail started somewhere
different in every module. Without it they are **one geometry**: the trail's start is identical
everywhere inside the product, and it moves exactly once — between home and a module. One step on
the gesture that rewrites the trail's content anyway, instead of eleven positions the chrome drifts
between.

### The trail is gone from the home page

`Breadcrumbs` says in its own prop doc that *empty is a depth, not a missing value* — the house alone
**is** the home page. That is still true of the component, and it is no longer true of the bar.

The rule was written when the house was the only thing on the bar saying where you were. Now the
identity slot shows the Tolbi lockup at exactly the moments the trail would show a lone house, so the
two said the same thing 32px apart. It is the same duplication that took the module's name out of the
lockup, read from the other end — and it is resolved the same way, by deleting the copy that carries
less.

The condition is the **trail being empty**, not `module` being absent. A page outside any module
still has a path worth showing, and keeping the two props independent is what stops `module` from
quietly deciding a second thing.

The change is the bar's, not `Breadcrumbs`'. The component has no identity slot beside it and no
reason to change its mind.

**And they are the second movement.** The roll ends with the slot narrowing from the Tolbi
lockup's width to the mark's, which shifts the trail — so a trail fading in *during* the roll would
arrive at one position and be shunted to another. It is delayed by one `enter` and fades in where it
is going to stay. That offset is ADR-0032's `RevealTransition` pattern, and so is the delay itself:
*a delay is a duration in another slot*, which is why that ADR declined to mint a delay token and why
this rule reads `--ds-motion-duration-enter` twice. Asymmetric on purpose — **nothing waits to
leave**.

### The left side is two blocks, not one row

The bar's left used to be a single flex row: identity, 32px, trail — where the trail began at the
top of the product and the module was its first crumb. Three facts had accumulated against that:
the identity already names the module, the trail repeated it one node later, and removing the trail
at depth 0 left the way home living inside a thing that does not render on the home page.

So it regroups.

| | |
|---|---|
| **identity block** | the mark, `spacing-lg` (12px), the way back |
| | `spacing-4xl` (32px) |
| **the trail** | the path **inside** that module |

*Where you are and how to leave* is one statement; *how you got to this page* is another. The gap
says which is which — 12px binds, 32px separates — and it is the gap that makes the trail readable
as a path within the module rather than a path from the root.

Measured at 1440px: the block is 77.7px at home and 269.4px in a module, the internal gap is
**12px** and the gap to the trail **32px** at every depth.

### The house leaves the trail and becomes a Button

`Breadcrumbs` gains `home?: boolean`. `false` means *the surface posts the way home somewhere else*,
which is now true of the bar. With it off the first item takes **no leading chevron** — a trail that
starts at its own first node does not trail from anything — and the five-node ceiling counts items
alone. Named after the thing it removes, like `SideNavigation.toggle` (ADR-0034).

In the bar it is a **real `Button`**, not a hand-drawn crumb (ADR-0001). It stopped being a node in a
path the moment it left the path, so it stopped having to look like one — and it is drawn as an
action rather than as chrome.

`variant="secondary-gray"`, not the `ghost` the crumb effectively was. A ghost is **nothing at
rest**; it only answers a pointer that has already found it, which is the wrong contract for the
single way out of a module. A declared box also *bounds the block*, so the 12px gap reads as binding
two objects rather than as loose space beside the mark. `href` makes it an `<a>`, the rule ADR-0014
set and `Breadcrumbs` already followed.

`size="sm"` is the **smallest the catalogue has**, and it is taken as it comes — `label-lg-strong`,
`control-padding-sm`, no local font: a component that is 90% the real one is the defect ADR-0001
exists to stop. Measured **209.4 × 38px** — 38 and not 36 because a bordered control is 2px taller
than its padding token says (ADR-0033).

It carries its **word**, where the crumb was a bare glyph. `homeLabel` existed already — as an
`aria-label` — and it is on screen now, with the `aria-label` gone: a control whose word is visible
should not carry a second name that can disagree with it.

**The two defaults differ on purpose.** `Breadcrumbs` keeps a **location** (`Accueil`) because it
still has a depth-0 state in which the house *is* the page, and an imperative would be false there.
The bar defaults to the **imperative** — `Retourner sur l'accueil` — because it no longer has that
state: the trail does not render at depth 0, so the button is only ever shown from somewhere else.
That is not two opinions about wording; it is the same rule reading two different facts.

The current-node **weight** now reaches `Breadcrumbs`' own house too — the old note said a glyph has
none to give, and it has a word now.

It is not truncated, unlike a crumb's 20ch ceiling. It is the escape hatch, and
`Revenir sur l'acc…` is worse than the width.

**Both it and the trail appear on the same beat** — neither exists on the home page, so they share a
condition (`!module && !breadcrumbs.length`) and one transition (`ds-hnav-away`), delayed one `enter`
behind the roll.

### The mark carries the accessible name, and does not get a tooltip

With no visible word in the slot, nothing else names the module — so `aria-label` goes back on the
artwork. That is ADR-0041's rule with the **opposite input**: *the artwork's accessible name is
decided by what else is on the surface, never by the component.* There, visible text beside the mark
made a label noise; here the slot is the mark and the mark has to speak. `moduleLabel` survives for
exactly this, and only this — `Data` reads back as **Data OS**.

It does **not** get a `Tooltip`, which is the obvious parallel and the wrong one. ADR-0034 made the
tooltip structural on the collapsed rail because those glyphs are **destinations**: you have to know
what one is before you click it. This mark is a **statement** — it says where you already are, the
trail names it in words 32px to the right, and it is not a control at all.

### The identity **rolls**, it does not dissolve

The outgoing identity travels up and out of the slot; the incoming one arrives from below and
settles. A departure board, not a cross-fade.

The first build was a cross-fade, and it was wrong for a reason worth writing down. **A dissolve says
the thing changed; a roll says one thing left and another arrived.** The bar's job at that moment is
the second sentence — *you were on the home page, you are now in Yield*. That is a sequence, and a
sequence has a direction. It is also what separates this from `SwapTransition`, which cross-fades in
place precisely because a skeleton and its content are **one thing** in two states.

**The slot is the window.** `overflow: hidden` on `.ds-hnav__identity` is what makes "out of view"
mean anything, and it is why the travel is `100%` of the *slot* rather than of the mark: the Tolbi
lockup is 24px tall in a 48px slot, so translating it by its own height would leave half of it
showing. The floor and the travel distance are therefore the same number by construction — one more
reason `--hnav-mark` is read twice rather than written twice.

**The same direction both ways.** Up-and-out / in-from-below is an **odometer**: a value changing in
place. Reversing it on the way back would make it a *place* changing, which is a claim about
hierarchy the bar does not have — a module is not below the home page, it is beside it.

| | |
|---|---|
| duration | `--ds-motion-duration-enter` (200ms), **both halves** |
| easing | `--ds-motion-easing-in-out`, **both halves** |

The easing is not a preference. Its description names exactly this case — *"spatial: a thing that
travels, rather than a state that changes"* — and lists the tab indicator and the drawer slide.

The two halves share one duration because they are mechanically **one movement**. ADR-0037 made the
same call when the sidebar's column and the indicator inside it had to travel together: *two
durations on one gesture tear.* Which is also why ADR-0021's "the exit is faster than the entrance"
does not apply here — that rule governs a floating surface getting out of your way, not a strip
whose two halves are coupled.

**And no fade on top.** Movement has to explain something (ADR-0023). This movement says *it left,
the next one arrived*; cross-fading at the same time would say *it dissolved*, which is a second and
contradictory story.

**Three mechanics, each fixing a failure the other transitions already documented:**

- Both forms sit at `grid-area: 1 / 1` (ADR-0027's `Button` trick), so the slot is **never empty** —
  and here that is structural rather than prudent, because they roll *past each other* and have to
  be in the slot at once. `mode="out-in"` would make it two movements instead of one.
- The **leaving** form stays **in flow**, and an earlier build had this wrong. It took the leaver out
  with `position: absolute` on the reasoning that the slot would otherwise hold the wider of the two
  and dip through the midpoint — ADR-0026's `Button` wobble. That reasoning does not apply: **neither
  form's width is animated**, so an `auto` track holding both is `max()` of two constants — a single
  step, never a dip. What the absolute positioning actually bought was an **overlap**, and only in
  one direction: filmed, Accueil → Yield left the 77.73px Tolbi lockup hanging outside a 48px slot
  for the whole leave, with the breadcrumb house — already moved — sitting on the wordmark.
- Reduced motion cuts the travel **and resets the transform**, not only the transition: a
  `transition: none` alone would park the incoming form one slot-height below and snap it. Honest
  here, unlike ADR-0032's marquee: an identity that changes instantly still says which module you
  are in.

Measured over 410 frames with the travel slowed 20×: **two distinct slot widths** (77.73 → 48) and no
intermediate, **never zero forms**, **two forms** at the midpoint. **Filmed** at 10× in both
directions and sampled at the real 0 / 40 / 80 / 120 / 160 / 200ms: at 80ms both marks are in the
window, one leaving through the top and one rising from the bottom; the trail's horizontal step lands
at the end of the roll, once, and never overlaps the identity.

Private to this component, not a fifth transition in the catalogue: one consumer is not a pattern
(`useMarquee`, ADR-0032), and a second surface that replaces an identity can promote it.

### `<Logo>` fades in and is cut out, and half the check passes

The first build looked right. Going **module → home** the two forms transitioned exactly as designed.
Going **home → module** the Tolbi lockup vanished on frame one — no `-leave-*` class was ever applied
to it, in that direction only.

Bisected against the real component:

| `<Transition>` child | enter | leave |
|---|---|---|
| `<Logo variant="nav">` — its root is the `v-if` branch | ✅ | ✅ |
| `<Logo variant="default">` — its root is the `v-else` branch | ✅ | **✗** |
| `<Logo>` inside a plain `<div>` | ✅ | ✅ |

`Logo`'s own root is a `v-if` / `v-else` pair, and only the `v-if` branch carries the leave hooks. A
hand-written render function with the same conditional root does **not** reproduce it, which points
at the compiler's branch keys rather than at the conditional itself.

So the `<Transition>` gets plain elements on both branches, and `Logo` sits inside one —
`RevealTransition` renders its own element for the same class of reason (ADR-0032).

What is worth carrying forward is not the Vue detail, it is the **shape of the failure**. ADR-0039
collected three defects whose declaration was right and whose rendering was wrong, and closed with
*read the rendered pixel, not the property you just wrote*. This is a fourth, with a new wrinkle:
**it fails asymmetrically.** One variant of one component, in one direction of one swap. Watching
the transition once — in the direction that works — certifies it.

## What changes

- `HorizontalNavigation` gains `module` and `moduleLabel`, and derives the switcher's current item.
- **The bar is 72px**, up from ADR-0028's 64, at home as well as in a module. `Logo` runs at rung 24
  and `ModuleIcon` at 48, and the slot's floor is the larger of the two in both forms. `Logo` is
  2.33px wider than it was, because ADR-0043's ladder dropped `sm`'s wordmark tightening.
- **The home bar carries the most air.** A 24px lockup in a 48px slot, on a 72px bar, is the one
  state where the height is paid for and nothing uses it.
- The lockup is a slot, not an element: `--hnav-mark` (48px) is read twice, as the artwork's box and
  as the slot's floor, so the two can never disagree (ADR-0041's `--project-card-mark`, ADR-0034's
  `--side-nav-rail-row`). A variant switch, not a token (ADR-0010).
- No new tokens. Every value in the swap is one the scale already carried.
- `Breadcrumbs` gains `home?: boolean`, shows `homeLabel` on screen and drops its `aria-label`; the
  current-node weight now reaches the house; with `home: false` the first item takes no chevron and
  the node ceiling counts items alone.
- The bar renders the way home as `Button ghost sm`, inside the identity block, and no longer renders
  the trail at depth 0.
- Two stories: `IdentitySwap` (the transition, driven by a real selection) and `EveryModule` (the
  eleven marks in the slot).

## Consequences

- **The trail's start moves 29.73px between home and a module**, and nowhere else. That is the
  largest single step of any form considered, and it buys the only property that matters across a
  session: inside the product the chrome does not drift, because all eleven modules are one width.
- **`moduleLabel` is no longer visible.** It was a rendered word in the first draft and is now the
  accessible name only. A caller passing it will not see it change anything on screen, which is
  worth knowing before someone "fixes" it.
- **The lockup is still not a control.** It was not one before and it is not one now. Making it the
  link to the module root would need a real `<button>` or `<a>` (ADR-0014), plus an answer to
  what the *Tolbi* lockup links to when the house crumb already goes there.
- **Eight stories now pass `module`.** The depth stories keep their module crumb, because they exist
  to document the trail's five-node threshold.

## Still open

- **The module identity is not in Figma.** ADR-0028's audit bound every editable value in the bar
  and records four depth views; none of them is a second lockup. For once the file is the side that
  has something to add.
- **`Trace`'s mark is a wordmark.** At 48px the artwork renders the letters `EUDR` — it names a
  regulation where the other ten name themselves with a drawing, and the slot is now the mark alone,
  so `Trace` is the one module the bar identifies with a *different word* than the trail beside it.
  Not new (it is the drawing), but this is the first surface where it stands without a label.
- **Nothing in the linter reads a duration or a curve.** ADR-0039 left this open and this ADR adds a
  fourth transition's worth of values that only a human can check.
