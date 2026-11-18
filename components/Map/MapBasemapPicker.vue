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
 * The basemap, chosen by its picture (ADR-0221, its panel drawn again in
 * ADR-0222). The trigger **is** the active basemap — a 28px thumbnail in a 2px
 * white frame, `radius-inner`, a `border-subtle` hairline and
 * `elevation-control`, the basemap alone with no project data; open, it takes
 * the brand ring (`border-brand-solid`, 2px) and a light halo.
 *
 * **The panel is the home page's tray** (`Dropdown surface="tray"`, track B4):
 * the grey ground, its hairline and `radius-surface-lg`, titled with `label`
 * (« Fond de carte », `heading-sm`, as « Derniers projets »), under
 * `elevation-overlay` because it floats over the map. On its white surface the
 * basemaps sit in a row, `spacing-sm` apart: a tile each, 7.5rem — the picture
 * in **4:3**, `radius-control`, an inset `border-subtle` hairline, the name
 * under it, centred, `label-md` / `text-strong`; `spacing-xs` in,
 * `radius-surface-sm`. Hover is the tray's (`--on-tray-hover`).
 *
 * **The active basemap keeps the package's mark** (ADR-0050), on the whole
 * tile: `bg-selected`, its picture ringed in `border-brand-solid` at
 * `border-width-strong`, its name `label-md-strong` / `text-on-brand-subtle`.
 * No check.
 *
 * A dialog holding a radio group: Tab reaches the active basemap, the arrows
 * move the choice (and the map with it), Enter, Space or a click chooses and
 * closes, Escape closes and hands the focus back to the trigger.
 *
 * The images are the product's (`src`, or `#thumbnail` for an element of its
 * own); the package draws the frame, the selection and the panel.
 */
interface Props {
  basemaps: MapBasemapOption[]
  /** The active basemap's `value` — `v-model`. */
  modelValue?: string
  /** What the control chooses — the trigger's name (with the active basemap after it) and the tray's title. */
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

/* The radio group's arrows (APG): they move the choice and the focus with it,
   and the panel stays open — only a press closes it. */
const choicesEl = ref<HTMLElement | null>(null)
function step(e: KeyboardEvent) {
  const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!delta || !props.basemaps.length) return
  e.preventDefault()
  const at = props.basemaps.findIndex((b) => b.value === current.value?.value)
  const to = (at + delta + props.basemaps.length) % props.basemaps.length
  emit('update:modelValue', props.basemaps[to].value)
  choicesEl.value?.querySelectorAll<HTMLElement>('[role="radio"]')[to]?.focus()
}
</script>

<template>
  <Dropdown v-if="current" v-model:open="open" align="end" surface="tray" :label="label">
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

    <div ref="choicesEl" class="ds-map-basemap-picker__choices" role="radiogroup" :aria-label="label" @keydown="step">
      <button
        v-for="b in basemaps"
        :key="b.value"
        type="button"
        role="radio"
        class="ds-map-basemap-picker__choice"
        :class="{ 'ds-map-basemap-picker__choice--current': b.value === current.value }"
        :aria-checked="b.value === current.value"
        :tabindex="b.value === current.value ? 0 : -1"
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

/* ── The tray's surface: the basemaps in a row ───────────────────── */
.ds-map-basemap-picker__choices {
  display: flex;
  gap: var(--ds-spacing-sm);
}

.ds-map-basemap-picker__choice {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-xs);
  width: 7.5rem;
  padding: var(--ds-spacing-xs);
  border: 0;
  border-radius: var(--ds-radius-surface-sm);
  background: transparent;
  color: var(--ds-text-strong);
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* The tray's hover (ADR-0199), on keyboard focus as on the pointer. */
.ds-map-basemap-picker__choice:is(:hover, :focus-visible) {
  background: var(--on-tray-hover, var(--ds-bg-hover));
}

.ds-map-basemap-picker__choice:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

.ds-map-basemap-picker__thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--ds-radius-control);
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
  overflow: hidden;
  font: var(--ds-font-label-md);
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* The current basemap (ADR-0050), on the whole tile: its ground, its ink, the
   strong weight — and its picture ringed in the brand. No check. */
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
