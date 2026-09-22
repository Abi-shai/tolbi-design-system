<script setup lang="ts">
import { computed } from 'vue'
import { Icon, type IconName } from '../Icon'

/**
 * `sm` is the navigation bar's button and the catalogue's floor for a round
 * control — `Button --icon-only` and `CloseButton` both start at 36px too.
 * `xs` goes below it, for a control riding on someone else's content rather
 * than sitting in a bar of its own.
 */
export type IconButtonSize = 'xs' | 'sm'

interface Props {
  /** The glyph. Mirrors the `Icône` instance-swap on the Figma component. */
  icon: IconName
  /** Required: the button has no text, so nothing else can name it. */
  ariaLabel: string
  /**
   * The button holds a surface open — a dropdown, a panel. Reads as hovered
   * for as long as that surface is up, so the trigger stays visibly bound to
   * what it opened.
   */
  active?: boolean
  disabled?: boolean
  size?: IconButtonSize
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  size: 'sm',
  type: 'button',
})

/*
  The **padding is what stays**, and the glyph steps. Above 36px the catalogue
  does the opposite — `Button` holds its icon at 20 from `sm` to `xl` and only
  grows the box, because a larger target needs no larger mark. Below 36 there is
  no room for that: 20px inside 32px leaves 6px a side and the glyph all but
  touches the ring. So the ramp turns over at the floor, and `xs` is the same
  8px around the next glyph down (ADR-0004: 16 is a size, 18 is not).
*/
const iconSize = computed(() => (props.size === 'xs' ? 16 : 20))

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    class="ds-icon-button"
    :class="[`ds-icon-button--${size}`, { 'ds-icon-button--active': active }]"
    @click="emit('click', $event)"
  >
    <Icon :name="icon" :size="iconSize" />
  </button>
</template>

<style scoped>
/*
  The round action button in the navigation bar: 8px around a 20px glyph = 36px
  (Figma Nav/IconButton, 613:306) — `sm`, and the floor every round control in
  the catalogue shares. `xs` is the same padding around a 16px glyph: 32px.
*/
/*
  The box is **declared, not derived** — `Button --icon-only` and `CloseButton`
  both size themselves this way, and it is what makes the size honest: this
  button is routinely given a border by whatever it sits on (`ProjectCard` puts
  one on it to lift it off a photograph), and 8px of padding plus a 1px border
  is a 34px disc claiming to be 32. With `border-box` the outer size is the size
  whatever the consumer paints on it, and the glyph stays centred by flex.
*/
.ds-icon-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ds-radius-pill);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ds-text-default);
  transition: background var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-icon-button--sm { width: 36px; height: 36px; }
.ds-icon-button--xs { width: 32px; height: 32px; }

.ds-icon-button:hover:not(:disabled),
.ds-icon-button--active {
  background: var(--ds-bg-hover);
}

/* ADR-0006: one focus treatment, and no component defines its own. */
.ds-icon-button:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-icon-button:disabled {
  cursor: not-allowed;
  color: var(--ds-text-disabled);
}
</style>
