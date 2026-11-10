<script setup lang="ts">
import { computed } from 'vue'
import zoneDone from './art/zone-done.png'
import zoneRunning from './art/zone-running.png'
import zoneFailed from './art/zone-failed.png'
import parcelMonitored from './art/parcel-monitored.png'
import parcelAlert from './art/parcel-alert.png'
import parcelQuality from './art/parcel-quality.png'
import parcelForest from './art/parcel-forest.png'
import parcelInvalid from './art/parcel-invalid.png'
import baselineUpToDate from './art/baseline-up-to-date.png'
import baselineOutdated from './art/baseline-outdated.png'
import baselineComputing from './art/baseline-computing.png'

/**
 * The picture of a project — **an illustration from a range, not a snapshot of
 * the project** (ADR-0107). The owner's range « Glyphe » (Figma `3041:8757`):
 * a geographic object — a zone, a parcel, a baseline — drawn in its status. A
 * list of projects **cycles** through the range, so neighbouring cards do not
 * wear the same drawing; the choice is stable per project (`seed`), never
 * random per render.
 *
 * Each drawing gives eight variants — four quarter turns, mirrored or not — so
 * one drawing per status already spreads across a list. More drawings in the
 * range simply widen the cycle.
 *
 * Decorative: the title beside it names the project. It goes in
 * `ProjectCard`'s `#zone` slot (ADR-0106), 40px, no ground.
 */
export type ProjectGlyphKind = 'zone' | 'parcel' | 'baseline'
export type ProjectGlyphStatus =
  | 'done' | 'running' | 'failed'            // zone
  | 'monitored' | 'alert' | 'quality'        // parcel — dMRV
  | 'forest' | 'invalid'                     // parcel — ARR (ADR-0140)
  | 'up-to-date' | 'outdated' | 'computing'  // baseline

const ART: Record<ProjectGlyphKind, Partial<Record<ProjectGlyphStatus, string>>> = {
  zone:     { done: zoneDone, running: zoneRunning, failed: zoneFailed },
  parcel:   { monitored: parcelMonitored, alert: parcelAlert, quality: parcelQuality, forest: parcelForest, invalid: parcelInvalid },
  baseline: { 'up-to-date': baselineUpToDate, outdated: baselineOutdated, computing: baselineComputing },
}
/* What a kind falls back to when it is given a status it does not draw. */
const FIRST: Record<ProjectGlyphKind, ProjectGlyphStatus> = { zone: 'done', parcel: 'monitored', baseline: 'up-to-date' }

/* Four quarter turns, then the same four mirrored: the cycle a drawing gives. */
const VARIANTS = 8

interface Props {
  /** The geographic object the project is about. */
  kind: ProjectGlyphKind
  /** Its status — `done | running | failed` for a zone, `monitored | alert | quality | forest | invalid` for a parcel, `up-to-date | outdated | computing` for a baseline. */
  status?: ProjectGlyphStatus
  /** What keeps the drawing stable for a project — its id. Two projects with two seeds rarely share a variant. */
  seed?: string | number
  /** A variant picked by hand (0–7), in place of `seed` — a list's own index, when it wants a strict cycle. */
  variant?: number
  /** The box, in px. 40 in `ProjectCard`; the range is drawn at 32 and 40. */
  size?: number
  /**
   * How many objects the drawing stands for — a reason that set aside several
   * parcels (ADR-0148, the owner's « Zone/Pile de parcelles »). Given, the
   * drawing is **stacked**: one for 1, two for 2, three past that, those behind
   * paler (0.6, 0.35) and stepped up and to the right, in a box 30 % larger so
   * a list of piles keeps one geometry; 1 and 2 are centred in it. Absent, the
   * single drawing in its own box, as before.
   */
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined,
  seed: undefined,
  variant: undefined,
  size: 40,
  count: undefined,
})

/* FNV-1a: small, stable across sessions, spreads short ids well. */
function hash(value: string | number): number {
  let h = 0x811c9dc5
  for (const ch of String(value)) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

const src = computed(() => {
  const kind = ART[props.kind]
  return (props.status && kind[props.status]) || kind[FIRST[props.kind]]!
})

const index = computed(() => {
  if (props.variant !== undefined) return ((props.variant % VARIANTS) + VARIANTS) % VARIANTS
  if (props.seed !== undefined) return hash(props.seed) % VARIANTS
  return 0
})

/*
  The pile, back to front: the step is 15 % of the drawing (6px at 40), the box
  the drawing plus two steps (52). Offsets in steps from the box's top left,
  as drawn: one centred; two centred on the diagonal; three from corner to
  corner.
*/
const LAYERS: Record<1 | 2 | 3, { x: number; y: number; opacity: number }[]> = {
  1: [{ x: 1, y: 1, opacity: 1 }],
  2: [{ x: 1.5, y: 0.5, opacity: 0.6 }, { x: 0.5, y: 1.5, opacity: 1 }],
  3: [{ x: 2, y: 0, opacity: 0.35 }, { x: 1, y: 1, opacity: 0.6 }, { x: 0, y: 2, opacity: 1 }],
}
const step = computed(() => props.size * 0.15)
const layers = computed(() => {
  if (props.count === undefined) return []
  const n = Math.min(Math.max(Math.round(props.count), 1), 3) as 1 | 2 | 3
  return LAYERS[n]
})

const transform = computed(() => {
  const turn = (index.value % 4) * 90
  const mirror = index.value >= 4 ? ' scaleX(-1)' : ''
  return turn || mirror ? `rotate(${turn}deg)${mirror}` : undefined
})
</script>

<template>
  <span
    v-if="count !== undefined"
    class="ds-project-glyph-stack"
    aria-hidden="true"
    :style="{ width: `${size + 2 * step}px`, height: `${size + 2 * step}px` }"
  >
    <img
      v-for="(layer, i) in layers"
      :key="i"
      class="ds-project-glyph ds-project-glyph-stack__layer"
      :src="src"
      alt=""
      :width="size"
      :height="size"
      :style="{ left: `${layer.x * step}px`, top: `${layer.y * step}px`, opacity: layer.opacity === 1 ? undefined : layer.opacity, transform }"
    />
  </span>
  <img
    v-else
    class="ds-project-glyph"
    :src="src"
    alt=""
    aria-hidden="true"
    :width="size"
    :height="size"
    :style="{ transform }"
  />
</template>

<style scoped>
.ds-project-glyph {
  display: block;
  flex: none;
  object-fit: contain;
}

.ds-project-glyph-stack {
  position: relative;
  display: block;
  flex: none;
}

.ds-project-glyph-stack__layer {
  position: absolute;
}
</style>
