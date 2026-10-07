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

/**
 * `ghost` — no fill of its own: it takes the surface behind it, the bar or a
 * card's corner. `primary` — the brand fill, for the one action a composite is
 * built around: the Tolbi AI composer's send and record, where green is the
 * action (ADR-0059). The same pair as `Button`'s ghost and primary.
 *
 * `surface` — a white disc, for a control standing on a tinted ground: the
 * play button of a voice note on its `bg-neutral` bubble (ADR-0060).
 * `neutral` — the same disc the other way round, tinted on a white ground: the
 * composer's « Réécouter » (ADR-0061). A disc stands off its ground; which
 * variant is the one that does depends on the ground.
 */
export type IconButtonVariant = 'ghost' | 'primary' | 'surface' | 'neutral'

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
  variant?: IconButtonVariant
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  size: 'sm',
  variant: 'ghost',
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
    :class="[`ds-icon-button--${size}`, `ds-icon-button--${variant}`, { 'ds-icon-button--active': active }]"
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

/* ── Primary: the brand fill, as Button's primary ─────────────────── */
.ds-icon-button--primary {
  background: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
}

.ds-icon-button--primary:hover:not(:disabled),
.ds-icon-button--primary.ds-icon-button--active {
  background: var(--ds-bg-brand-solid-hover);
}

.ds-icon-button--primary:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-icon-button--primary:disabled {
  background: var(--ds-bg-disabled);
}

/* ── Surface and neutral: a disc that stands off its ground ────────── */
.ds-icon-button--surface {
  background: var(--ds-bg-default);
}

.ds-icon-button--neutral {
  background: var(--ds-bg-neutral);
}

/*
  On white, no tint can say hover — `bg-hover` is 1.045:1 against it (ADR-0044)
  — so the hover is a contour, drawn as an outline inside the edge. An outline,
  not a shadow: the focus ring owns `box-shadow`, and a hovered button that has
  the focus must show both.
*/
.ds-icon-button--surface:hover:not(:disabled),
.ds-icon-button--surface.ds-icon-button--active,
.ds-icon-button--neutral:hover:not(:disabled),
.ds-icon-button--neutral.ds-icon-button--active {
  outline: var(--ds-border-width-default) solid var(--ds-border-default);
  outline-offset: calc(-1 * var(--ds-border-width-default));
}

.ds-icon-button--surface:hover:not(:disabled),
.ds-icon-button--surface.ds-icon-button--active {
  background: var(--ds-bg-default);
}

.ds-icon-button--neutral:hover:not(:disabled),
.ds-icon-button--neutral.ds-icon-button--active {
  background: var(--ds-bg-neutral);
}
</style>
