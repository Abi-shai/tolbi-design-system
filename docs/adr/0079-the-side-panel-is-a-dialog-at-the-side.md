# ADR-0079 — The side panel is a dialog at the side

**Date:** 2026-10-26
**Amends:** ADR-0075 (`Dialog` gains `placement` and `size`; the dialog is never a scroller)
**Extends:** ADR-0021 (how a surface arrives), ADR-0078 (a list inside it opens over it)
**Source:** etolbi, EUDR inventory item 1 (create or edit a project, a DDR, a folder — 32 uses across
EUDR, Carbone and Yield) and item 11 (Dialog sizes). Figma « ↪ Sprint 21 — Panneau latéral »
(`2780:1427`), section 4, decided on 21 Oct.
**Status:** Accepted — the entrance (track C) awaits the owner's look at the film

## Context

The product creates and edits its objects in a side panel drawn by hand (`slideover-wrapper`, Nuxt UI),
in seven free widths. The board settled the panel on 21 Oct.: **track B, floating** — set on the page
12px off its edges, the same family as the dialog — at **512 (md)**; a fixed head in `heading-md` with
no sign; the body in sections; the rules **follow the scroll**; the foot on the right, stacked under
640px; four named widths (384 / 512 / 720 / 960). What goes to the package is the frame, the dialog's
head and foot, the rules and the widths; **the body stays the product's**. One thing was left to us,
« film à l'appui »: the entrance.

## Decisions

### Not a second component: `Dialog placement="side"`

The board calls it the dialog's « pendant latéral » — same scrim, same focus — and that is what it is:
the native `<dialog>` opened modal, the focus taken to `[data-autofocus]` or the first control, held,
and handed back; Escape, the scrim and the close dismiss; a question asked in it is a `Dialog within`
it (ADR-0075), and a list in it opens over it (ADR-0078). A second component would have been a second
copy of all of it. What differs is placement, and it is a prop.

### One width scale for both placements

`size`: `sm` 24rem, `md` 32rem (the default, and the dialog's old ceiling), `lg` 45rem (the reading
column, ADR-0064), `xl` 60rem — each a width the catalogue already had — and `full`. The product's
« Dialog lg ≈ 60rem » is `xl` here: one scale cannot let `lg` mean 45rem at the side and 60 in the
centre. The width is a ceiling (ADR-0031); `--dialog-width` is a variant switch, not a token (ADR-0010).

### What the side changes

- **The frame**: full height, 12px (`spacing-lg`) off the screen's edges, `radius-surface`,
  `border-subtle`, `elevation-overlay` — the dialog's own.
- **The head holds the description**, under the title, and stays. In the centre the description is the
  body's first paragraph; at the side the body is a form, so the default slot is **not** read as the
  description — a form announced as a description is read out whole.
- **The spacing and the rules are the owner's drawing (26 Oct.)**, made on the first variant of the
  Figma component and applied to every one: head, body and foot stand **20px apart** and **20px in**
  from the sides (the head 16 / 16 / 0 / 20); the head and the foot are each ruled off by an **inset**
  rule — it ends where their content does — 16px from that content, **always**. The board had the rules
  following the scroll; the drawing keeps them and gives the scroll a **fade** instead: the body's last
  64px (`spacing-7xl`) fade to the surface while content is left below — measured on scroll and on the
  size of the body and of what it holds (a field's error grows the content, not the box). The body keeps
  4px above and below, taken back by its margin, so a field's focus ring is not clipped. In the centre
  the dialog is as it was drawn.
- **Under 40rem** the panel takes the whole screen — no inset, corner, border or shadow — and the foot
  stacks, the action on top, both full width. A **container query** on the dialog, not a breakpoint:
  what decides is the room the panel has (ADR-0020 still has no breakpoints).
- The slot's blocks are the body's own rows (`display: contents`), so they take its rhythm.

Measured against the drawing, at `sm` on a 983px screen: surface 384 × 959, head 107, the body's content
20px under the head's rule, the rules inset 20 / 16 (head) and 20 / 20 (foot) — the foot 2px taller with
the catalogue's `sm` buttons, which are bordered (ADR-0033). On 390px, 390 × 760 edge to edge with the
foot stacked; the focus on the first field.

### The entrance: from its edge, without crossing the screen

Three tracks, filmed at a tenth of the speed and sampled every frame: **A**, the house entrance (scale
0.96 + fade, ADR-0021); **B**, a drawer sliding 524px from the screen's edge; **C**, the fade with 24px
of travel from the right in place of the scale. A says nothing about where the panel lives, and on a
full-height surface the scale moves its top and bottom edges as much as its side. B says it, and
crosses half a screen with a form nobody can read on the way. **C** — the direction says the edge, the
fade is the family's, nothing crosses. Over `considered` in (the step the scale keeps for drawers) and
`exit` out; the ease-out front-loads it, so it reads at about the 250ms the board's benchmark found.

Filming B found a defect older than the panel: **the dialog was a scroller.** The browser gives a modal
`<dialog>` `overflow: auto`, and opening it focuses the first field — which scrolled the dialog itself
to show a field still on its way in, so the surface was pulled into place on the first frame (B's
524px of travel measured 12). The dialog is `overflow: clip` now: the body is what scrolls.

## Still open

- **The entrance** is C until the owner has watched the film.
- The drawing puts a field's hint **under its label**; `FormField` puts it under the control.
- The board's UX tour (section 5) — the question on dismissing a filled form, the submitting state,
  ⌘↵ in the foot — is the product's, built from `Dialog within`, `Button loading` and the foot's slot.
