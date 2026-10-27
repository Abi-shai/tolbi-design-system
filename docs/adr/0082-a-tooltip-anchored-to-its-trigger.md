# ADR-0082 — A tooltip anchored to its trigger, and a list named with its value

**Date:** 2026-10-27
**Amends:** ADR-0066 (`Tooltip` was a bubble only), ADR-0078 (`useAnchoredSurface` gains sides and centring)
**Closes:** ADR-0077's « `Tooltip` anchoring » and ADR-0078's « tooltips » (still-open items); ADR-0081's first
still-open item (a list in a `FormField` lost its value). ADR-0077's « a deletion `IconButton` » was answered by
ADR-0081 (item 31: `Button` icon-only `danger-secondary`).
**Source:** etolbi, EUDR adoption, item 17 — « Tooltip ne s'ancre à rien (ni déclencheur ni placement). Proposition :
il enveloppe son déclencheur (slot par défaut), placement, délai, déclencheur désactivé géré. »
**Status:** Accepted

## Context

`Tooltip` was the bubble alone: nine arrows, a dark fill, nothing that opened it or placed it. Every component that
wanted one wrote the same twenty lines — a wrapper, `useDelayedTooltip`, a `SurfaceTransition`, an absolute box —
and the product had nothing to write them with. The look was settled; what was missing was behaviour, and the
catalogue's rules for it already existed (ADR-0066: 400ms, hover or focus, dismissed on press; ADR-0073: a focus
opens it only when `:focus-visible`). So this item went straight to code: no new visual to validate.

## Decisions

### With a slot, it is anchored

`<Tooltip title placement><trigger /></Tooltip>` wraps its trigger in an inline box and opens by itself, on the
catalogue's rules — `useDelayedTooltip`, the same one the Tolbi AI tooltips use. It is gone when the pointer or the
focus leaves, on a press, and on **Escape** — which it takes (`preventDefault`), so a dialog under it hears the next
one (WCAG 1.4.13: dismissible). Without a slot it is the bubble, as before, so the eight components that place
their own are untouched (the bubble moved to an internal `TooltipBubble`; consumers' classes still land on it).

**The delay is not a prop**, though the product asked for one: it is the catalogue's, so every tooltip answers at
one pace (ADR-0066's argument, unchanged).

### Placed in the top layer, turning at the edge

`placement` is `top | top-start | top-end | bottom | bottom-start | bottom-end | left | right`. The bubble is a
`popover="manual"` placed by `useAnchoredSurface` (ADR-0078), which gains a **`side`** (`below`, `above`, `left`,
`right` — each flips to its opposite when it is short there and the opposite has more room) and **`center`**
alignment, and returns **`placed`**, where it went, so the arrow points at the trigger from whichever side it
landed. The gap is the catalogue's 4px, written as the bubble's margin on the axis it faces. The lists' default
(`below`, `start`/`end`) is unchanged. Measured: 4px on all eight sides, centred to the pixel, `-start`/`-end`
flush with the trigger's edge; at the top of the screen `top` turned `bottom`, at the right edge `right` turned
`left`.

### Described, unless it only repeats the name

The text sits in a hidden span inside the wrapper and the trigger is `aria-describedby` it — there before the
bubble appears and read whether it shows or not; the bubble itself is `aria-hidden`. When the text is already the
trigger's name (an `IconButton` whose `ariaLabel` is the tooltip), it is not added: a name read twice.

### A disabled trigger still shows it

A disabled control drops the pointer, so the wrapper takes it (`pointer-events: none` on a `:disabled` or
`aria-disabled` child) and the tooltip that says *why* still comes. A keyboard cannot reach a disabled control, so
the docs say to prefer `aria-disabled` when the tooltip carries the reason.

### A list in a field is named with its value

ADR-0081 fixed `ariaLabel`; the same loss happened inside a `FormField`, where the `<label for>` names the button
and drops its contents — « Pays », never « Pays Sénégal ». `FormField` now hands its label's id down
(`labelId` on the context, optional, absent in a `group`), and `InputDropdown` is `aria-labelledby` the label then
the value. **Nothing chosen, the label alone**: the placeholder is not a value, and « Type de culture Type de
culture » is what reading it gave.

Verified in the browser: eight placements, keyboard focus opens it and Escape closes it, a click's focus does not
open it, the icon button is not described twice, the disabled button shows it; the bubble alone keeps its 320px
rich width, `HelpIcon`, the launcher and the collapsed rail still place theirs; « Team member » → « Team member
Olivia Rhye » after a choice.

## Still open

- The bubble is never hovered (`pointer-events: none`): it names, it holds nothing to reach. A tooltip with a
  link in it would be a popover, not this.
- The eight components that place their own bubble could move to the anchored form; none is broken, so none moved.
