<script setup lang="ts">
import { Icon } from '../Icon'

/**
 * The boxed control that opens a `Dropdown` — and the owner of its chrome.
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
 * Only the **boxed** trigger. `Dropdown`'s icon and avatar triggers are bare —
 * a reset `<button>` around an ornament, with no chrome to own.
 *
 * The focus ring is new. None of the three built-in triggers had a
 * `:focus-visible` rule; the one ring in `Dropdown` sits on `--avatar-open`,
 * which is the open state, not focus.
 */
export type DropdownTriggerSize = 'sm' | 'md'

interface Props {
  /**
   * Which step of the control-padding scale. `md` (10/14) is `Dropdown`'s own
   * text trigger; `sm` (8/12) suits a trigger carrying a 24px ornament, which
   * lands at the same 40px height from the other direction.
   */
  size?:      DropdownTriggerSize
  /** Drives `aria-expanded` and which way the chevron points. */
  open?:      boolean
  /** Renders the trailing chevron. */
  chevron?:   boolean
  ariaLabel?: string
  disabled?:  boolean
}

withDefaults(defineProps<Props>(), {
  size:      'md',
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
    :class="[`ds-dropdown-trigger--${size}`, { 'ds-dropdown-trigger--open': open }]"
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
.ds-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  background-color: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
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

/* ── States ───────────────────────────────────────────────────────── */
.ds-dropdown-trigger:hover:not(:disabled) {
  background-color: var(--ds-bg-hover);
}

.ds-dropdown-trigger:focus-visible {
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-dropdown-trigger:disabled {
  background-color: var(--ds-bg-disabled);
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
