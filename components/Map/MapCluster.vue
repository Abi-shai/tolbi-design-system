<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { MAP_GLYPH_SEVERITY_COLOR, mapGlyphSvg, type MapGlyphFamily, type MapGlyphSeverity } from './mapGlyph'

/**
 * A cluster of points on a map (ADR-0190): the glyph of its family at the
 * cluster's mean colour, and the count in a badge — the same ink for both
 * families. It grows by steps with the count (< 10 / < 30 / beyond): a
 * project's 44 / 56 / 68px, a control's 36 / 44 / 52 — the project leads, the
 * controls are its reference.
 *
 * It is a **button**: pressing it zooms until the cluster opens (`click`; the
 * engine knows the zoom — Mapbox's `getClusterExpansionZoom`). Named by its
 * count and family, a visible focus, a 1.08 lift under the pointer.
 *
 * **Its alerts** (ADR-0194): a second badge, bottom left, counts the points
 * in alert and takes the hue of the gravest (`alertSeverity` — blocking >
 * watch > review); absent without one. From afar, it says where to look. Its
 * figure is in ink: on all three hues white measures under 4.5:1 (3.76, 2.35,
 * 2.58) and ink over it (4.72, 7.56, 6.89). The name says it too: « 18
 * parcelles, dont 3 en alerte ».
 *
 * The engine places it (a Mapbox `Marker` element: `render(h(MapCluster, …),
 * el)`). Its bursts and gatherings are `clusterArrive` / `clusterLeave`, and
 * the points that fly out of it `flyGlyphs` — `mapMotion.ts`.
 */
interface Props {
  family: MapGlyphFamily
  /** The cluster's mean colour on the map's ramp — any CSS colour, a token included. */
  color: string
  count: number
  /** Its name; by default « N points du projet », « N points de contrôle » or « N parcelles », and « , dont N en alerte ». */
  label?: string
  /** Another point is chosen: the cluster steps back, as the other points do. */
  muted?: boolean
  /** How many of its points are in alert: a second badge, bottom left. 0 or absent: none. */
  alerts?: number
  /** The gravest of those alerts — the badge's hue. */
  alertSeverity?: MapGlyphSeverity
}

const props = withDefaults(defineProps<Props>(), { label: undefined, muted: false, alerts: 0, alertSeverity: 'review' })

defineEmits<{ click: [event: MouseEvent] }>()

const STEPS: Record<MapGlyphFamily, [number, number, number]> = {
  project: [44, 56, 68],
  monitored: [44, 56, 68],
  control: [36, 44, 52],
}
const size = computed(() => {
  const [a, b, c] = STEPS[props.family]
  return props.count < 10 ? a : props.count < 30 ? b : c
})

const name = computed(() => {
  if (props.label) return props.label
  const plural = props.count > 1 ? 's' : ''
  const what =
    props.family === 'project' ? `${props.count} point${plural} du projet`
    : props.family === 'monitored' ? `${props.count} parcelle${plural}`
    : `${props.count} point${plural} de contrôle`
  return props.alerts > 0 ? `${what}, dont ${props.alerts} en alerte` : what
})

/* The glyph is drawn where its colours resolve — in the document, once mounted. */
const root = ref<HTMLElement | null>(null)
const svg = ref('')
const draw = () => {
  if (root.value) svg.value = mapGlyphSvg({ family: props.family, color: props.color, size: size.value }, root.value)
}
onMounted(draw)
watch(() => [props.family, props.color, size.value], draw)
</script>

<template>
  <button
    ref="root"
    type="button"
    class="ds-map-cluster"
    :class="[`ds-map-cluster--${family}`, { 'ds-map-cluster--muted': muted }]"
    :style="{ '--map-cluster-size': `${size}px` }"
    :aria-label="name"
    @click="$emit('click', $event)"
  >
    <span class="ds-map-cluster__inner">
      <!-- eslint-disable-next-line vue/no-v-html -- the package's own drawing (mapGlyph.ts) -->
      <span class="ds-map-cluster__glyph" aria-hidden="true" v-html="svg" />
      <span class="ds-map-cluster__count" aria-hidden="true">{{ count }}</span>
      <span
        v-if="alerts > 0"
        class="ds-map-cluster__alerts"
        :style="{ background: MAP_GLYPH_SEVERITY_COLOR[alertSeverity] }"
        aria-hidden="true"
      >{{ alerts }}</span>
    </span>
  </button>
</template>

<style scoped>
.ds-map-cluster {
  /* The map's inks, not the theme's: the imagery under them has no dark mode (ADR-0169). */
  /* token-lint-disable-next-line no-raw-primitive — on the map's imagery, which has no dark mode (ADR-0190) */
  --map-cluster-ink: var(--ds-color-gray-light-900);
  /* token-lint-disable-next-line no-raw-primitive — on the map's imagery, which has no dark mode (ADR-0190) */
  --map-cluster-white: var(--ds-color-base-white);
  position: relative;
  display: block;
  width: var(--map-cluster-size);
  height: var(--map-cluster-size);
  padding: 0;
  border: 0;
  border-radius: var(--ds-radius-pill);
  background: none;
  cursor: pointer;
  transition:
    opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    transform var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* The control's square: the ring follows its corners (7 of 32). */
.ds-map-cluster--control {
  border-radius: var(--ds-radius-control);
}

.ds-map-cluster:hover {
  transform: scale(1.08);
}

.ds-map-cluster:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-map);
}

.ds-map-cluster--muted {
  opacity: 0.35;
}

.ds-map-cluster__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

.ds-map-cluster__glyph {
  display: block;
  line-height: 0;
  filter: drop-shadow(0 4px 6px color-mix(in srgb, var(--map-cluster-ink) 20%, transparent));
}

.ds-map-cluster__glyph > :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* The count: one ink for both families, ringed in white so it stands off the glyph. */
.ds-map-cluster__count {
  position: absolute;
  top: calc(-1 * var(--ds-spacing-sm));
  right: calc(-1 * (var(--ds-spacing-md) + var(--ds-spacing-xxs)));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 1.625rem;
  height: 1.625rem;
  padding: 0 var(--ds-spacing-sm);
  border-radius: var(--ds-radius-pill);
  background: var(--map-cluster-ink);
  box-shadow: 0 0 0 var(--ds-border-width-strong) var(--map-cluster-white);
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  color: var(--map-cluster-white);
}

/* The alerts: the count's badge mirrored to the bottom left, a step smaller, on
   the gravest severity's hue (ADR-0194). Its figure in ink — measured, white
   fails on all three hues. */
.ds-map-cluster__alerts {
  position: absolute;
  bottom: calc(-1 * var(--ds-spacing-sm));
  left: calc(-1 * (var(--ds-spacing-md) + var(--ds-spacing-xxs)));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 var(--ds-spacing-xs);
  border-radius: var(--ds-radius-pill);
  box-shadow: 0 0 0 var(--ds-border-width-strong) var(--map-cluster-white);
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  color: var(--map-cluster-ink);
}

@media (prefers-reduced-motion: reduce) {
  .ds-map-cluster {
    transition: none;
  }
}
</style>
