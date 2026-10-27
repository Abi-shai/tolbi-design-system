<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import { StepDots } from '../StepDots'

/**
 * A walkthrough in a window (ADR-0088, track A) — what is new, how a flow
 * goes: a few slides, each a 16:9 picture or video, a title and a sentence,
 * in the package's own `Dialog`.
 *
 * The format is our windows': the close alone in the head (the window's name
 * is said, not shown — each slide has its title), the picture inset 20px at
 * `radius-surface-sm` (Untitled UI), the text on the window's left edge, the
 * dots at the foot's start (`Dialog`'s `#summary`) and the actions at its end —
 * « Passer » on the first slide, « Précédent » after, « Suivant », and on the
 * last the action the walkthrough leads to (`doneLabel`). **Nothing moves by
 * itself** (0 / 4): a slide changes when it is asked to, by a fade over `enter`
 * (Fluent), the picture and the words in place. Every slide sits in one cell,
 * so the window keeps the tallest one's height and never jumps from a short
 * sentence to a long one. The change is announced — « Étape 2 sur 3 » and the
 * slide's title — through the foot's status. A video does not play by itself
 * and stops when its slide leaves.
 */
export interface CarouselSlide {
  title: string
  text?: string
  /** A 16:9 picture. */
  image?: string
  /** What the picture shows — empty when the text already says it. */
  imageAlt?: string
  /** A 16:9 video, played on demand. */
  video?: string
  poster?: string
}

interface Props {
  /** The window's name — read when it opens, not shown. */
  title: string
  slides: CarouselSlide[]
  skipLabel?: string
  previousLabel?: string
  nextLabel?: string
  /** The last slide's action — the walkthrough's purpose: « Tracer ma première parcelle ». */
  doneLabel?: string
  stepLabel?: string
  ofLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  skipLabel: 'Passer',
  previousLabel: 'Précédent',
  nextLabel: 'Suivant',
  doneLabel: 'Terminer',
  stepLabel: 'Étape',
  ofLabel: 'sur',
})

const open = defineModel<boolean>('open', { default: false })
/** The slide shown, from 1. */
const step = defineModel<number>('step', { default: 1 })

const emit = defineEmits<{
  /** Left before the end — « Passer », the close or Escape. */
  skip: []
  /** The last slide's action. */
  done: []
}>()

const count = computed(() => props.slides.length)
const current = computed(() => Math.min(Math.max(1, step.value), Math.max(1, count.value)))
const last = computed(() => current.value === count.value)
const slidesEl = ref<HTMLElement | null>(null)

function go(next: number) {
  step.value = Math.min(Math.max(1, next), count.value)
}

function skip() {
  emit('skip')
  open.value = false
}

function done() {
  emit('done')
  open.value = false
}

/* A slide that leaves stops its video. */
watch(current, async () => {
  await nextTick()
  slidesEl.value?.querySelectorAll<HTMLVideoElement>('.ds-carousel__slide:not(.ds-carousel__slide--current) video').forEach(v => v.pause())
})

/* A walkthrough opened again starts from its beginning. */
watch(open, isOpen => { if (isOpen) step.value = 1 })
</script>

<template>
  <Dialog v-model:open="open" :title="title" hide-title @cancel="emit('skip')">
    <template #form>
      <div class="ds-carousel" aria-roledescription="carousel" :aria-label="title">
        <div ref="slidesEl" class="ds-carousel__slides">
          <div
            v-for="(slide, i) in slides"
            :key="i"
            class="ds-carousel__slide"
            :class="{ 'ds-carousel__slide--current': i + 1 === current }"
            role="group"
            aria-roledescription="slide"
            :aria-label="`${i + 1} ${ofLabel} ${count}`"
            :aria-hidden="i + 1 === current ? undefined : 'true'"
            :inert="i + 1 !== current"
          >
            <img v-if="slide.image" class="ds-carousel__media" :src="slide.image" :alt="slide.imageAlt ?? ''" />
            <video
              v-else-if="slide.video"
              class="ds-carousel__media"
              :src="slide.video"
              :poster="slide.poster"
              controls
              playsinline
              preload="metadata"
            />
            <div class="ds-carousel__text">
              <h3 class="ds-carousel__title">{{ slide.title }}</h3>
              <p v-if="slide.text" class="ds-carousel__sentence">{{ slide.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #summary>
      <StepDots :total="count" :current="current" :aria-label="null" />
      <span class="ds-carousel__status">{{ stepLabel }} {{ current }} {{ ofLabel }} {{ count }} · {{ slides[current - 1]?.title }}</span>
    </template>

    <template #actions>
      <Button v-if="current === 1" variant="secondary-gray" size="sm" :label="skipLabel" @click="skip" />
      <Button v-else variant="secondary-gray" size="sm" :label="previousLabel" @click="go(current - 1)" />
      <Button size="sm" :label="last ? doneLabel : nextLabel" data-autofocus @click="last ? done() : go(current + 1)" />
    </template>
  </Dialog>
</template>

<style scoped>
/* Every slide in one cell: the tallest decides the window's height. */
.ds-carousel__slides {
  display: grid;
}

.ds-carousel__slide {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-2xl);
  grid-area: 1 / 1;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    visibility 0s linear var(--ds-motion-duration-enter);
}

.ds-carousel__slide--current {
  opacity: 1;
  visibility: visible;
  transition:
    opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    visibility 0s;
}

.ds-carousel__media {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--ds-radius-surface-sm);
  background: var(--ds-bg-neutral-subtle);
}

.ds-carousel__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
}

.ds-carousel__title {
  margin: 0;
  font: var(--ds-font-heading-md);
  color: var(--ds-text-strong);
}

.ds-carousel__sentence {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

/* Said by the foot's status, never seen: the dots show it. */
.ds-carousel__status {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
