<script setup lang="ts">
import { Icon, type IconName } from '../Icon'

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
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    class="ds-icon-button"
    :class="{ 'ds-icon-button--active': active }"
    @click="emit('click', $event)"
  >
    <Icon :name="icon" :size="20" />
  </button>
</template>

<style scoped>
/*
  The round action button in the navigation bar: 8px around a 20px glyph = 36px
  (Figma Nav/IconButton, 613:306). One size, because the component has one.
*/
.ds-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-pill);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ds-text-default);
  transition: background var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

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
