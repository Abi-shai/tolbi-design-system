<script setup lang="ts">
import { Icon } from '../Icon'

/**
 * The control that opens a `Dropdown` — and the owner of its chrome.
 *
 * ADR-0001 says a pattern the design system already serves must be imported,
 * not re-drawn. The trigger was the counter-example: `Dropdown` hard-coded three
 * of them, so anything that needed a fourth shape composed its own box out of
 * control tokens and drifted. Figma's `WorkspaceSelector` did exactly that — it
 * lost `elevation-control` and landed on `8px 12px 8px 8px`, which is off the
 * control-padding scale entirely.
 *
 * So the box is a component and the content is a slot: padding, border, radius,
 * elevation, hover and the focus ring live here and cannot be forgotten, while
 * what sits inside is open.
 *
 * **Three chromes, because a trigger on a recessed ground is a different animal.**
 * `boxed` is the catalogue's control: a white box with a border that is there
 * before you touch it. `quiet` is nothing at rest and materialises as you
 * interact. `surface` is the opposite end — a raised white pill that is already
 * a control before you touch it, which is the form the workspace switcher takes
 * inside `SideNavigation`. All three live *here* rather than in a consumer for
 * the reason ADR-0033 gave for the first: a chrome with two owners has none.
 *
 * `quiet` escalates by changing **mechanism** rather than intensity — absent,
 * then tinted, then a surface — so it survives the dark mode, where the same
 * three steps run in the opposite direction and stay monotone. It carries no
 * border in any state, which is also why it measures 40px at `sm` where `boxed`
 * measures 42.
 *
 * `surface` starts where `quiet` ends, and that is the whole difficulty: the
 * resting state **is** `bg-default`, so the fill axis is spent before the first
 * state. Measured on the white pill, every neutral tint is ≤ 1.474:1 and
 * `bg-hover` lands at 1.045:1 — ADR-0036's own sentence (*a `bg-*` token is
 * solved against `bg-default`*) arrived at from the other end. So it escalates
 * on the two axes that still have room, **the contour and the ink**:
 *
 * - **rest** has no contour, and `text-default`.
 * - **hover** draws one in `border-default` and promotes the ink to
 *   `text-strong` (10.46:1 → 17.75:1 light, 10.22:1 → 12.58:1 dark). The first
 *   step is a mechanism — absent to present — which is why it reads at 1.474:1.
 * - **focus** is hover plus the ring, and nothing else: the same state, reached
 *   by the other input.
 * - **open** keeps the contour and changes its register to `border-brand`, the
 *   one brand value over 3:1 on a white pill in **both** modes (3.289:1 and
 *   5.058:1, the dark file keeping brand.300).
 *
 * Not three rungs of elevation, which was the first drawing: `surface` →
 * `raised` → `overlay` is indistinguishable at 48px in light and identical in
 * dark, where a shadow stops separating at all (ADR-0030).
 *
 * Only the **chromed** trigger. `Dropdown`'s icon and avatar triggers are bare —
 * a reset `<button>` around an ornament, with no chrome to own.
 *
 * The focus ring is new. None of the three built-in triggers had a
 * `:focus-visible` rule; the one ring in `Dropdown` sits on `--avatar-open`,
 * which is the open state, not focus.
 */
export type DropdownTriggerSize = 'sm' | 'md'

/** Which of the three chromes the trigger wears. */
export type DropdownTriggerChrome = 'boxed' | 'quiet' | 'surface'

interface Props {
  /**
   * Which step of the control-padding scale. `md` (10/14) is `Dropdown`'s own
   * text trigger; `sm` (8/12) suits a trigger carrying a 24px ornament, which
   * lands at the same 40px height from the other direction.
   */
  size?:      DropdownTriggerSize
  /**
   * `boxed` is a control before you touch it; `quiet` is nothing until you do;
   * `surface` is a raised pill that is already one. Pick `quiet` or `surface`
   * only on a recessed ground — on `bg-default`, `quiet`'s resting form and its
   * hover are the same pixel, and `surface` disappears into the page.
   */
  chrome?:    DropdownTriggerChrome
  /** Drives `aria-expanded` and which way the chevron points. */
  open?:      boolean
  /** Renders the trailing chevron. */
  chevron?:   boolean
  ariaLabel?: string
  disabled?:  boolean
}

withDefaults(defineProps<Props>(), {
  size:      'md',
  chrome:    'boxed',
  open:      false,
  chevron:   false,
  ariaLabel: undefined,
  disabled:  false,
})
</script>

<template>
  <button
    type="button"
    class="ds-dropdown-trigger"
    :class="[
      `ds-dropdown-trigger--${size}`,
      `ds-dropdown-trigger--${chrome}`,
      { 'ds-dropdown-trigger--open': open },
    ]"
    :aria-expanded="open"
    :aria-label="ariaLabel"
    :disabled="disabled || undefined"
    aria-haspopup="true"
  >
    <slot />
    <Icon
      v-if="chevron"
      :name="open ? 'chevron-up' : 'chevron-down'"
      :size="20"
      class="ds-dropdown-trigger__chevron"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
/* Shared by both chromes: geometry, type, and the two transitions. */
.ds-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-default);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-dropdown-trigger--md {
  padding: var(--ds-control-padding-md);
}

.ds-dropdown-trigger--sm {
  padding: var(--ds-control-padding-sm);
}

/* `currentColor`, not `text-default` — carried over from `Dropdown`, where it
   was harmless because that trigger had no disabled state. Pinned, the chevron
   stays dark while the label dims, since the `:disabled` rule sets the button's
   colour and a pinned child ignores it. ADR-0028: in code a glyph is
   `currentColor`. */
