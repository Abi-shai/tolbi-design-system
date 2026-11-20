<script setup lang="ts">
import { useId } from 'vue'
import type { IconSize } from '../Icon'

/**
 * The glyph of a GIS mode (ADR-0236) — Explorer, Analyser, Rapporter, the three
 * views `MapTopBar` switches between. **Not drawn here**: Fluent UI System
 * Icons' « Color » set (Microsoft, MIT) — `globe`,
 * `data-bar-vertical-ascending`, `document-text` at 24 — kept as the set ships
 * them, then recoloured with **one rule for the family** (« one must not feel a
 * difference »):
 *
 * - every shape takes **the same gradient in the same frame** — from (3, 2) to
 *   (21, 22) of the 24 box, `userSpaceOnUse`, light to dark;
 * - the details (meridians, folded corner, the document's lines) are a flat
 *   **pale**;
 * - effects one icon alone carried are gone (Fluent's drop shadow on the
 *   document).
 *
 * **Two tones**: `active` (the view shown) `brand-100 / 300 / 600`; at rest
 * `gray-light-300 / 400 / 500` — set back, not disabled. The tone change
 * travels: the stops' colour over `moderate`, `easing-in-out`, with the
 * switch's indicator. The inks are the glyph's own (categorical primitives,
 * named suppressions, ADR-0010) and do not follow the theme.
 *
 * **The charter forbids gradients**; this one is an exception, taken knowingly
 * by the owner for these three glyphs.
 *
 * **Its moving piece is exposed** — the meridians, the three bars with their
 * rank, the lines — and `arrived` plays it once: the glyph settles (80 % →
 * 100 %, `enter`, `easing-out`) while the meridians turn (−30° → 0,
 * `considered`), the bars rise one after another (`scaleY` 0.2 → 1, `process`,
 * 50ms apart) and the lines write themselves (`scaleX` 0 → 1, `process`, 50ms
 * late). Nothing under reduced motion. Decorative: the view's label names it.
 */
export type ViewGlyphView = 'map' | 'analytics' | 'report'

interface Props {
  view: ViewGlyphView
  /** The view shown: the brand's tones. At rest, the greys. */
  active?: boolean
  /** Plays the arrival — set it when the view has just been chosen, not on load. */
  arrived?: boolean
  /** On `Icon`'s ladder; 28 for a bar's switch at its largest (`ButtonGroup xl`). */
  size?: IconSize | 28
}

withDefaults(defineProps<Props>(), { active: false, arrived: false, size: 24 })

const gradientId = `ds-view-glyph-${useId()}`

/* Fluent Color's paths, as the set ships them (viewBox 0 0 24 24). */
const GLOBE = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10'
const MERIDIANS = 'M9.115 2.422a9.6 9.6 0 0 0-.85 1.704c-.48 1.23-.838 2.723-1.049 4.374H2.63q-.271.725-.43 1.5h4.87a29 29 0 0 0 .088 5h-4.7q.246.78.61 1.5h4.297c.215 1.255.52 2.397.9 3.374c.246.63.53 1.205.85 1.704A10 10 0 0 0 12 22a10 10 0 0 0 2.885-.422a9.6 9.6 0 0 0 .85-1.704c.38-.977.685-2.119.9-3.374h4.298q.364-.72.61-1.5h-4.7a29 29 0 0 0 .088-5h4.87a10 10 0 0 0-.43-1.5h-4.587c-.21-1.651-.57-3.144-1.05-4.374a9.6 9.6 0 0 0-.849-1.704A10 10 0 0 0 12 2a10 10 0 0 0-2.885.422M8.73 8.5c.2-1.47.522-2.774.934-3.829c.36-.92.77-1.612 1.194-2.062C11.278 2.163 11.663 2 12 2s.723.163 1.143.609c.423.45.835 1.142 1.194 2.062c.412 1.055.734 2.36.934 3.829zM12 22c.338 0 .723-.163 1.143-.609c.423-.45.835-1.142 1.194-2.062c.316-.81.58-1.765.775-2.829H8.888c.196 1.064.46 2.02.775 2.829c.36.92.77 1.612 1.194 2.062c.42.446.805.609 1.143.609M8.5 12c0 1.048.058 2.055.166 3h6.668a27 27 0 0 0 .094-5H8.573a27 27 0 0 0-.073 2'
const BARS = [
  'M7.5 13.25a2.25 2.25 0 0 0-4.5 0v5.5a2.25 2.25 0 0 0 4.5 0z',
  'M14 9.25a2.25 2.25 0 0 0-4.5 0v9.5a2.25 2.25 0 0 0 4.5 0z',
  'M20.5 5.25a2.25 2.25 0 0 0-4.5 0v13.5a2.25 2.25 0 0 0 4.5 0z',
]
const SHEET = 'M6 22h12a2 2 0 0 0 2-2V9l-5-2l-2-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2'
const CORNER = 'M13 7.5V2l7 7h-5.5A1.5 1.5 0 0 1 13 7.5'
const LINES = 'M8.75 11.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5zm0 2.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5zm0 2.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5z'
</script>

