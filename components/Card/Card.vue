<script setup lang="ts">
export type CardVariant = 'outlined' | 'elevated' | 'sunk'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  variant?: CardVariant
  /** Padding applied to the header, body and footer alike. */
  padding?: CardPadding
}

withDefaults(defineProps<Props>(), {
  variant: 'outlined',
  padding: 'md',
})

const slots = defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: () => unknown
}>()
</script>

<template>
  <div class="ds-card" :class="[`ds-card--${variant}`, `ds-card--pad-${padding}`]">
    <div v-if="slots.header" class="ds-card__header">
      <slot name="header" />
    </div>

    <div class="ds-card__body">
      <slot />
    </div>

    <div v-if="slots.footer" class="ds-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/*
 * The surface every tile and panel sits on. It exists to stop geometry from
 * drifting: the radius is NOT a prop, because divergent radii were the defect
 * this component was introduced to remove.
 */
.ds-card {
  --card-pad: var(--ds-spacing-xl);

  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--ds-radius-surface);
  background-color: var(--ds-bg-default);
}

.ds-card--outlined { border: 1px solid var(--ds-border-subtle); }

.ds-card--elevated {
  border: 1px solid var(--ds-border-subtle);
  box-shadow: var(--ds-elevation-surface);
}

.ds-card--sunk {
  border: 1px solid transparent;
  background-color: var(--ds-bg-neutral-subtle);
}

.ds-card--pad-none { --card-pad: 0px; }
.ds-card--pad-sm   { --card-pad: var(--ds-spacing-lg); }
.ds-card--pad-md   { --card-pad: var(--ds-spacing-xl); }
.ds-card--pad-lg   { --card-pad: var(--ds-spacing-3xl); }

.ds-card__header,
.ds-card__body,
.ds-card__footer {
  padding: var(--card-pad);
  min-width: 0;
}

/* Dividers only appear when there is something to divide. */
.ds-card__header { border-bottom: 1px solid var(--ds-border-subtle); }
.ds-card__footer { border-top: 1px solid var(--ds-border-subtle); }

.ds-card__body { flex: 1 1 auto; }
</style>
