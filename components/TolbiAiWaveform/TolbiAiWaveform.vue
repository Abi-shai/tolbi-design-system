<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * `tail` — one bar per level, the newest on the right: a recording as it
 * happens. The oldest bars leave on the left once the row is full.
 *
 * `whole` — the whole recording, gathered into as many bars as the row holds:
 * a voice note to play back.
 */
export type TolbiAiWaveformFit = 'tail' | 'whole'

interface Props {
  /**
   * Sound levels, 0 (silence) to 1 — one every 100 ms, as the recorder takes
   * them. Silence is the lowest bar, never no bar.
   */
  levels: number[]
  fit?: TolbiAiWaveformFit
  /**
   * How far playback has gone, 0 to 1: the bars before it take the strong ink,
   * the bars still to play the faint one. `null` — nothing is playing — gives
   * every bar the same ink.
   */
  progress?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  fit: 'tail',
  progress: null,
})

/*
  The bar's geometry is the drawing's (Figma `TolbiAI/Onde`): 3px wide, 2px
  apart, 4px tall at silence and 24px at full — the row's own height. Read here
  to count how many bars a row holds; the stylesheet draws them.
*/
const BAR = 3
const GAP = 2
/* More bars than any row holds, so a long recording does not grow the DOM. */
const TAIL_CAP = 160

const root = ref<HTMLElement>()
const capacity = ref(0)
let observer: ResizeObserver | undefined

onMounted(() => {
  const el = root.value
  if (!el) return
  const measure = () => (capacity.value = Math.max(1, Math.floor((el.clientWidth + GAP) / (BAR + GAP))))
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())

const clamp = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0))

/*
  `whole` folds the recording into the bars the row holds — each bar the mean
  of its share. Not the peak: folded six to one, peaks flatten every word into
  the same tall bar and the waveform stops looking like speech. Fewer levels
  than room: one bar each, not stretched.
*/
const bars = computed(() => {
  const levels = props.levels.map(clamp)
  if (props.fit === 'tail') return levels.slice(-TAIL_CAP)
  const n = capacity.value
  /* No levels — a note from before levels were kept: a flat line, not a hole. */
  if (!levels.length) return Array.from({ length: n }, () => 0)
  const folded =
    !n || levels.length <= n
      ? levels
      : Array.from({ length: n }, (_, i) => {
          const from = Math.floor((i * levels.length) / n)
          const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / n))
          const share = levels.slice(from, to)
          return share.reduce((sum, v) => sum + v, 0) / share.length
        })
  /* Scaled to its own loudest bar: a quiet microphone still draws a waveform
     that reads, and two notes compare by shape, not by gain. Live levels are
     not scaled — a running maximum would make every bar jump. */
  const loudest = Math.max(...folded)
  return loudest > 0 ? folded.map((v) => v / loudest) : folded
})

const played = computed(() =>
  props.progress === null ? -1 : Math.round(clamp(props.progress) * bars.value.length),
)
</script>

<template>
  <div
    ref="root"
    class="ds-tolbi-ai-waveform"
    :class="{ 'ds-tolbi-ai-waveform--playback': progress !== null }"
    aria-hidden="true"
  >
    <span
      v-for="(level, i) in bars"
      :key="i"
      class="ds-tolbi-ai-waveform__bar"
      :class="{ 'ds-tolbi-ai-waveform__bar--played': i < played }"
      :style="{ '--tolbi-ai-waveform-level': level }"
    />
  </div>
</template>

<style scoped>
/*
  Decorative: what it shows — that there is sound, and how far it has played —
  is said in words beside it (the timer, the duration).
*/
.ds-tolbi-ai-waveform {
  --tolbi-ai-waveform-bar: 3px;
  --tolbi-ai-waveform-floor: 4px;
  --tolbi-ai-waveform-height: 24px;
  --tolbi-ai-waveform-ink: var(--ds-text-subtle);

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ds-spacing-xxs);
  height: var(--tolbi-ai-waveform-height);
  min-width: 0;
  overflow: hidden;
}

/* Playing: what has played is the strong ink, what is left the faint one. */
.ds-tolbi-ai-waveform--playback {
  --tolbi-ai-waveform-ink: var(--ds-text-subtlest);
}

.ds-tolbi-ai-waveform__bar {
  flex-shrink: 0;
  width: var(--tolbi-ai-waveform-bar);
  height: calc(
    var(--tolbi-ai-waveform-floor)
      + var(--tolbi-ai-waveform-level) * (100% - var(--tolbi-ai-waveform-floor))
  );
  border-radius: var(--ds-radius-pill);
  background: var(--tolbi-ai-waveform-ink);
}

.ds-tolbi-ai-waveform__bar--played {
  background: var(--ds-text-strong);
}
</style>
