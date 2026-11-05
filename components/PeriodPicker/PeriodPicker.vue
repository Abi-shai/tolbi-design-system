<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ButtonGroup, ButtonGroupItem } from '../ButtonGroup'
import { InputDropdown } from '../Dropdown'
import { IconButton } from '../IconButton'

export interface PeriodPickerOption {
  value: string
  label: string
}

/**
 * Which period the screen shows — the years of a baseline, the months of a
 * campaign (ADR-0100, track A of the ARR board). **The periods side by side**:
 * on a map there are few of them and each is one press away, where a slider
 * makes a reader aim and a list hides the run of years.
 *
 * It is a row of three parts, and only the middle one is always there:
 *
 * - at its start, **the granularity** (`granularities` + `v-model:granularity`)
 *   — année, mois, jour — when the screen offers more than one. The product
 *   answers it with other `periods`;
 * - in the middle, **the periods**: `ButtonGroup` `sm` (ADR-0084's raised pill,
 *   sliding, ADR-0024), between ‹ and › which step to the previous and next
 *   period. `shown` periods at a time; the window follows the choice, so it
 *   only moves when the choice reaches its edge;
 * - at its end, **`#actions`** — « Comparer » two dates. The product's: the
 *   picker does not know what comparing means.
 *
 * One tab stop for the periods: the arrows move the choice (←/→, Home, End),
 * as they do in a radio group. It draws no surface — on a map it sits in a
 * `MapPanel`.
 */
interface Props {
  periods: PeriodPickerOption[]
  /** How many periods are side by side. */
  shown?: number
  /** What the periods are — the group's name (« Année »). */
  label?: string
  granularities?: PeriodPickerOption[]
  granularityLabel?: string
  previousLabel?: string
  nextLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  shown: 7,
  label: 'Période',
  granularities: () => [],
  granularityLabel: 'Granularité',
  previousLabel: 'Période précédente',
  nextLabel: 'Période suivante',
})

const value = defineModel<string>({ required: true })
const granularity = defineModel<string>('granularity')

defineSlots<{
  /** At the row's end — « Comparer ». */
  actions?: () => unknown
}>()

const index = computed(() => props.periods.findIndex((p) => p.value === value.value))
const last = computed(() => Math.max(0, props.periods.length - props.shown))
const clamp = (n: number) => Math.min(Math.max(n, 0), last.value)

/* The choice opens at the window's right edge: the latest periods are the ones
   read, and the ones before are one › away. */
const start = ref(clamp(index.value - props.shown + 1))
watch(() => props.periods, () => { start.value = clamp(index.value - props.shown + 1) })
watch(index, (i) => {
  if (i < 0) return
  if (i < start.value) start.value = i
  else if (i >= start.value + props.shown) start.value = clamp(i - props.shown + 1)
})

const visible = computed(() => props.periods.slice(start.value, start.value + props.shown))

const group = ref<HTMLElement | null>(null)

function go(i: number, focus = false) {
  const p = props.periods[Math.min(Math.max(i, 0), props.periods.length - 1)]
  if (!p || p.value === value.value) return
  value.value = p.value
  if (focus) nextTick(() => group.value?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus())
}

function onKeydown(event: KeyboardEvent) {
  const to = { ArrowLeft: index.value - 1, ArrowRight: index.value + 1, Home: 0, End: props.periods.length - 1 }[event.key]
  if (to === undefined) return
  event.preventDefault()
  go(to, true)
}
</script>

<template>
  <div class="ds-period-picker">
    <InputDropdown
      v-if="granularities.length > 1"
      v-model="granularity"
      class="ds-period-picker__granularity"
      size="sm"
      :options="granularities"
      :ariaLabel="granularityLabel"
    />
    <div class="ds-period-picker__periods">
      <IconButton
        icon="chevron-left"
        size="xs"
        variant="subtle"
        :ariaLabel="previousLabel"
        :disabled="index <= 0"
        @click="go(index - 1)"
      />
      <div ref="group" class="ds-period-picker__group" @keydown="onKeydown">
        <ButtonGroup v-model="value" size="sm" :ariaLabel="label">
          <ButtonGroupItem
            v-for="p in visible"
            :key="p.value"
            :value="p.value"
            :label="p.label"
            :tabindex="p.value === value ? 0 : -1"
          />
        </ButtonGroup>
      </div>
      <IconButton
        icon="chevron-right"
        size="xs"
        variant="subtle"
        :ariaLabel="nextLabel"
        :disabled="index >= periods.length - 1"
        @click="go(index + 1)"
      />
    </div>
    <div v-if="$slots.actions" class="ds-period-picker__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
/* The three parts are three statements, so `spacing-lg` between them; inside
   the stepper, the arrows bind to the periods they step (`spacing-xs`). */
.ds-period-picker {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  min-width: 0;
}

.ds-period-picker__periods {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

.ds-period-picker__group {
  display: flex;
}

.ds-period-picker__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  margin-inline-start: auto;
}
</style>
