<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Props {
  /** Width of the first pane, as a percentage of the container. */
  modelValue?: number
  min?: number
  max?: number
  /** Percentage points moved per arrow key press. */
  step?: number
  vertical?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 50,
  min: 20,
  max: 80,
  step: 2,
  vertical: false,
  ariaLabel: 'Redimensionner les panneaux',
})

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const root = ref<HTMLElement | null>(null)
const dragging = ref(false)

const clamp = (v: number) => Math.min(props.max, Math.max(props.min, v))
const ratio = computed(() => clamp(props.modelValue))

function fromPointer(event: PointerEvent) {
  const el = root.value
  if (!el) return
  const box = el.getBoundingClientRect()
  const span = props.vertical ? box.height : box.width
  if (span <= 0) return
  const offset = props.vertical ? event.clientY - box.top : event.clientX - box.left
  emit('update:modelValue', clamp((offset / span) * 100))
}

function onDown(event: PointerEvent) {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  event.preventDefault()
}

function onMove(event: PointerEvent) {
  if (dragging.value) fromPointer(event)
}

function onUp() {
  dragging.value = false
}

/*
 * A separator that only responds to a pointer is unusable by keyboard. Arrow
 * keys move it, Home/End jump to the bounds — the same contract a native
 * slider offers.
 */
function onKey(event: KeyboardEvent) {
  const back = props.vertical ? 'ArrowUp' : 'ArrowLeft'
  const fwd = props.vertical ? 'ArrowDown' : 'ArrowRight'

  let next: number | undefined
  if (event.key === back) next = ratio.value - props.step
  else if (event.key === fwd) next = ratio.value + props.step
  else if (event.key === 'Home') next = props.min
  else if (event.key === 'End') next = props.max

  if (next !== undefined) {
    event.preventDefault()
    emit('update:modelValue', clamp(next))
  }
}

onBeforeUnmount(() => { dragging.value = false })
</script>

<template>
  <div
    ref="root"
    class="ds-split"
    :class="[
      vertical ? 'ds-split--vertical' : 'ds-split--horizontal',
      { 'ds-split--dragging': dragging },
    ]"
  >
    <div class="ds-split__pane" :style="{ flexBasis: `${ratio}%` }">
      <slot name="start" />
    </div>

    <div
      class="ds-split__handle"
      role="separator"
      tabindex="0"
      :aria-label="ariaLabel"
      :aria-orientation="vertical ? 'horizontal' : 'vertical'"
      :aria-valuenow="Math.round(ratio)"
      :aria-valuemin="min"
      :aria-valuemax="max"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
    >
      <span class="ds-split__grip" aria-hidden="true" />
    </div>

    <div class="ds-split__pane ds-split__pane--rest">
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped>
.ds-split {
  display: flex;
  min-width: 0;
  min-height: 0;
  width: 100%;
}

.ds-split--vertical { flex-direction: column; }

.ds-split__pane {
  /* min-* 0 so a pane can shrink below its content instead of pushing the split. */
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  flex-grow: 0;
  flex-shrink: 1;
}

.ds-split__pane--rest { flex: 1 1 auto; }

/* While dragging, stop the pointer selecting text across both panes. */
.ds-split--dragging { user-select: none; }

.ds-split__handle {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 0;
  padding: 0;
  touch-action: none;
}

.ds-split--horizontal .ds-split__handle { width: 11px; cursor: col-resize; }
.ds-split--vertical   .ds-split__handle { height: 11px; cursor: row-resize; }

.ds-split__grip {
  background-color: var(--ds-border-subtle);
  border-radius: var(--ds-radius-pill);
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-split--horizontal .ds-split__grip { width: 3px; height: 28px; }
.ds-split--vertical   .ds-split__grip { width: 28px; height: 3px; }

.ds-split__handle:hover .ds-split__grip,
.ds-split--dragging .ds-split__grip { background-color: var(--ds-border-brand-solid); }

.ds-split__handle:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
  border-radius: var(--ds-radius-inner);
}
</style>