.ds-dropdown-trigger__chevron {
  flex: none;
  color: currentColor;
}

/* ── Boxed ────────────────────────────────────────────────────────── */
.ds-dropdown-trigger--boxed {
  background-color: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
}

.ds-dropdown-trigger--boxed:hover:not(:disabled) {
  background-color: var(--ds-bg-hover);
}

.ds-dropdown-trigger--boxed:disabled {
  background-color: var(--ds-bg-disabled);
}

/* ── Quiet ────────────────────────────────────────────────────────── */
/*
  Nothing at rest. The order below is load-bearing: `open` has to beat the
  hover tint *and* the focus tint, so it comes after both, and `:disabled`
  comes after `open` — a disabled trigger cannot be open, but it can carry the
  class from a consumer that forgot.

  A pill, not `radius-control`: this is a mark, not a destination. The ground
  it sits on is `bg-neutral`, and the hover tint measures 1.054:1 against it —
  faint by construction, because the neutral family has exactly one step above
  that ground before it reaches `bg-default`, which the open state takes.
*/
.ds-dropdown-trigger--quiet {
  background-color: transparent;
  border: none;
  border-radius: var(--ds-radius-pill);
  box-shadow: none;
}

/* Keyboard focus earns the same surface the pointer gets, not only the ring. */
.ds-dropdown-trigger--quiet:focus-visible {
  background-color: var(--ds-bg-neutral-subtle);
}

.ds-dropdown-trigger--quiet:hover:not(:disabled):not(.ds-dropdown-trigger--open) {
  background-color: var(--ds-bg-neutral-subtle);
}

/* Open: the trigger becomes the surface its panel belongs to. */
.ds-dropdown-trigger--quiet.ds-dropdown-trigger--open {
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
}

/* `bg-disabled` aliases gray-light/100, which *is* `bg-neutral` — painting it
   on this ground measures 1.000:1. So the disabled form is the resting form
   with the colour dimmed, and nothing else. */
.ds-dropdown-trigger--quiet:disabled {
  background-color: transparent;
}

/* ── Shared states ────────────────────────────────────────────────── */
/* After the two chromes above on purpose: the ring REPLACES the elevation
   rather than stacking with it, which only holds if this rule wins over
   `--open`'s shadow. `surface` is the one chrome that opts out, and it does so
   by sitting further down the file — see its own `:focus-visible` below. */
.ds-dropdown-trigger:focus-visible {
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-dropdown-trigger:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

/* ── Surface ──────────────────────────────────────────────────────── */
/*
  Last in the file, and that is load-bearing: `.ds-dropdown-trigger--surface`
  and `.ds-dropdown-trigger` carry the same specificity once a pseudo-class is
  attached to each, so order is what lets this chrome keep its contour and its
  relief through focus where the other two hand the whole `box-shadow` to the
  ring.

  The contour is an **inset** shadow rather than a `border`, because a border
  that appears on a state costs the control 2px and this one has to stay on the
  48px the mark gives it. `--dropdown-trigger-contour` is a *variant switch*,
  not a token (ADR-0010): a component-scoped name that aliases a semantic one,
  so each state moves a single colour instead of rewriting a shadow list that
  would then disagree with itself.
*/
.ds-dropdown-trigger--surface {
  --dropdown-trigger-contour: transparent;

  background-color: var(--ds-bg-default);
  border: none;
  border-radius: var(--ds-radius-pill);
  box-shadow:
    inset 0 0 0 var(--ds-border-width-default) var(--dropdown-trigger-contour),
    var(--ds-elevation-surface);
}

/* The contour appears, and the ink promotes with it. `border-default` measures
   1.474:1 on the pill in light and 2.194:1 in dark — under the 3:1 a persistent
   state indicator owes, which is why the ink carries the step too and why the
   *open* state gets the token that does clear it. A hover is transient and
   pointer-only; a "you can open this" is not the same claim as "this is open".

   `:not(--open)` is what stops it winning over the brand contour: this selector
   is one specificity step heavier (`:not(:disabled)` counts its argument), so
   without it, hovering an open trigger would walk the contour back to grey. */
.ds-dropdown-trigger--surface:hover:not(:disabled):not(.ds-dropdown-trigger--open) {
  --dropdown-trigger-contour: var(--ds-border-default);
  color: var(--ds-text-strong);
}

/* Keyboard focus earns what the pointer earns, plus the ring.
   `focus-ring-gray-shadow-sm` carries shadow.sm — which *is* `elevation-surface`
   — so the pill keeps its relief instead of flattening for the ring's duration.
   The contour is read from the property rather than restated, so a trigger that
   is open *and* focused keeps the brand one: `--open` sets the value later in
   the file, and a custom property resolves from the winning cascade value, not
   from where the `box-shadow` that uses it happens to be written. */
.ds-dropdown-trigger--surface:focus-visible {
  --dropdown-trigger-contour: var(--ds-border-default);
  color: var(--ds-text-strong);
  box-shadow:
    inset 0 0 0 var(--ds-border-width-default) var(--dropdown-trigger-contour),
    var(--ds-focus-ring-gray-shadow-sm);
}

.ds-dropdown-trigger--surface.ds-dropdown-trigger--open {
  --dropdown-trigger-contour: var(--ds-border-brand);
  color: var(--ds-text-strong);
}

/* The pill gives the surface back rather than fading it: a switcher you cannot
   open is not a raised control. */
.ds-dropdown-trigger--surface:disabled {
  background-color: var(--ds-bg-neutral-subtle);
  box-shadow: none;
}
</style>
