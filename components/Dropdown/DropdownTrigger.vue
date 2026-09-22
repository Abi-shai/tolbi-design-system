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
 * **Two chromes, because a trigger on a recessed ground is a different animal.**
 * `boxed` is the catalogue's control: a white box with a border that is there
 * before you touch it. `quiet` is nothing at rest and materialises as you
 * interact — the form the workspace switcher takes inside `SideNavigation`,
 * where a bordered box reads as a foreign control dropped into the column.
 * That second shape lives *here* rather than in its consumer for the reason
 * ADR-0033 gave for the first: a chrome with two owners has none.
 *
 * `quiet` escalates by changing **mechanism** rather than intensity — absent,
 * then tinted, then a surface — so it survives the dark mode, where the same
 * three steps run in the opposite direction and stay monotone. It carries no
 * border in any state, which is also why it measures 40px at `sm` where `boxed`
 * measures 42.
 *
 * Only the **chromed** trigger. `Dropdown`'s icon and avatar triggers are bare —
 * a reset `<button>` around an ornament, with no chrome to own.
 *
 * The focus ring is new. None of the three built-in triggers had a
 * `:focus-visible` rule; the one ring in `Dropdown` sits on `--avatar-open`,
 * which is the open state, not focus.
 */
export type DropdownTriggerSize = 'sm' | 'md'

/** Which of the two chromes the trigger wears. */
export type DropdownTriggerChrome = 'boxed' | 'quiet'

interface Props {
  /**
   * Which step of the control-padding scale. `md` (10/14) is `Dropdown`'s own
   * text trigger; `sm` (8/12) suits a trigger carrying a 24px ornament, which
   * lands at the same 40px height from the other direction.
   */
  size?:      DropdownTriggerSize
  /**
   * `boxed` is a control before you touch it; `quiet` is nothing until you do.
   * Pick `quiet` only on a recessed ground — on `bg-default` its resting form
   * and its hover are the same pixel.
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
/* Last on purpose: the ring REPLACES the elevation rather than stacking with
   it, which only holds if this rule wins over `--open`'s shadow. */
.ds-dropdown-trigger:focus-visible {
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-dropdown-trigger:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
