# ADR-0104 — The cost before the click

**Date:** 2026-11-05
**Extends:** ADR-0081 (`Dialog`'s `#summary`), ADR-0079 (`Dialog placement="side"`), ADR-0006 (a tone never says it
alone), ADR-0054 (credits belong to the module)
**Source:** the owner's brief of 5 Nov. (« dire ce qu'une action coûte en crédits »), the Figma board
« ↪ Crédits — dire ce qu'une action coûte » (`3715:1427`), and his drawing of the foot (`3734:2259`).
**Status:** Accepted

## Context

Many actions consume a module's credits, and the user almost never knows how many before acting: Yield asks in a
modal outside the package, EUDR and ARR show a tooltip under 20 credits, Crop mapping says so in an error toast
after the server refused, dMRV says nothing.

The benchmark (78 captures, 51 products, board section 1c) settles three things. **Little text**: the cost takes 0
to 2 lines, in the button or in one sentence. **Not enough** is a title-and-sentence state with one main action —
buy or upgrade — and no product counts what is missing. **The currency is small**: a 12–24px glyph by the number;
a large illustration shows what is bought, never the currency, and **no product writes in the illustration's place
(0 of 78)**. Earth-observation products — the closest to Tolbi — put the cost next to the action that spends it
(PIX4Dfields « Area · Cost · Balance », Planet « Estimated quota cost », UP42).

The product can know the cost **before the click**: it depends on what the form already holds (Yield's
`/api/yield/estimate` takes the area, years, season and crop, debits nothing, and can be called as the form
changes). Several tracks were drawn — a confirmation modal in four forms, a cost block above the panel's foot, the
cost in the foot — and the owner chose **the foot**, then the illustration: **his own composition** of the Tolbi
coin (two lying, one tilted), at 56px.

## Decisions

### The cost lives in the foot of the panel that launches the action

`CreditCost` goes in `Dialog placement="side"`'s `#summary` slot: the cost on the left, the action on the right, so
the number and the button that spends it are read together. The summary is already a `role="status"`, so a cost
that moves with the form is announced. **This is the pattern for every action that consumes credits and is launched
from a creation panel**, whatever the module. Actions launched from elsewhere are not decided here.

### The owner's drawing, to the pixel

The illustration (64 × 56), 8px (`spacing-md`), then « Coût en crédits » in `body-sm` / `text-subtle` over the
number alone in `heading-lg` / `text-strong`, tabular. The unit is in the label, so the number stays one word.

### Three facts, in the order of the form's life

| | `cost` | shows |
|---|---|---|
| the form cannot price it yet | `undefined` | « — » in `text-subtlest` (read: « Pas encore calculé ») |
| the price is being computed | `null` | a `strong` placeholder in the number's line box |
| priced | a number | the number, written by `Intl` in `locale` |

The number's line box holds in every state, so the foot does not move when the price arrives; the states swap
through `SwapTransition` (ADR-0026).

### Not enough is derived, never declared

Given `balance`, a cost above it turns the number to `text-error` **and** adds `circle-alert` (ADR-0006), with
« Crédits insuffisants » read after the number. What the user can do about it is the product's: its primary action
becomes « Acheter des crédits » in `#actions`. The component does not count what is missing — no product does, and
the owner asked for two versions, not arithmetic.

### The artwork is the owner's, and decorative

The composition is exported from Figma at 3× (`credit-coins.png`, 192 × 168, 14 KB) and inlined by the library build
like `CreditsChip`'s coin. It has no text in it and `alt=""`: the label says what the number is.

## Not done

- **No confirmation modal on top** when the cost is shown before the click — the benchmark's products that show it
  do not confirm, except for a heavy order.
- **No `CreditCoin` component yet**: the coin exists as `CreditsChip`'s 24px glyph and this composition. A shared
  artwork component (generated, vector) waits for a third consumer.
- **The backend**: only Yield can estimate before the click today. EUDR, ARR, dMRV and Crop mapping need an
  estimation route each; a price copied into the front would drift from the server's.
