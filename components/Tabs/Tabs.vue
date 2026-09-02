<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'
import { Badge } from '../Badge'

export type TabsSize = 'sm' | 'md'

export interface TabsItem {
  value: string
  label: string
  badge?: string | number
}

interface Props {
  modelValue: string
  tabs: TabsItem[]
  size?: TabsSize
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const badgeSize = computed(() => (props.size === 'md' ? 'md' : 'sm') as 'sm' | 'md')
const activeIndex = computed(() => props.tabs.findIndex(t => t.value === props.modelValue))

// ── Sliding indicator ──────────────────────────────────────────────────
const {
  containerRef,
  itemRefs: tabRefs,
  style: indicatorStyle,
  ready: indicatorReady,
  measure,
} = useSlidingIndicator(activeIndex)

watch(() => props.tabs, async () => { await nextTick(); measure() }, { deep: true })

// ── Keyboard navigation ────────────────────────────────────────────────
function activate(index: number) {
  const clamped = Math.max(0, Math.min(props.tabs.length - 1, index))
  emit('update:modelValue', props.tabs[clamped].value)
  tabRefs.value[clamped]?.focus()
}

function onKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); activate(i - 1) }
  if (e.key === 'ArrowRight') { e.preventDefault(); activate(i + 1) }
  if (e.key === 'Home')       { e.preventDefault(); activate(0) }
  if (e.key === 'End')        { e.preventDefault(); activate(props.tabs.length - 1) }
}
</script>

<template>
  <div
    ref="containerRef"
    :class="['ds-tabs', `ds-tabs--${size}`]"
    role="tablist"
  >
    <!-- Sliding active indicator — lives behind the buttons -->
    <div
      class="ds-tabs__indicator"
      :class="{ 'ds-tabs__indicator--animated': indicatorReady }"
      :style="indicatorStyle"
      aria-hidden="true"
    />

    <button
      v-for="(tab, i) in tabs"
      :key="tab.value"
      :ref="(el) => { if (el) tabRefs[i] = el as HTMLButtonElement }"
      role="tab"
      type="button"
      :class="['ds-tabs__tab', tab.value === modelValue && 'ds-tabs__tab--active']"
      :aria-selected="tab.value === modelValue"
      :tabindex="tab.value === modelValue ? 0 : -1"
      @click="activate(i)"
      @keydown="onKeydown($event, i)"
    >
      <span class="ds-tabs__label">{{ tab.label }}</span>
      <Badge
        v-if="tab.badge !== undefined"
        :label="String(tab.badge)"
        tone="neutral"
        variant="pill-color"
        :size="badgeSize"
      />
    </button>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
.ds-tabs {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: var(--ds-bg-neutral-subtle);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  gap: var(--ds-spacing-xs);
}

.ds-tabs--md {
  padding: var(--ds-spacing-sm);
  border-radius: var(--ds-radius-surface);
}

.ds-tabs--sm {
  padding: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-surface-sm);
}

/* ── Sliding indicator ─────────────────────────────────────────────── */
.ds-tabs__indicator {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: var(--ds-radius-inner);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-surface);
  pointer-events: none;
  z-index: 0;
  /* No transition until after first paint to prevent mount jump */
}

.ds-tabs__indicator--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    width     var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* ── Tab button (base) ─────────────────────────────────────────────── */
.ds-tabs__tab {
  position: relative;
  z-index: var(--ds-z-raised);
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-md);
  min-width: 1px;
  overflow: hidden;
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-inner);
  color: var(--ds-text-subtlest);
  cursor: pointer;
  outline: none;
  transition: color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-tabs--md .ds-tabs__tab {
  height: 44px;
}

.ds-tabs--sm .ds-tabs__tab {
  height: 36px;
}

/* ── Hover — subtle tint, text promotes, clearly lighter than active ── */
.ds-tabs__tab:not(.ds-tabs__tab--active):hover {
  background-color: color-mix(in srgb, var(--ds-bg-default) 50%, transparent);
  color: var(--ds-text-default);
}

/* ── Active — indicator provides the card; button carries text color ── */
.ds-tabs__tab--active {
  color: var(--ds-text-default);
}

/* ── Focus (inactive) — ring only, no extra bg needed ─────────────── */
.ds-tabs__tab:not(.ds-tabs__tab--active):focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

/* ── Focus (active) — ring layered on top of the indicator shadow ──── */
.ds-tabs__tab--active:focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

/* ── Label ─────────────────────────────────────────────────────────── */
.ds-tabs__label {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg-strong);
  white-space: nowrap;
}

.ds-tabs--md .ds-tabs__label {
  font: var(--ds-font-heading-md);
}

.ds-tabs--sm .ds-tabs__label {
  font: var(--ds-font-heading-sm);
}
</style>
