<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dropdown } from '../Dropdown'
import { Tooltip } from '../Tooltip'

/** One basemap the map can be drawn on — « TOLBI », « Satellite ». */
export interface MapBasemapOption {
  value: string
  label: string
  /** Its thumbnail: the basemap alone, no project data. Or the `#thumbnail` slot. */
  src?: string
}

/**
 * The basemap, chosen by its picture (ADR-0221). The trigger **is** the active
 * basemap — a 28px thumbnail in a 2px white frame, `radius-inner`, a
 * `border-subtle` hairline and `elevation-control`, the basemap alone with no
 * project data; open, it takes the brand ring (`border-brand-solid`, 2px) and
 * a light halo.
 *
 * The panel, at the trigger's end, lays the basemaps side by side: a 72px
 * thumbnail each, its name under it. The active one is marked as every list in
 * the catalogue marks its current item (ADR-0050) — `bg-selected`, its ink and
 * the strong weight — and its picture ringed in `border-brand-solid` 2px.
 *
 * The images are the product's (`src`, or `#thumbnail` for an element of its
 * own); the package draws the frame, the selection and the panel. A menu of
 * radio items: the arrows walk them, Enter chooses, the panel closes.
 */
interface Props {
  basemaps: MapBasemapOption[]
  /** The active basemap's `value` — `v-model`. */
  modelValue?: string
  /** What the control chooses — its name, with the active basemap after it. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: 'Fond de carte',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

defineSlots<{
  /** A basemap's picture in place of its `src` — on the trigger and in the panel. */
  thumbnail?: (props: { basemap: MapBasemapOption }) => unknown
}>()

const open = ref(false)
const current = computed(() => props.basemaps.find((b) => b.value === props.modelValue) ?? props.basemaps[0])

function choose(value: string) {
  emit('update:modelValue', value)
  open.value = false
}
</script>

<template>
  <Dropdown v-if="current" v-model:open="open" align="end" width="fit-content" :label="label">
    <template #trigger="{ open: isOpen, toggle }">
      <Tooltip :title="label" placement="bottom-end" :disabled="isOpen">
        <button
          type="button"
          class="ds-map-basemap-picker__trigger"
          :class="{ 'ds-map-basemap-picker__trigger--open': isOpen }"
          :aria-label="`${label} : ${current.label}`"
          :aria-expanded="isOpen"
          aria-haspopup="true"
          @click="toggle"
        >
          <span class="ds-map-basemap-picker__picture" aria-hidden="true">
            <slot name="thumbnail" :basemap="current"><img v-if="current.src" :src="current.src" alt="" /></slot>
          </span>
        </button>
      </Tooltip>
    </template>

    <div class="ds-map-basemap-picker__choices">
      <button
        v-for="b in basemaps"
        :key="b.value"
        type="button"
        role="menuitemradio"
        class="ds-map-basemap-picker__choice"
        :class="{ 'ds-map-basemap-picker__choice--current': b.value === current.value }"
        :aria-checked="b.value === current.value"
        @click="choose(b.value)"
      >
        <span class="ds-map-basemap-picker__thumb" aria-hidden="true">
          <slot name="thumbnail" :basemap="b"><img v-if="b.src" :src="b.src" alt="" /></slot>
        </span>
        <span class="ds-map-basemap-picker__name">{{ b.label }}</span>
      </button>
    </div>
  </Dropdown>
</template>

<style scoped>
/* The active basemap, 28px: a 2px white frame round the picture. */
.ds-map-basemap-picker__trigger {
  box-sizing: border-box;
  display: inline-flex;
  width: 28px;
  height: 28px;
  padding: var(--ds-spacing-xxs);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
  cursor: pointer;
  transition:
    border-color var(--ds-motion-duration-instant) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* Open: the brand ring — the border and one more pixel outside it, 2px — and a light halo. */
.ds-map-basemap-picker__trigger--open {
  border-color: var(--ds-border-brand-solid);
  box-shadow:
    0 0 0 var(--ds-border-width-default) var(--ds-border-brand-solid),
    var(--ds-focus-ring-brand),
    var(--ds-elevation-control);
}

.ds-map-basemap-picker__trigger:focus-visible {
  outline: none;
  box-shadow: var(--on-glass-focus, var(--ds-focus-ring-brand-shadow-xs));
}

.ds-map-basemap-picker__picture,
.ds-map-basemap-picker__thumb {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--ds-bg-neutral);
}

.ds-map-basemap-picker__picture {
  width: 100%;
  height: 100%;
  border-radius: var(--ds-radius-inner-sm);
}

.ds-map-basemap-picker__picture :deep(img),
.ds-map-basemap-picker__thumb :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── The panel: the basemaps side by side ─────────────────────────── */
.ds-map-basemap-picker__choices {
  display: flex;
  gap: var(--ds-spacing-xs);
  padding: 0 var(--ds-spacing-xs);
}

.ds-map-basemap-picker__choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-sm);
  padding: var(--ds-spacing-sm);
  border: 0;
  border-radius: var(--ds-radius-control);
  background: transparent;
  color: var(--ds-text-default);
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-basemap-picker__choice:is(:hover, :focus-visible) {
  background: var(--ds-bg-hover);
}

.ds-map-basemap-picker__choice:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

.ds-map-basemap-picker__thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--ds-radius-inner);
}

/* The hairline over the picture — an inset shadow on the frame is painted
   under the image (ADR-0201). */
.ds-map-basemap-picker__thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-subtle);
  pointer-events: none;
}

.ds-map-basemap-picker__name {
  font: var(--ds-font-label-md);
}

/* The current basemap (ADR-0050): its ground, its ink, the strong weight — and
   its picture ringed in the brand. */
.ds-map-basemap-picker__choice--current {
  background: var(--ds-bg-selected);
}

.ds-map-basemap-picker__choice--current:is(:hover, :focus-visible) {
  background: var(--ds-bg-selected-hover);
}

.ds-map-basemap-picker__choice--current .ds-map-basemap-picker__thumb {
  box-shadow: 0 0 0 var(--ds-border-width-strong) var(--ds-border-brand-solid);
}

.ds-map-basemap-picker__choice--current .ds-map-basemap-picker__name {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-on-brand-subtle);
}
</style>
