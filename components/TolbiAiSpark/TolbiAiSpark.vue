<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import type { ArtworkSize } from '../artwork-size'
import { readDuration } from '../../composables/cssTime'
import { leaves, spark, viewBox } from './art'

/**
 * `rest` — the sign lit: Tolbi AI is there.
 *
 * `off` — not loaded yet: every leaf at 20 %. The small spark keeps its yellow,
 * so what is dimmed is still recognisably the sign.
 *
 * `thinking` — Tolbi AI is working: the light goes round the leaves from the
 * west, clockwise, one turn every 800 ms, for as long as the work lasts and no
 * longer. **No yellow**: the loop says only that work is happening, and the
 * spark comes back when the answer does — so `accent` is ignored here. Never on
 * its own: Figma pairs it with a line saying what the work is, which carries
 * the status for assistive tech. Under reduced motion it does not turn — it is
 * `off`, and `rest` follows when the work ends (ADR-0057).
 *
 * `awakening` — the one exception (ADR-0063): played once, on the panel's
 * first opening. The pictogram turns once and grows from 94 %, the leaves
 * light in two rounds from the north, then the spark arrives and a soft glow
 * rises, holds and fades; 3.2 s, and it ends at `rest`, so the state can stay
 * as it is. It emits `awake` when it is over. Under reduced motion it is
 * `rest` at once.
 */
export type TolbiAiSparkState = 'rest' | 'off' | 'thinking' | 'awakening'

/**
 * The ground the sign sits on. It decides the leaves' ink and nothing else:
 * brand/500 on the neutral grounds, and on a coloured ground that ground's own
 * on-colour — the leaves turn white on `brand`, and on `inverse` they follow the
 * ground as it flips with the mode (ADR-0029). The small spark is yellow on
 * all three.
 */
export type TolbiAiSparkSurface = 'neutral' | 'brand' | 'inverse'

export interface TolbiAiSparkProps {
  /**
   * **The artwork's box in px**, on the shared ladder — the same one `Logo` and
   * `ModuleIcon` take. Every rung is the one 48-grid drawing scaled: Figma's 96
   * variants measure as a single drawing to 1e-6px (ADR-0056).
   *
   * Strict, like `Logo`: a sign is a brand mark, and a brand mark drawn off
   * the ladder is a drawing error rather than a size (ADR-0043).
   */
  size?: ArtworkSize
  /**
   * The small yellow spark beside the leaves. Off, the sign is the pictogram
   * alone. Never drawn while `thinking`, whatever this says.
   */
  accent?: boolean
  state?: TolbiAiSparkState
  surface?: TolbiAiSparkSurface
  /**
   * Accessible name. Defaults to the product's name; pass `null` where the
   * sign sits beside a visible « Tolbi AI », which hides it from assistive
   * tech — what else is on the surface decides, never the component (ADR-0041).
   */
  ariaLabel?: string | null
}

