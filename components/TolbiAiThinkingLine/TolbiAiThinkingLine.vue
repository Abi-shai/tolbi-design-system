<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { TolbiAiSpark } from '../TolbiAiSpark'

/**
 * Tolbi AI is working: one line, where the answer is about to appear — the sign
 * thinking at 16 and a few words saying what the work is, at the answer's own
 * size in the receding ink (ADR-0065). The answer takes its place (ADR-0058).
 *
 * One movement at a time: the leaves turn and the text does not — no shimmer,
 * no animated ellipsis. The words change once, when the wait gets long.
 */
interface Props {
  /** What Tolbi AI is doing, in a few words. */
  label?: string
  /**
   * What the line says once the wait is long. `null` keeps `label` for the
   * whole wait.
   */
  longWaitLabel?: string | null
  /** When the wait counts as long, in ms, from the moment the line appears. */
  longWaitAfter?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Je lis les données du projet…',
  longWaitLabel: 'Encore un instant…',
  longWaitAfter: 10000,
})

const long = ref(false)
const shown = computed(() => (long.value && props.longWaitLabel ? props.longWaitLabel : props.label))

/*
  What the status region says, kept apart from what the eye reads. A live
  region announces a CHANGE, and one that arrives already filled is announced
  by some screen readers and skipped by others — so the region is mounted
  empty and filled once it exists in the accessibility tree. 100ms is the
  wait the established announcers use for the same reason (React Aria's,
  Angular CDK's). The visible words are hidden from assistive tech, or a
  reader moving through the page would meet them twice.
*/
const REGISTER = 100
const announced = ref('')

let registerTimer: ReturnType<typeof setTimeout> | undefined
let longTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  registerTimer = setTimeout(() => {
    announced.value = shown.value
    registerTimer = undefined
  }, REGISTER)
  if (props.longWaitLabel) longTimer = setTimeout(() => (long.value = true), props.longWaitAfter)
})

/* After the first announcement, every change of words is announced once. */
watch(shown, (words) => {
  if (registerTimer === undefined) announced.value = words
})

onBeforeUnmount(() => {
  clearTimeout(registerTimer)
  clearTimeout(longTimer)
})
</script>

<template>
  <div class="ds-tolbi-ai-thinking-line">
    <span class="ds-tolbi-ai-thinking-line__sign">
      <TolbiAiSpark :size="16" state="thinking" :aria-label="null" />
    </span>
    <span class="ds-tolbi-ai-thinking-line__label" aria-hidden="true">{{ shown }}</span>
    <span class="ds-tolbi-ai-thinking-line__status" role="status">{{ announced }}</span>
  </div>
</template>

<style scoped>
/*
  The words are read at the answer's size — `body-md`, the answer's own role —
  and recede by their ink, `text-subtle`, not by shrinking (ADR-0065: measured
  across twelve products, ours was the smallest and among the palest).

  `flex-start`, not `center`: the sign sits in a box one line tall (`1lh`) and
  is centred in it, so it stays on the first line whether the words fit on one
  or wrap onto two — and follows the role if the role changes.
*/
.ds-tolbi-ai-thinking-line {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-md);
  min-width: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

.ds-tolbi-ai-thinking-line__sign {
  display: flex;
  flex: none;
  align-items: center;
  height: 1lh;
}

.ds-tolbi-ai-thinking-line__label {
  min-width: 0;
}

/* Visually hidden, still announced — never display:none. */
.ds-tolbi-ai-thinking-line__status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
