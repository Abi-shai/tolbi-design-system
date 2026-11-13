<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Button } from '../Button'
import { Icon, type IconName } from '../Icon'
import { Spinner } from '../Spinner'
import { SurfaceTransition } from '../SurfaceTransition'

export type MapStatusState = 'loading' | 'partial' | 'empty' | 'failed'

/**
 * What a map is missing, said on the map (ADR-0122) — a pill, at the bottom
 * of the map above the timeline (`MapOverlay position="bottom"`, after the
 * timeline: the overlay stacks toward the centre). Never in the map's place:
 * the map stays there and stays usable.
 *
 * One `state`, and the component draws it — **the state picks the glyph and
 * the ink** (ADR-0006), the product writes the words:
 *
 * - `loading` — the data layers are arriving: a spinner and, with `loaded` /
 *   `total`, the count (« 33 sur 89 »), the one thing NN/g asks of a series;
 * - `partial` — some features have no data, in the warning ink;
 * - `empty` — nothing to show yet (a project being computed);
 * - `failed` — the data could not be read, in the error ink, with its action.
 *
 * A basemap that falls back to satellite is **not** a state: the map stays
 * readable and the reader has nothing to do with the news (ADR-0124).
 *
 * `null` is nothing: the pill leaves as a surface does (`SurfaceTransition`)
 * and takes no room in the overlay. A change of state is the pill leaving and
 * the next arriving, at the same place.
 *
 * Said to a reader once per message, not per count: a live region that read
 * « 34 sur 89 », « 35 sur 89 »… would talk over everything. The count is on
 * screen only; the words are announced — politely, or at once for `failed`.
 */
interface Props {
  state?: MapStatusState | null
  /** The words. Each state has a default; `partial` wants the product's count. */
  label?: string
  loaded?: number
  total?: number
  /** Between the two numbers. */
  of?: string
  /** An action on the pill's line — « Réessayer », « Voir lesquelles ». Emits `action`. */
  actionLabel?: string
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  state: null,
  label: undefined,
  loaded: undefined,
  total: undefined,
  of: 'sur',
  actionLabel: undefined,
  locale: 'fr-FR',
})

const emit = defineEmits<{ action: [] }>()

const DEFAULTS: Record<MapStatusState, string> = {
  loading: 'Chargement des données',
  partial: 'Certaines données manquent',
  empty: 'Pas encore de mesure',
  failed: 'Les données n’ont pas pu être lues',
}

const GLYPH: Record<Exclude<MapStatusState, 'loading'>, IconName> = {
  partial: 'image-off',
  empty: 'clock',
  failed: 'circle-alert',
}

const TONE: Record<MapStatusState, 'neutral' | 'warning' | 'error'> = {
  loading: 'neutral',
  partial: 'warning',
  empty: 'neutral',
  failed: 'error',
}

const words = computed(() => (props.state ? props.label ?? DEFAULTS[props.state] : ''))
const count = computed(() => {
  if (props.state !== 'loading' || props.loaded == null || props.total == null) return null
  const n = new Intl.NumberFormat(props.locale)
  return `${n.format(props.loaded)} ${props.of} ${n.format(props.total)}`
})

/* The live regions are always there and filled 100ms after a message changes:
   one that arrives already filled is skipped by some readers (ADR-0058). */
const polite = ref('')
const assertive = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  [() => props.state, words],
  ([state, w]) => {
    clearTimeout(timer)
    polite.value = ''
    assertive.value = ''
    if (!state) return
    timer = setTimeout(() => {
      if (state === 'failed') assertive.value = w
      else polite.value = w
    }, 100)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span class="ds-map-status-host">
    <span class="ds-map-status__said" role="status">{{ polite }}</span>
    <span class="ds-map-status__said" role="alert">{{ assertive }}</span>
    <SurfaceTransition mode="out-in">
      <div
        v-if="state"
        :key="state"
        class="ds-map-status"
        :class="`ds-map-status--${TONE[state]}`"
        :aria-busy="state === 'loading' || undefined"
      >
        <Spinner v-if="state === 'loading'" class="ds-map-status__glyph" :size="16" :thickness="2" />
        <Icon v-else class="ds-map-status__glyph" :name="GLYPH[state]" :size="16" />
        <span class="ds-map-status__label" aria-hidden="true">{{ words }}</span>
        <span v-if="count" class="ds-map-status__count" aria-hidden="true">{{ count }}</span>
        <Button
          v-if="actionLabel"
          class="ds-map-status__action"
          variant="link"
          size="xs"
          :label="actionLabel"
          @click="emit('action')"
        />
      </div>
    </SurfaceTransition>
  </span>
</template>

<style scoped>
.ds-map-status-host {
  display: contents;
}

/*
  The map's other surfaces, as a pill: `bg-default`, `border-subtle`,
  `elevation-raised`. One line; the words never wrap (a pill that grows would
  push the timeline's axis), and are cut past the map's own width.
*/
.ds-map-status {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  max-width: 100%;
  min-height: 34px;
  padding: var(--ds-spacing-xs) var(--ds-spacing-lg) var(--ds-spacing-xs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-pill);
  /* Pilot glass (ADR-0172): the map shows through as colour. */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-control);
  -webkit-backdrop-filter: var(--ds-backdrop-map-control);
  backdrop-filter: var(--ds-backdrop-map-control);
  /* On the darkest imagery behind it, text-subtlest fails (3.0–4.3:1); subtle holds (4.6). */
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-control-radius: var(--ds-radius-pill);
  --on-glass-rule: color-mix(in srgb, var(--ds-text-strong) 8%, transparent);
  /* A rim of light on top, a wide soft shadow (ADR-0173). */
  box-shadow: var(--ds-elevation-map-glass);
  transform-origin: bottom center;
  pointer-events: auto;
}

.ds-map-status__glyph {
  flex: none;
  color: var(--ds-text-subtle);
}

.ds-map-status__label {
  min-width: 0;
  overflow: hidden;
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-map-status__count {
  flex: none;
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

.ds-map-status__action {
  flex: none;
}

/* The tone is the glyph and the words together, in the on-tint ink: on
   `bg-default` it is the legible one in light and the same value in dark
   (ADR-0092). */
.ds-map-status--warning .ds-map-status__glyph,
.ds-map-status--warning .ds-map-status__label {
  color: var(--ds-text-on-warning-subtle);
}

.ds-map-status--error .ds-map-status__glyph,
.ds-map-status--error .ds-map-status__label {
  color: var(--ds-text-on-error-subtle);
}

.ds-map-status__said {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Less transparency asked for: the same surface, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-status {
    border-color: var(--ds-border-subtle);
    background: var(--ds-bg-default);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    --on-glass-raised: var(--ds-bg-default);
    --on-glass-sunk: var(--ds-bg-neutral-subtle);
  }
}
</style>
