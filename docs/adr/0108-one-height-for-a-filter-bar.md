# ADR-0108 — One height for a filter bar

**Date:** 2026-11-05
**Amends:** ADR-0084 (`ButtonGroup`'s rail, 42px only), ADR-0101 (`sm` is 38px)
**Source:** the owner, 5 Nov., on the dMRV monitoring table (Figma `3775:1643`): the search, the filter and the
grid/table switcher on one line, « la même taille que le switcher ».
**Status:** Accepted

## Context

A list's filter bar holds three controls: a search (`InputField`), a filter (`InputDropdown`) and the view switcher
(`ButtonGroup`). Measured in Storybook, no size made them one line: the fields stood 46px at `md`, the switcher 42px
(ADR-0084's rail, no size prop) — and `InputField sm` stood **42px**, not the 38px ADR-0101 gave `sm`, because it took
the sm padding and kept the md type (16/24). `InputDropdown sm` was the only control at 38.

## Decisions

- **`ButtonGroup size="sm"`** (`ButtonGroupSize = 'sm' | 'md'`, default `md`): the rail keeps its 4px inset and its
  border, the segments go **32 → 28**, so the rail is **38px**. The type does not shrink (it is the field's 14px), the
  glyph goes 20 → 16. The group says the size once; the segments read it from the group's context.
- At `sm` the radius follows the element (ADR-0013): the rail takes `radius-control`, the pill and the segments
  `radius-inner-sm` — `Tabs xs`' geometry.
- **`InputField sm` is 38px**: `control-padding-sm` and the 14/20 type (`body-md`) for the value and the leading text.
  Its one consumer in the package — the conversation search in Tolbi AI's history — goes 42 → 38 with it.
- A filter bar is **all `sm`**: search, filter and switcher measured 38.0px each, on one top edge.

## Amended (5 Nov.) — the multi-criteria filter and the action

etolbi asked for Yield's « Filtres » (a panel of several criteria with the active count) and reported `Button sm` at
36px and `DropdownTrigger sm` boxed at 42. **Measured in the package, both are 38**: `control-padding-sm` (8/12) around
the 20px line box of `label-lg-strong`, plus the border (ADR-0033 — the token's « 36px » omits it). What makes a trigger
42 is its content: a **`Badge md` is 24px**. So nothing new ships:

- **The filter** is a `Dropdown` whose `#trigger` is a `DropdownTrigger` boxed `sm` — `filter` glyph at 16, the word,
  the active count in a **`Badge sm`**, the chevron. 38px, measured. The panel is the product's.
- **An action in the bar** (« Télécharger la liste ») is a `Button sm`: 38px rendered, so yes, it shares the line.
- The story « In a filter bar » carries the whole line: search, list, filters, action, view — five controls, 38.0px each.

## Not done

- No `ButtonGroup` `lg`: no consumer.
- `InputDropdown sm` still hugs its value (ADR-0080) — a filter that must hold a width is given one by the product.
