# ADR-0051 — The page has one heading, and it is a component

**Date:** 2026-10-01
**Extends:** ADR-0011 (a role is applied in one declaration), ADR-0003 (no Bold 700), ADR-0040 and
ADR-0046 (a slot whose fallback is a prop), ADR-0031 (a drawn width is a ceiling), ADR-0020 (no
breakpoints), ADR-0047 (the page's column owns the spacing)
**Source:** the product's request; Figma Sprint 18 `2067:5918`, the Paramètres page header
(`2067:6579`)
**Status:** Accepted

## Context

Fifty-two product pages post their `<h1>` by hand — `text-2xl`, `3xl` or `5xl`, in bold — and none
of them on a role; Bold is a weight ADR-0003 removed. The Paramètres frames draw one header for all
of them: a title, a line under it, and the page's action on the right.

## Decisions

### `heading-lg`, set on the Figma component

The request asked for `heading-lg`. The frame applies `heading-xl`, and that role's description read
*Page title* — so the first build took `heading-xl` and called the request's word a mistake.
Reviewed on the Figma component, the design owner set the title to **`heading-lg`** (20/28), which is
what the request had said. The descriptions were the half that was wrong, and they were rewritten:
`heading-lg` now names the page title, and `heading-xl` — whose other consumers are figures,
`ChartTooltip`'s value and `ModuleCapsule`'s — says it is not one. A description that argues for a
choice nobody made is the vocabulary rotting (ADR-0015).

### The API

- `title`, required — rendered as the page's only `<h1>`.
- `subtitle`, and `#subtitle` with the prop as its fallback content — ADR-0040's `snapshot`,
  ADR-0046's `panelTitle`. A link or a word in bold goes in the slot. Neither: no line, and no gap,
  because the gap is a flex `gap` and leaves with the element.
- `#actions` — the page's buttons. Their size and variant are the page's; the header only places
  them.

### No outer margin

The 24px under the header in the frame belongs to the page, which spaces all its blocks alike —
ADR-0047's argument, one level down.

### Geometry, read off the frame

`spacing-xs` between title and subtitle, `spacing-xl` between the text and the actions, the actions
centred on the text block (the frame's `CENTER`). The frame fixes the subtitle at 720px, which is a
measure and so a ceiling (ADR-0031): `max-width: 45rem`.

Measured at 1128px: **1128 × 52**, as the Figma component — the title 20/28 at y 0, the line at
y 32, the button centred, 46px tall with the 2px every bordered control adds (ADR-0033). Without a
subtitle the row is the button's height; with neither subtitle nor actions, the title's 28.

### In a narrow column, the actions drop under the text

The product asked, and the answer is yes — intrinsically, not at a breakpoint, since the catalogue
has none (ADR-0020). The row wraps when the text would get narrower than `20rem`: the actions land on
their own line, left-aligned, `spacing-xl` below. The threshold is `flex: 1 1 0` with
`min-width: min(20rem, 100%)` on the text; a basis of `auto` would have wrapped a long subtitle at
full width. It answers to the column the header sits in, not to the window. Measured at 420px with
two actions: the text full width, the actions at y 68.

### A `<div>`, not a `<header>`

Outside a sectioning element a `<header>` is the page's banner landmark, and `HorizontalNavigation`
already is that.

### Figma

A `PageHeader` component on Home (`2103:4619`): `Titre`, `Sous-titre`, `Avec sous-titre`, an
`Actions` slot holding a primary `lg` Button by default, and `Avec actions`. Figma cannot express the
wrap, and the component's description says so.

## Still open

- The fifty-two pages migrate on the product's side.
- `20rem` is drawn nowhere: no frame shows the narrow state, so the threshold is this ADR's choice.