const props = withDefaults(defineProps<TolbiAiSparkProps>(), {
  size: 48,
  accent: true,
  state: 'rest',
  surface: 'neutral',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  /** The awakening is over and the sign is at rest. */
  awake: []
}>()

const label = computed(() => (props.ariaLabel === undefined ? 'Tolbi AI' : props.ariaLabel))

/* The glow is a blurred copy of the spark; two signs on a page need two filters. */
const glowId = `ds-tolbi-ai-spark-glow-${useId()}`

/* Every track of the awakening lasts the whole 3.2s; the turn is the one to
   listen for, so `awake` fires once. */
function onAnimationEnd(event: AnimationEvent) {
  if (props.state === 'awakening' && event.animationName.startsWith('ds-tolbi-ai-wake-turn')) emit('awake')
}

/* Under reduced motion nothing plays, so nothing ends: it is over at once. */
watch(
  () => props.state,
  (state) => {
    if (state === 'awakening' && typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
      void nextTick(() => emit('awake'))
  },
  { immediate: true },
)

/* ── The turn (ADR-0071) ─────────────────────────────────────────────── */
const group = ref<SVGGElement>()
let turning: Animation | undefined

/**
 * One turn of the leaves: the awakening's own turn, alone — its 1.65 s and
 * its curve, with the spark still and nothing dimmed, so it leaves `rest` and
 * comes back to it, 360° being 0° (ADR-0071). Something the sign does rather
 * than a state it is in: `TolbiAiLauncher` asks for it when the pointer
 * arrives. A turn under way is not restarted, only a sign at `rest` turns,
 * and under reduced motion none does — Web Animations are outside
 * motion.css's reach, so the sign asks itself (ADR-0068).
 */
function turn() {
  const g = group.value
  if (!g || typeof g.animate !== 'function' || props.state !== 'rest') return
  if (turning?.playState === 'running') return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  turning = g.animate([{ rotate: '0deg' }, { rotate: '360deg' }], {
    duration: readDuration(g, '--tolbi-ai-spark-turn'),
    easing: getComputedStyle(g).getPropertyValue('--tolbi-ai-spark-turn-curve').trim(),
  })
}

/* A state that moves the leaves itself takes them over: no turn underneath. */
watch(
  () => props.state,
  (state) => {
    if (state !== 'rest') turning?.cancel()
  },
)

defineExpose({ turn })
</script>

<template>
  <svg
    class="ds-tolbi-ai-spark"
    :class="[`ds-tolbi-ai-spark--${state}`, `ds-tolbi-ai-spark--on-${surface}`]"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
    @animationend="onAnimationEnd"
  >
    <defs v-if="accent && state === 'awakening'">
      <!-- Figma's layer blur of 2.5 on the 48 grid: a standard deviation of
           half that, in the drawing's own units, so it scales with the sign.
           The region is widened, or the default 10 % margin cuts the glow. -->
      <filter :id="glowId" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="1.25" />
      </filter>
    </defs>
    <!--
      One path per leaf, named by compass point and listed from the west,
      clockwise — the order the light goes round when Tolbi AI is working. The
      group is what turns and grows when the sign awakens.
    -->
    <g ref="group" class="ds-tolbi-ai-spark__leaves">
      <path
        v-for="leaf in leaves"
        :key="leaf.direction"
        class="ds-tolbi-ai-spark__leaf"
        :class="`ds-tolbi-ai-spark__leaf--${leaf.direction}`"
        :d="leaf.d"
      />
    </g>
    <g v-if="accent && state !== 'thinking'" class="ds-tolbi-ai-spark__spark">
      <path
        v-if="state === 'awakening'"
        class="ds-tolbi-ai-spark__accent ds-tolbi-ai-spark__glow"
        :d="spark"
        :filter="`url(#${glowId})`"
      />
      <path class="ds-tolbi-ai-spark__accent" :d="spark" />
    </g>
  </svg>
</template>

<style scoped>
.ds-tolbi-ai-spark {
  /*
    The two inks belong to the drawing, not to a role: the leaves are the brand
    green and the spark the brand yellow — "this one is green", which is the
    categorical clause of ADR-0010. So they alias the very primitives Figma
    binds, and `npm run tolbi-ai-art` fails if the export stops matching them.
  */
  /* token-lint-disable-next-line no-raw-primitive — artwork ink, categorical (ADR-0010, ADR-0056) */
  --tolbi-ai-spark-leaf: var(--ds-color-brand-500);
  /* token-lint-disable-next-line no-raw-primitive — artwork ink, categorical (ADR-0010, ADR-0056) */
  --tolbi-ai-spark-accent: var(--ds-color-accent-400);

  /*
    A leaf that is not lit. An opacity on the leaf, as in Figma, not a paler
    ink: on every ground a dimmed leaf is the same leaf, fainter.
  */
  --tolbi-ai-spark-dim: 0.2;

  /*
    The turn (ADR-0071) is the awakening's own: one turn in 1.65 s — its
    51.56 % of 3.2 s — on its ease-out. Written once more here for Web
    Animations to read off the cascade, because the awakening holds its values
    as literals in its keyframes, where a `var()` is dropped (ADR-0057). The
    two must stay equal.
  */
  --tolbi-ai-spark-turn: 1650ms;
  --tolbi-ai-spark-turn-curve: cubic-bezier(0.18, 1, 0.3, 1);

  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

/* Both of the sign's turns — the awakening's, and the one it does alone —
   pivot on the drawing's centre. */
.ds-tolbi-ai-spark__leaves {
  transform-origin: 50% 50%;
}

.ds-tolbi-ai-spark__leaf {
  fill: var(--tolbi-ai-spark-leaf);
}

.ds-tolbi-ai-spark__accent {
  fill: var(--tolbi-ai-spark-accent);
}

.ds-tolbi-ai-spark--off .ds-tolbi-ai-spark__leaf {
  opacity: var(--tolbi-ai-spark-dim);
}

/*
  Thinking. Each leaf runs the same curve — lit, down to 20 % over a quarter
  turn, held, back up over the last quarter — and each starts a quarter turn
  after the one before it, so at every moment one leaf is rising while the
  previous one falls: a cross-fade that travels, with nothing held at full.

  `in-out` on both halves, because its description is "a thing that travels"
  and that is what the light does here. Rise and fall meet at the peak with no
  velocity on either side, which is what makes the wrap seamless: 100 % and 0 %
  are the same value AND the same speed, so no frame can tell where a turn ends.

  The period is the component's own (ADR-0010): a loop has no start to time,
  so it is not a duration and takes no token (ADR-0032, ADR-0039). Its quarter
  is the 200 ms Figma gives each cross-fade.

  The negative delays put each leaf mid-curve on the first frame, so the first
  frame is already the loop — west lit, Figma's fixed view — and not a frame
  that the loop then jumps away from.
*/
.ds-tolbi-ai-spark--thinking {
  --tolbi-ai-spark-period: 800ms;
}

.ds-tolbi-ai-spark--thinking .ds-tolbi-ai-spark__leaf {
  opacity: var(--tolbi-ai-spark-dim);
  animation: ds-tolbi-ai-spark-turn var(--tolbi-ai-spark-period) var(--ds-motion-easing-in-out) infinite;
}

.ds-tolbi-ai-spark--thinking .ds-tolbi-ai-spark__leaf--north {
  animation-delay: calc(var(--tolbi-ai-spark-period) * -0.75);
}

.ds-tolbi-ai-spark--thinking .ds-tolbi-ai-spark__leaf--east {
  animation-delay: calc(var(--tolbi-ai-spark-period) * -0.5);
}

.ds-tolbi-ai-spark--thinking .ds-tolbi-ai-spark__leaf--south {
  animation-delay: calc(var(--tolbi-ai-spark-period) * -0.25);
}

/*
  The curve is set on the element, not per keyframe: a `var()` inside a
  keyframe's `animation-timing-function` is dropped and the segment falls back
  to `ease` (measured — 0.14 of opacity off the in-out curve a quarter of the
  way up). One curve for every segment is also all this needs: the hold runs
  from 20 % to 20 %, where no curve can show.
*/
@keyframes ds-tolbi-ai-spark-turn {
  0%   { opacity: 1; }
  25%  { opacity: var(--tolbi-ai-spark-dim); }
  75%  { opacity: var(--tolbi-ai-spark-dim); }
  100% { opacity: 1; }
}

/*
  Reduced motion: no loop. The leaves hold at 20 % — `off` — until the work
  ends and the caller sets `rest`. Said here rather than left to motion.css's
  global override, which would run each leaf's curve once in 0.01ms and land
  on the same frame only by the accident of the base opacity.
*/
@media (prefers-reduced-motion: reduce) {
  .ds-tolbi-ai-spark--thinking .ds-tolbi-ai-spark__leaf {
    animation: none;
  }
}

/*
  The awakening — ADR-0063, the one exception to ADR-0002: 3.2 s, a
  choreography, and a glow the brand charter does not have. Accepted for this
  one moment, the panel's first opening, and kept to it.

  Every track below is Figma's Motion data (`TolbiAI/Éveil`, 2393:101704)
  transcribed: the times are its keyframe positions over 3.2 s, and the curves
  are its own — `ease-in-out` is motion.dev's easeInOut, exactly the CSS keyword
  (not the `easing-in-out` token), and cubic-bezier(0.18, 1, 0.3, 1) is the
  turn's ease-out. They are written here, not borrowed from the token scale,
  because they are not the system's: that is what an exception is. And they
  sit in the keyframes as literals — a `var()` there is dropped (ADR-0057).

  It ends on `rest`, frame for frame, so nothing jumps when the state is
  changed afterwards, or never changed at all.
*/
.ds-tolbi-ai-spark--awakening {
  --tolbi-ai-spark-awakening: 3.2s;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__leaves {
  animation:
    ds-tolbi-ai-wake-turn var(--tolbi-ai-spark-awakening) linear both,
    ds-tolbi-ai-wake-grow var(--tolbi-ai-spark-awakening) linear both;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__leaf--north {
  animation: ds-tolbi-ai-wake-north var(--tolbi-ai-spark-awakening) linear both;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__leaf--east {
  animation: ds-tolbi-ai-wake-east var(--tolbi-ai-spark-awakening) linear both;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__leaf--south {
  animation: ds-tolbi-ai-wake-south var(--tolbi-ai-spark-awakening) linear both;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__leaf--west {
  animation: ds-tolbi-ai-wake-west var(--tolbi-ai-spark-awakening) linear both;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__spark {
  animation: ds-tolbi-ai-wake-spark var(--tolbi-ai-spark-awakening) linear both;
}

.ds-tolbi-ai-spark__glow {
  opacity: 0;
}

.ds-tolbi-ai-spark--awakening .ds-tolbi-ai-spark__glow {
  animation: ds-tolbi-ai-wake-glow var(--tolbi-ai-spark-awakening) linear both;
}

/* 0 → 1.65 s: one turn. */
@keyframes ds-tolbi-ai-wake-turn {
  0%     { rotate: 0deg; animation-timing-function: cubic-bezier(0.18, 1, 0.3, 1); }
  51.56% { rotate: 360deg; }
  100%   { rotate: 360deg; }
}

/* 0 → 0.5 s: 94 % → 100 %. */
@keyframes ds-tolbi-ai-wake-grow {
  0%     { scale: 0.94; animation-timing-function: cubic-bezier(0.18, 1, 0.3, 1); }
  15.63% { scale: 1; }
  100%   { scale: 1; }
}

/* Two rounds, N → E → S → W, a leaf every ~0.2 s; all full at 1.75 s. */
@keyframes ds-tolbi-ai-wake-north {
  0%     { opacity: 1; animation-timing-function: ease-in-out; }
  6.25%  { opacity: 0.2; animation-timing-function: linear; }
  18.75% { opacity: 0.2; animation-timing-function: ease-in-out; }
  24.38% { opacity: 1; animation-timing-function: ease-in-out; }
  30%    { opacity: 0.2; animation-timing-function: linear; }
  40%    { opacity: 0.2; animation-timing-function: cubic-bezier(0.42, 0, 0.25, 1); }
  54.69% { opacity: 1; }
  100%   { opacity: 1; }
}

@keyframes ds-tolbi-ai-wake-east {
  0%     { opacity: 0.2; animation-timing-function: ease-in-out; }
  6.25%  { opacity: 1; animation-timing-function: ease-in-out; }
  12.5%  { opacity: 0.2; animation-timing-function: linear; }
  24.38% { opacity: 0.2; animation-timing-function: ease-in-out; }
  30%    { opacity: 1; animation-timing-function: ease-in-out; }
  35%    { opacity: 0.2; animation-timing-function: linear; }
  40%    { opacity: 0.2; animation-timing-function: cubic-bezier(0.42, 0, 0.25, 1); }
  54.69% { opacity: 1; }
  100%   { opacity: 1; }
}

@keyframes ds-tolbi-ai-wake-south {
  0%     { opacity: 0.2; animation-timing-function: linear; }
  6.25%  { opacity: 0.2; animation-timing-function: ease-in-out; }
  12.5%  { opacity: 1; animation-timing-function: ease-in-out; }
  18.75% { opacity: 0.2; animation-timing-function: linear; }
  30%    { opacity: 0.2; animation-timing-function: ease-in-out; }
  35%    { opacity: 1; animation-timing-function: ease-in-out; }
  40%    { opacity: 0.2; animation-timing-function: cubic-bezier(0.42, 0, 0.25, 1); }
  54.69% { opacity: 1; }
  100%   { opacity: 1; }
}

@keyframes ds-tolbi-ai-wake-west {
  0%     { opacity: 0.2; animation-timing-function: linear; }
  12.5%  { opacity: 0.2; animation-timing-function: ease-in-out; }
  18.75% { opacity: 1; animation-timing-function: ease-in-out; }
  24.38% { opacity: 0.2; animation-timing-function: linear; }
  35%    { opacity: 0.2; animation-timing-function: ease-in-out; }
  40%    { opacity: 1; }
  100%   { opacity: 1; }
}

/* 1.70 s: the spark enters, in 250 ms. */
@keyframes ds-tolbi-ai-wake-spark {
  0%     { opacity: 0; }
  53.13% { opacity: 0; animation-timing-function: cubic-bezier(0.18, 1, 0.3, 1); }
  60.94% { opacity: 1; }
  100%   { opacity: 1; }
}

/* 1.70 s: its glow rises (400 ms), holds (400 ms), fades (700 ms). */
@keyframes ds-tolbi-ai-wake-glow {
  0%     { opacity: 0; }
  53.13% { opacity: 0; animation-timing-function: cubic-bezier(0.18, 1, 0.3, 1); }
  65.63% { opacity: 1; }
  78.13% { opacity: 1; animation-timing-function: ease-in-out; }
  100%   { opacity: 0; }
}

/* Reduced motion: the final state at once — which is `rest`. */
@media (prefers-reduced-motion: reduce) {
  .ds-tolbi-ai-spark--awakening :is(.ds-tolbi-ai-spark__leaves, .ds-tolbi-ai-spark__leaf, .ds-tolbi-ai-spark__spark, .ds-tolbi-ai-spark__glow) {
    animation: none;
  }
}

/*
  On a coloured ground the leaves take the ground's exact partner (ADR-0009),
  never a literal: on `inverse` that partner flips with the mode, and a white
  leaf would vanish on the light inverse of a dark page.
*/
.ds-tolbi-ai-spark--on-brand {
  --tolbi-ai-spark-leaf: var(--ds-text-on-brand-solid);
}

.ds-tolbi-ai-spark--on-inverse {
  --tolbi-ai-spark-leaf: var(--ds-text-on-inverse);
}
</style>
