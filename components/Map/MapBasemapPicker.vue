<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dropdown, type DropdownSide } from '../Dropdown'
import { Tooltip, type TooltipPlacement } from '../Tooltip'

/** One basemap the map can be drawn on — « TOLBI », « Satellite ». */
export interface MapBasemapOption {
  value: string
  label: string
  /** Its thumbnail: the basemap alone, no project data. Or the `#thumbnail` slot. */
  src?: string
}

/**
 * The basemap, chosen by its picture (ADR-0221, its panel drawn again in
 * ADR-0222 and ADR-0229). The trigger **is** the active basemap — a 36px thumbnail (ADR-0242; 28 before) in a 3px
 * white frame, `radius-inner`, a `border-subtle` hairline and
 * `elevation-control`, the basemap alone with no project data; open, it takes
 * the brand ring (`border-brand-solid`, 2px) and a light halo.
 *
 * **The panel is the home page's tray** (`Dropdown surface="tray"`, track B4):
 * the grey ground, its hairline and `radius-surface-lg`, titled with `label`
 * (« Fond de carte », `heading-sm`, as « Derniers projets »), under
 * `elevation-overlay` because it floats over the map. On its white surface the
 * basemaps are **a list** (ADR-0229, Felt): a row each, `spacing-xxs` apart —
 * a 3.5rem square picture (`radius-surface`, an inset `border-subtle`
 * hairline, `cover`), then the name in `label-lg`; `spacing-sm` in,
 * `radius-surface`. Hover takes `bg-neutral-subtle`, the keyboard the
 * package's ring.
 *
 * **The active basemap is seen by its row** (ADR-0230): the row on
 * `bg-brand-subtle` (`-hover` under the pointer), the name `label-lg-strong` /
 * `text-on-brand-subtle`, the picture as at rest. No check, no description.
 *
 * A dialog holding a radio group: Tab reaches the active basemap, the arrows
 * move the choice (and the map with it), Enter, Space or a click chooses and
 * closes, Escape closes and hands the focus back to the trigger.
 *
 * The images are the product's (`src`, or `#thumbnail` for an element of its
 * own); the package draws the frame, the selection and the panel.
 *
 * **`shape="round"`** (ADR-0241) is the trigger at the foot of `MapNavigator`'s
 * column, among its round buttons: 36px, the picture in a circle inside a 3px
 * white margin — a square there was the « disunion » the owner pointed at. With
 * `side="left"` the tray opens to the column's left, as the tools' cards do.
 */
interface Props {
  basemaps: MapBasemapOption[]
  /** The active basemap's `value` — `v-model`. */
  modelValue?: string
  /** What the control chooses — the trigger's name (with the active basemap after it) and the tray's title. */
  label?: string
  /** `square` (the bar's, 36px) or `round` (the tools column's, 36px — ADR-0241). */
  shape?: 'square' | 'round'
  /** Where the tray opens: `below` the trigger, or `left` of the tools column. */
  side?: DropdownSide
  /** The trigger's tooltip side. */
  tooltipPlacement?: TooltipPlacement
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: 'Fond de carte',
  shape: 'square',
  side: 'below',
  tooltipPlacement: 'bottom-end',
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
  <Dropdown v-if="current" v-model:open="open" align="end" :side="side" surface="tray" :label="label">
    <template #trigger="{ open: isOpen, toggle }">
      <Tooltip :title="label" :placement="tooltipPlacement" :disabled="isOpen">
        <button
          type="button"
          class="ds-map-basemap-picker__trigger"
          :class="{ 'ds-map-basemap-picker__trigger--open': isOpen, 'ds-map-basemap-picker__trigger--round': shape === 'round' }"
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
/* The active basemap, 36px (ADR-0242 — it was 28, small beside the bar's 36px
   buttons and its 40px avatar): a 3px white frame round the picture, a rounded
   square (`radius-inner`) so it never reads as a second avatar. */
.ds-map-basemap-picker__trigger {
  box-sizing: border-box;
  display: inline-flex;
  width: 36px;
  height: 36px;
  padding: 3px;
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

/* Round (ADR-0241): among the tools column's round buttons — 36px, the picture
   in a circle inside a 3px white margin. */
.ds-map-basemap-picker__trigger--round {
  width: 36px;
  height: 36px;
  padding: 3px;
  border-radius: var(--ds-radius-pill);
}

.ds-map-basemap-picker__trigger--round .ds-map-basemap-picker__picture {
  border-radius: var(--ds-radius-pill);
}

.ds-map-basemap-picker__picture :deep(img),
.ds-map-basemap-picker__thumb :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── The tray's surface: the basemaps in a list (ADR-0229, Felt) ──── */
.ds-map-basemap-picker__choices {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
}

/* A row: the picture, then the name, read as the basemap itself. */
.ds-map-basemap-picker__choice {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  width: 100%;
  padding: var(--ds-spacing-sm);
  border: 0;
  border-radius: var(--ds-radius-surface);
  background: transparent;
  color: var(--ds-text-strong);
  text-align: start;
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-basemap-picker__choice:hover {
  background: var(--ds-bg-neutral-subtle);
}

.ds-map-basemap-picker__choice:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

.ds-map-basemap-picker__thumb {
  flex: none;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--ds-radius-surface);
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
  min-width: 0;
  overflow: hidden;
  font: var(--ds-font-label-lg);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* The current basemap (ADR-0230): its row on the brand's tint, the name in
   that tint's exact ink at the strong weight; the picture as at rest. Not the
   solid brand — it would read as the project's action beside it in the bar. */
.ds-map-basemap-picker__choice--current {
  background: var(--ds-bg-brand-subtle);
}

.ds-map-basemap-picker__choice--current:hover {
  background: var(--ds-bg-brand-subtle-hover);
}

.ds-map-basemap-picker__choice--current .ds-map-basemap-picker__name {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-on-brand-subtle);
}
</style>