<template>
  <svg
    class="ds-view-glyph"
    :class="{ 'ds-view-glyph--active': active, 'ds-view-glyph--arrived': arrived }"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
        <stop class="ds-view-glyph__light" />
        <stop class="ds-view-glyph__dark" offset="1" />
      </linearGradient>
    </defs>
    <template v-if="view === 'map'">
      <path :d="GLOBE" :fill="`url(#${gradientId})`" />
      <path :d="MERIDIANS" class="ds-view-glyph__pale ds-view-glyph__meridians" fill-rule="evenodd" />
    </template>
    <template v-else-if="view === 'analytics'">
      <path
        v-for="(d, step) in BARS"
        :key="step"
        :d="d"
        :fill="`url(#${gradientId})`"
        class="ds-view-glyph__bar"
        :style="{ '--view-glyph-step': step }"
      />
    </template>
    <template v-else>
      <path :d="SHEET" :fill="`url(#${gradientId})`" />
      <path :d="CORNER" class="ds-view-glyph__pale" />
      <path :d="LINES" class="ds-view-glyph__pale ds-view-glyph__lines" fill-opacity=".9" />
    </template>
  </svg>
</template>

<style scoped>
/* At rest: the greys, dark enough to keep the volume — set back, not disabled. */
.ds-view-glyph {
  display: block;
  flex: none;
  /* token-lint-disable-next-line no-raw-primitive — the glyph's own ink at rest, categorical (ADR-0236) */
  --view-glyph-pale: var(--ds-color-gray-light-300);
  /* token-lint-disable-next-line no-raw-primitive — the glyph's own ink at rest, categorical (ADR-0236) */
  --view-glyph-light: var(--ds-color-gray-light-400);
  /* token-lint-disable-next-line no-raw-primitive — the glyph's own ink at rest, categorical (ADR-0236) */
  --view-glyph-dark: var(--ds-color-gray-light-500);
}

/* Lit: the brand's tones. */
.ds-view-glyph--active {
  /* token-lint-disable-next-line no-raw-primitive — the glyph's own ink lit, categorical (ADR-0236) */
  --view-glyph-pale: var(--ds-color-brand-100);
  /* token-lint-disable-next-line no-raw-primitive — the glyph's own ink lit, categorical (ADR-0236) */
  --view-glyph-light: var(--ds-color-brand-300);
  /* token-lint-disable-next-line no-raw-primitive — the glyph's own ink lit, categorical (ADR-0236) */
  --view-glyph-dark: var(--ds-color-brand-600);
}

.ds-view-glyph__light {
  stop-color: var(--view-glyph-light);
}

.ds-view-glyph__dark {
  stop-color: var(--view-glyph-dark);
}

.ds-view-glyph__pale {
  fill: var(--view-glyph-pale);
}

/* The tone travels with the switch's indicator. */
.ds-view-glyph__light,
.ds-view-glyph__dark {
  transition: stop-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-in-out);
}

.ds-view-glyph__pale {
  transition: fill var(--ds-motion-duration-moderate) var(--ds-motion-easing-in-out);
}

/* The arrival: the glyph settles, then its piece moves, each in its own box. */
.ds-view-glyph__meridians,
.ds-view-glyph__bar,
.ds-view-glyph__lines {
  transform-box: fill-box;
}

.ds-view-glyph--arrived {
  animation: ds-view-glyph-settle var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-view-glyph--arrived .ds-view-glyph__meridians {
  transform-origin: center;
  animation: ds-view-glyph-turn var(--ds-motion-duration-considered) var(--ds-motion-easing-out);
}

.ds-view-glyph--arrived .ds-view-glyph__bar {
  transform-origin: bottom;
  animation: ds-view-glyph-rise var(--ds-motion-duration-process) var(--ds-motion-easing-out)
    calc(var(--view-glyph-step) * var(--ds-motion-duration-instant)) backwards;
}

.ds-view-glyph--arrived .ds-view-glyph__lines {
  transform-origin: left;
  animation: ds-view-glyph-write var(--ds-motion-duration-process) var(--ds-motion-easing-out)
    var(--ds-motion-duration-instant) backwards;
}

@keyframes ds-view-glyph-settle {
  from { transform: scale(0.8); }
}

@keyframes ds-view-glyph-turn {
  from { transform: rotate(-30deg); }
}

@keyframes ds-view-glyph-rise {
  from { transform: scaleY(0.2); }
}

@keyframes ds-view-glyph-write {
  from { transform: scaleX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ds-view-glyph--arrived,
  .ds-view-glyph--arrived .ds-view-glyph__meridians,
  .ds-view-glyph--arrived .ds-view-glyph__bar,
  .ds-view-glyph--arrived .ds-view-glyph__lines {
    animation: none;
  }
}
</style>
