<script setup lang="ts">
import { computed } from 'vue'
import type { ArtworkSize } from '../artwork-size'
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
 */
export type TolbiAiSparkState = 'rest' | 'off' | 'thinking'

/**
 * The ground the sign sits on. It decides the leaves' ink and nothing else:
 * brand/500 on the neutral grounds, and on a coloured ground that ground's own
 * on-colour — the leaves turn white on `brand`, and on `inverse` they follow the
 * ground as it flips with the mode (ADR-0029). The small spark is yellow on
 * all three.
 */
export type TolbiAiSparkSurface = 'neutral' | 'brand' | 'inverse'

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  accent: true,
  state: 'rest',
  surface: 'neutral',
  ariaLabel: undefined,
})

const label = computed(() => (props.ariaLabel === undefined ? 'Tolbi AI' : props.ariaLabel))
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
  >
    <!--
      One path per leaf, named by compass point and listed from the west,
      clockwise — the order the light goes round when Tolbi AI is working.
    -->
    <path
      v-for="leaf in leaves"
      :key="leaf.direction"
      class="ds-tolbi-ai-spark__leaf"
      :class="`ds-tolbi-ai-spark__leaf--${leaf.direction}`"
      :d="leaf.d"
    />
    <path v-if="accent && state !== 'thinking'" class="ds-tolbi-ai-spark__accent" :d="spark" />
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

  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
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
