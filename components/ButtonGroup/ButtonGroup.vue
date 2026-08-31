<script setup lang="ts">
interface Props {
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  ariaLabel: undefined,
})
</script>

<template>
  <div class="ds-button-group" role="group" :aria-label="ariaLabel">
    <slot />
  </div>
</template>

<style scoped>
.ds-button-group {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  overflow: hidden;
  isolation: isolate;
}
</style>
