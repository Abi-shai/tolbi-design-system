<script setup lang="ts">
/**
 * A rule (ADR-0088, track A): a `border-subtle` hairline, **no margin of its
 * own** — the space around it is the layout's (11 / 13; Fluent: « margins are
 * not baked into the divider »).
 *
 * Alone it is a separator (`<hr>`, or `role="separator"` upright beside items
 * in a bar). With a `label` it is no longer one: the two lines are
 * decoration and the label is plain text read where it stands (MUI: a
 * separator holding text is `presentation`) — a label inside a separator is
 * not sure to be read. `align="start"` keeps 8px of line before the label
 * (Fluent); `center` is for « ou ».
 */
interface Props {
  label?: string
  align?: 'start' | 'center'
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  align: 'start',
  orientation: 'horizontal',
})
</script>

<template>
  <span
    v-if="orientation === 'vertical'"
    class="ds-divider ds-divider--vertical"
    role="separator"
    aria-orientation="vertical"
  />
  <div v-else-if="label" class="ds-divider ds-divider--labelled" :class="`ds-divider--${align}`">
    <span class="ds-divider__line ds-divider__line--before" aria-hidden="true" />
    <span class="ds-divider__label">{{ label }}</span>
    <span class="ds-divider__line" aria-hidden="true" />
  </div>
  <hr v-else class="ds-divider" />
</template>

<style scoped>
.ds-divider {
  margin: 0;
  border: 0;
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-divider--vertical {
  display: inline-block;
  align-self: stretch;
  min-height: 1em;
  border-top: 0;
  border-left: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-divider--labelled {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  border-top: 0;
}

.ds-divider__line {
  flex: 1;
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

/* At the start, a stub of line before the label rather than none. */
.ds-divider--start .ds-divider__line--before {
  flex: 0 0 var(--ds-spacing-md);
}

.ds-divider__label {
  flex: none;
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}
</style>
