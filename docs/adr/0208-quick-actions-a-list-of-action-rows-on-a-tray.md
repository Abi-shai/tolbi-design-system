# ADR-0208 — Quick actions: a list of action rows on a tray

**Status**: accepted (the owner's product brief, 17 Nov. 2026).

## Context

The home page gains a permanent block in its right column (≈ 21.5rem). It is the same for every profile at every
moment.

The owner benchmarked 24 products from official sources:

- « Quick actions / Actions rapides » is the dominant title: 13 blocks of actions out of 18, and 4 French products out
  of 5 (Oracle, Pennylane, Qonto, Finom).
- The rows start with a verb (9 out of 12).
- The products keep actions apart from places: Sitecore has « Apps » and « Quick actions », Oracle has « Mes
  applications » and « Actions rapides ». Here that is « Accès rapide » for the modules (`ModulesList`) and « Actions
  rapides ».

The package had no such row. `ProjectList`'s row comes close, but it is a project: a glyph, a date, a module. An action
row has a free illustration, a verb, and a chevron that says « go there ».

## Decision

### `ActionList` + `ActionListItem`

`ActionList` is a titled `Tray` (ADR-0205), so it takes `title`, `headingLevel` and `#action`. On the tray's white
surface it lays a `<ul>` of `ActionListItem`s, `spacing-xs` apart.

The rows are a **slot, not an `items` prop**. Each row's illustration is a different composition (people, coins,
logos), and a slot per item is what carries that.

### The row

The whole row is a real control: an `<a>` with `href`, a `<button>` without (ADR-0014). It emits `select(event)` on a
plain click, and nothing on a modified click on a link (ADR-0165).

From the start of the row to its end:

| Part | Geometry and type |
|---|---|
| Plate | 3rem, `radius-surface`, `bg-neutral-subtle` (ADR-0207's grey), holding `#media` |
| Title | a verb in the infinitive, `label-lg-strong`, `text-strong`, one line |
| Badge (optional) | `Badge sm`, on the title's line |
| Line under the title | `body-sm`, `text-subtle`, one line, cut with an ellipsis |
| Chevron | `chevron-right`, 20px, `text-subtlest`, `flex: none` |

The row has `spacing-md` around it and `spacing-md` between plate, text and chevron. It is 64px high.

### The badge is whole or out of view

The words give way, never the chevron. The title is cut first and the badge sits right after it: the title asks for
3rem only (its flex basis) and grows up to its own width (`max-width: max-content`).

When even 3rem and the badge do not fit, the badge wraps onto a second line that the head clips (`height: 1lh`,
`overflow: hidden`). So it is never cut and never covers the chevron.

It is still read, because it is part of the description. At the real column (21.5rem) every badge holds.

### Hover and focus are a tray's

These follow ADR-0199 and ADR-0207:

- The row takes `--on-tray-hover`.
- The plate steps to `bg-neutral`, so the area lights in one tone.
- The focus ring is `focus-ring-brand-shadow-xs`.
- Nothing moves. Under reduced motion the change is immediate.

### What a reader hears

- **The title is the control's name** (`aria-labelledby`).
- The badge and the line are its description (`aria-describedby`), read after it: « Se former », then « Recommandé
  Guides de tes modules ».
- The plate is `aria-hidden`, so whatever the product draws there is decorative.

A `brand` badge is legitimate here, because the row is a control (ADR-0149).

### The plate hands its ground down

The plate sets `--on-plate-ground`: its grey at rest, and `bg-neutral` with the row. A stack drawn on it uses that
variable for its ring, so the ring is the plate's colour in both states. This is a private context variable, like
`--on-tray-hover`.

`AvatarGroup`'s ring now reads `--on-plate-ground`, and falls back to `bg-default` as before.

### What the brief asked to expose

**`CreditCoins`** is the owner's coins (Figma `3734:2260`), out of `CreditCost`. `CreditCost` renders it at 56, so it
is measured identical: 64 × 56. Its `size` is its height (ADR-0043), and the width follows the drawing's 64:56. It is
decorative.

**`ModuleIconStack`** is `AvatarGroup`'s shape for module logos:

- Each logo overlaps the one before by a quarter of its size, the first on top.
- `max` defaults to 2, and there is no `+N`: it is an illustration, not a count.
- A logo's tile is a 30 % tint and nearly transparent, so an overlapped logo would show through the one above it. Each
  logo therefore stands on a **cut-out**: a fill of the ground it sits on, at the tile's own corner (14.2 of 48), with
  a 2px ring of the same ground.
- It is decorative.

### The three rows, as the product passes them

| Title | Line | Plate | Badge |
|---|---|---|---|
| Inviter des membres | « 1 membre » | `AvatarGroup` `xs`, two silhouettes (42 × 24) | — |
| Gérer les crédits | « Solde et tarifs » | `CreditCoins :size="32"` (36.6 × 32) | — |
| Se former | « Guides de tes modules » | `ModuleIconStack`, 24, two at most (42 × 24) | « Recommandé », `brand` |

## Measured

At 21.5rem (Storybook, Chromium):

| What | Value |
|---|---|
| Row | 312 × 64 |
| Plate | 48 × 48 |
| Text column | 212 |
| Chevron | 20, at the row's end − 8 |
| Gap between rows | 4 |
| « Se former » and its badge | 74.7 + 8 + 118.6 on one line |
| A long title | cut to 85px, badge whole after it, ending on the text column's edge |
| At 18rem | the badge leaves the line, the title takes 156px |
| Hover | row and plate `rgb(242, 244, 247)`, the stack's ring the same |
| Focus | the same ground plus the brand ring |
| `CreditCost`'s coins | 64 × 56, unchanged |

## Consequences

- The home page's right column composes `ActionList` with three `ActionListItem`s, each pointing at its page (members,
  credits, help centre).
- `ActionList`, `ActionListItem`, `CreditCoins` and `ModuleIconStack` are new exports. `ActionList` is `wip`, because it
  has one consumer.
