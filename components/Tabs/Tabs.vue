<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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
const containerRef = ref<HTMLDivElement>()
const tabRefs = ref<HTMLButtonElement[]>([])
const indicatorStyle = ref({ transform: 'translateX(0px)', width: '0px', top: '0px', height: '0px' })
const indicatorReady = ref(false)

function updateIndicator(index: number) {
  const btn = tabRefs.value[index]
  if (!btn) return
  indicatorStyle.value = {
    transform: `translateX(${btn.offsetLeft}px)`,
    width:     `${btn.offsetWidth}px`,
    top:       `${btn.offsetTop}px`,
    height:    `${btn.offsetHeight}px`,
  }
}

let ro: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  updateIndicator(activeIndex.value)
  // Enable transition only after the first paint so there's no jump on mount
  requestAnimationFrame(() => { indicatorReady.value = true })

  ro = new ResizeObserver(() => updateIndicator(activeIndex.value))
  if (containerRef.value) ro.observe(containerRef.value)
})

onUnmounted(() => ro?.disconnect())

watch(activeIndex, (idx) => { if (idx !== -1) updateIndicator(idx) })

watch(() => props.tabs, async () => {
  await nextTick()
  updateIndicator(activeIndex.value)
}, { deep: true })

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
        color="gray"
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
  border: 1px solid var(--ds-border-subtle);
  gap: 4px;
}

.ds-tabs--md {
  padding: 6px;
  border-radius: var(--ds-radius-surface);
}

.ds-tabs--sm {
  padding: 4px;
  border-radius: var(--ds-radius-lg);
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
  z-index: 1;
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 1px;
  overflow: hidden;
  padding: 8px 12px;
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
  font-weight: 600;
  white-space: nowrap;
}

.ds-tabs--md .ds-tabs__label {
  font-size: var(--ds-font-size-heading-md);
  line-height: var(--ds-line-height-heading-md);
}

.ds-tabs--sm .ds-tabs__label {
  font-size: var(--ds-font-size-heading-sm);
  line-height: var(--ds-line-height-heading-sm);
}
</style>
