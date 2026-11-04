<script setup lang="ts">
/**
 * What a tab shows (ADR-0098). `Tabs` is the tab list only, so its panel can
 * live anywhere — under it, or in a `Dialog`'s body while the list stays in its
 * `#nav`. Give both the same `tabs-id`; render the panel for the current value.
 *
 * Focusable (`tabindex="0"`, APG): from the selected tab, Tab lands on the
 * panel, even when what it holds has nothing focusable.
 */
interface Props {
  /** The `id` given to the `Tabs` it belongs to. */
  tabsId: string
  /** The tab it belongs to — the current value. */
  value: string
}

defineProps<Props>()
</script>

<template>
  <div
    :id="`${tabsId}-panel-${value}`"
    role="tabpanel"
    :aria-labelledby="`${tabsId}-tab-${value}`"
    tabindex="0"
    class="ds-tab-panel"
  >
    <slot />
  </div>
</template>

<style scoped>
.ds-tab-panel {
  min-width: 0;
  outline: none;
}

.ds-tab-panel:focus-visible {
  border-radius: var(--ds-radius-inner);
  box-shadow: var(--ds-focus-ring-brand);
}
</style>
