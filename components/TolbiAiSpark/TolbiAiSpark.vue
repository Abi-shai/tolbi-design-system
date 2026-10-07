<script setup lang="ts">
import { computed } from 'vue'
import type { ArtworkSize } from '../artwork-size'
import { leaves, spark, viewBox } from './art'

/**
 * `rest` — the sign lit: Tolbi AI is there.
 *
 * `off` — not loaded yet: every leaf at 20 %. The small spark keeps its yellow,
 * so what is dimmed is still recognisably the sign.
 */
export type TolbiAiSparkState = 'rest' | 'off'

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
   * alone — the form the thinking loop uses, since that motion has no yellow.
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
    <path v-if="accent" class="ds-tolbi-ai-spark__accent" :d="spark" />
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
