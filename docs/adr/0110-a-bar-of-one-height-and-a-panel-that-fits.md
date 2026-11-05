# ADR-0110 — An icon square is its text sibling's height; a dialog panel says its width

**Date:** 2026-11-05
**Amends:** ADR-0108 (the filter bar), ADR-0078 (the panel's height), ADR-0101 (the panel's width)
**Source:** etolbi, 0.90 applied: « Plus d'actions » and Paramètres › Crédits' filter (`Button sm` icon-only) at 36px
beside a 38px search; Yield's multi-criteria filter in a `Dropdown role="dialog"` held to 240px wide (a ~300px calendar
inside) and ~320px tall with room to spare — patched in the product with `:deep(.ds-dropdown__panel)`.
**Status:** Accepted

## Context

`Button`'s icon-only squares were declared at the padding tokens' heights (24/36/40/44/36/48/56), and those heights omit
the border (ADR-0033) — so measured, **every icon-only button stood 2px under the text button of its size** (6px at
`2xl`). `Dropdown`'s panel had one width per size (240 / 160) and its list a fixed 320px cap, both right for a menu's
rows and wrong for a panel holding a form.

## Decisions

- **An icon-only square is as tall as its text sibling**, measured: `xs` 26, `sm` 38, `md` 42, `lg` 46, `lg-compact`
  38, `xl` 50, `2xl` 62 — border-box, declared. A bar's `sm` icon button now sits at the line's 38. The package's own
  consumers follow: `MapControls`, `MapPanel`'s fold, `Pagination`'s arrows (each +2px).
- **`Dropdown` takes `width`** — any CSS length, set on the panel as `--dropdown-panel-width`. Unset, the size's
  (240 / 160): a menu's rows are not a form. Capped at the screen. `TolbiAiPanel`'s history, which forced its 320px
  through `:deep()`, now says `width="20rem"`.
- **A `role="dialog"` panel's height follows the room** under (or over) its trigger — `--anchor-room` (ADR-0078) is its
  only cap, and its body scrolls past it; the header and footer stay outside the scroll. A `menu` keeps its 320px list:
  a list of actions longer than that is a list to shorten. Measured: in a 900px window the story's filter opens 429px
  tall without scrolling; in 420px it is capped at the room and scrolls.

## Consequence

The conversation switcher (`role="dialog"`) is no longer held at 320px tall: it takes the panel's height under the head.
