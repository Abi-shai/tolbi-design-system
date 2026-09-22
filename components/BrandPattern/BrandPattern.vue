<script setup lang="ts">
import { computed, useId } from 'vue'
import { marks, placements, stamp, tile } from './tile'

/**
 * The ground the pattern is printed on, and the ink it is printed in. The two
 * travel together (ADR-0006): a pattern is only ever a backdrop for something,
 * so the component that paints the surface owns what reads on it.
 *
 * `inverse` is the brand sheet — white ink on the dark ground — and it flips
 * with the colour mode, because that is what `inverse` means here (ADR-0029).
 */
export type BrandPatternSurface = 'inverse' | 'brand' | 'neutral'

/**
 * How big the mark is drawn. Each step doubles it, and `lg` is the brand
 * sheet's own size — which is a specimen's size, not the pattern's: the sheet
 * is 3538px wide and nothing in the product is (ADR-0031 made the same call
 * about a drawn width). `md` is the one that reads as a page backdrop.
 */
export type BrandPatternScale = 'sm' | 'md' | 'lg'

/** The same vocabulary as `Card`, so the two pad alike. */
export type BrandPatternPadding = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  surface?: BrandPatternSurface
  scale?: BrandPatternScale
  padding?: BrandPatternPadding
}

const props = withDefaults(defineProps<Props>(), {
  surface: 'inverse',
  scale: 'md',
  padding: 'none',
})

defineSlots<{ default?: () => unknown }>()

/* Ratios, not lengths: the tile carries the only measurement there is, and a
   second one here would be a second source of truth for the mark's size. */
const SCALES = { sm: 0.25, md: 0.5, lg: 1 } as const

/* Two ids, because two patterns on one page must not share either. */
const uid = useId()
const markId = `ds-brand-pattern-mark-${uid}`
const patternId = `ds-brand-pattern-${uid}`

const patternTransform = computed(() => `scale(${SCALES[props.scale]})`)

const placement = (x: number, y: number, rotation: number) =>
  `translate(${x} ${y}) rotate(${rotation}) translate(${-stamp.anchorX} ${-stamp.anchorY})`
</script>

<template>
  <div
    class="ds-brand-pattern"
    :class="[`ds-brand-pattern--${surface}`, `ds-brand-pattern--pad-${padding}`]"
  >
    <!--
      Decorative, always: the pattern says nothing the content does not, so it
      leaves the accessibility tree entirely rather than announcing itself.
    -->
    <svg
      class="ds-brand-pattern__art"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <g :id="markId" fill="currentColor">
          <path v-for="(d, i) in marks" :key="i" :d="d" />
        </g>

        <pattern
          :id="patternId"
          :width="tile.width"
          :height="tile.height"
          :patternTransform="patternTransform"
          patternUnits="userSpaceOnUse"
        >
          <use
            v-for="([x, y, rotation], i) in placements"
            :key="i"
            :href="`#${markId}`"
            :transform="placement(x, y, rotation)"
          />
        </pattern>
      </defs>

      <!--
        `fill-opacity` is inherited from the <svg> so it reaches every path
        inside the tile — including through <use>, which is how a doubled stamp
        composites to 36%. The rect must therefore opt out, or the whole pattern
        would be multiplied by the ink alpha a second time.
      -->
      <rect width="100%" height="100%" :fill="`url(#${patternId})`" fill-opacity="1" />
    </svg>

    <div class="ds-brand-pattern__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/*
 * The brand's `Pattern — Kaleidoscope` as a surface: the Tolbi mark tessellated,
 * seamless at any size. The radius is not a prop — it is inherited, so the
 * pattern takes the shape of whatever it is dropped into (a Card, a hero band)
 * and cannot invent a sixth one (ADR-0006).
 */
.ds-brand-pattern {
  --brand-pattern-ink-alpha: 0.2;
  --brand-pattern-pad: var(--ds-spacing-none);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: inherit;
}

.ds-brand-pattern__art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill-opacity: var(--brand-pattern-ink-alpha);
  pointer-events: none;
}

.ds-brand-pattern__content {
  position: relative;
  padding: var(--brand-pattern-pad);
  min-width: 0;
}

/* The three grounds. Each names its own on-colour: the ink and the content are
   the same token, which is what makes the pairing a guarantee rather than a
   hope. */
.ds-brand-pattern--inverse {
  background-color: var(--ds-bg-inverse);
  color: var(--ds-text-on-inverse);
}

.ds-brand-pattern--brand {
  background-color: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
}

.ds-brand-pattern--neutral {
  background-color: var(--ds-bg-neutral);
  color: var(--ds-text-default);
}

.ds-brand-pattern--pad-none { --brand-pattern-pad: var(--ds-spacing-none); }
.ds-brand-pattern--pad-sm   { --brand-pattern-pad: var(--ds-spacing-lg); }
.ds-brand-pattern--pad-md   { --brand-pattern-pad: var(--ds-spacing-xl); }
.ds-brand-pattern--pad-lg   { --brand-pattern-pad: var(--ds-spacing-3xl); }
</style>
