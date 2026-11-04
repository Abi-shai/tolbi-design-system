<script setup lang="ts">
import { ref } from 'vue'
import { SwapTransition } from '../SwapTransition'

/**
 * What a tab shows (ADR-0098). `Tabs` is the tab list only, so its panel can
 * live anywhere — under it, or in a `Dialog`'s body while the list stays in its
 * `#nav`. Give both the same `tabs-id`; render the panel for the current value.
 *
 * Focusable (`tabindex="0"`, APG): from the selected tab, Tab lands on the
 * panel, even when what it holds has nothing focusable.
 *
 * **Changing tab is a swap** (ADR-0026): the two contents are one place in two
 * states and of different heights, so they cross-fade out-in at `quick` — an
 * overlap would make the container jump. And the new content **starts at its
 * top**: a panel scrolled half-way read the next tab from its middle. The
 * scroll moves while nothing is shown, between the leave and the enter.
 */
interface Props {
  /** The `id` given to the `Tabs` it belongs to. */
  tabsId: string
  /** The tab it belongs to — the current value. */
  value: string
}

defineProps<Props>()

const root = ref<HTMLElement | null>(null)

function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let e = el?.parentElement ?? null; e; e = e.parentElement) {
    const y = getComputedStyle(e).overflowY
    if ((y === 'auto' || y === 'scroll') && e.scrollHeight > e.clientHeight) return e
  }
  return null
}

/* Only when the panel's top has gone above the scroller's: a panel that is
   already in view stays where the reader put it. */
function toTop() {
  const el = root.value
  const sp = scrollParent(el)
  if (!el || !sp) return
  const above = el.getBoundingClientRect().top - sp.getBoundingClientRect().top - parseFloat(getComputedStyle(sp).paddingTop)
  if (above < 0) sp.scrollTop += above
}
</script>

<template>
  <div
    ref="root"
    :id="`${tabsId}-panel-${value}`"
    role="tabpanel"
    :aria-labelledby="`${tabsId}-tab-${value}`"
    tabindex="0"
    class="ds-tab-panel"
  >
    <SwapTransition @after-leave="toTop">
      <div :key="value" class="ds-tab-panel__content">
        <slot />
      </div>
    </SwapTransition>
  </div>
</template>

<style scoped>
.ds-tab-panel {
  min-width: 0;
  outline: none;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-tab-panel:focus-visible {
  border-radius: var(--ds-radius-inner);
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-tab-panel__content {
  min-width: 0;
}
</style>
