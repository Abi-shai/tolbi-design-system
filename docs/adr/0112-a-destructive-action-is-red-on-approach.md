# ADR-0112 — A destructive action is red on approach

**Date:** 2026-11-05
**Amends:** ADR-0111 (the row's actions take a neutral veil — except a destructive one)
**Source:** the owner, 5 Nov., after ADR-0111: « et quand c'est des actions de type destructives ? On peut bencher
aussi dans ce sens et voir si on peut faire mieux ». Track A of Figma `3785:1465`, chosen.
**Status:** Accepted

## Context

A row's delete was a neutral ghost like its neighbours: grey at rest, the neutral veil on hover. Nothing said, until
the confirmation, that it destroys.

Benchmarked on 13 systems (`.context/table-actions/destructive/`, 92 captures, measured where public):

- a « danger » icon-button variant is **red at rest** in 9 of 9 systems that have one;
- on hover, **6** lay a red veil or tint (4–16 %), **2** a solid red with a white glyph (Primer, Carbon), **1** a
  neutral veil with a darker red ink (Polaris);
- yet in their own table demos the inline trash is **neutral** (Primer, MUI — our state), red only at Mantine;
- inside a « ⋯ » menu the destructive item is last, after a divider;
- after the click: a modal, a popconfirm (Ant Design), an immediate delete (MUI), an undo toast (several products);
- several reds fail AA (shadcn 3.97, Radix 3.91, Ant Design 2.34 on hover).

## Decision — neutral at rest, red on approach

`IconButton` takes **`tone: 'neutral' | 'danger'`** (meant for `ghost` and `subtle`). With `danger`, the button is its
variant's ink at rest; under the pointer, under the keyboard's focus, or while its menu is open (`active`), it takes
**a red veil — `text-error` at 12 %, 18 % pressed — and the ink `text-on-error-subtle`**.

- A list of rows stays calm: the danger is said when it is aimed at, not on every row the pointer crosses.
- A veil, not a fill: translucent, it reads on white and on a hovered row alike. Measured on the hovered row:
  **1.212:1 light, 1.183:1 dark**; the ink **5.19:1 / 4.09:1** — above the 3:1 a glyph owes, where much of the market
  falls under it.
- The veil takes `text-error`, not `bg-error-solid`: the red travels toward the light end in dark (ADR-0029), and the
  solid's 10 % vanished there (1.053:1).
- `Table`'s neutral veil (ADR-0111) leaves a `danger` button alone.

Not chosen: **B**, red as soon as the row is hovered (every row the pointer crosses turns a glyph red); **C**, a solid
red under the pointer (the loudest, for a gesture a confirmation modal already guards).

## Not done

- No « ⋯ » menu pattern for a row's actions, and no change after the click: the confirmation stays `ConfirmDialog`
  (ADR-0075/0076).
