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
}

const props = withDefaults(defineProps<Props>(), {
  status: undefined,
  seed: undefined,
  variant: undefined,
  size: 40,
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

const transform = computed(() => {
  const turn = (index.value % 4) * 90
  const mirror = index.value >= 4 ? ' scaleX(-1)' : ''
  return turn || mirror ? `rotate(${turn}deg)${mirror}` : undefined
})
</script>

<template>
  <img
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
</style>
