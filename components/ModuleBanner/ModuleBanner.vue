<script setup lang="ts">
import { useMarquee } from '../../composables/useMarquee'

/**
 * The band that carries the module capsules — **the band of 14 September,
 * compact** (ADR-0202, variant N2).
 *
 * **Dark on any page, and neutral**: `gray-light-800`, its own primitive (a
 * named suppression, as `MapPin`'s inks), never the app's green-grey dark mode;
 * it carries `data-theme="dark"` so what it holds takes its dark tones. Its
 * capsules are **darker than it** (900), hollowed into it — ADR-0048's ramp,
 * where they rose above it, is reversed.
 *
 * `spacing-sm` above and below, `spacing-lg` at the sides, `spacing-md` between
 * capsules, `radius-surface` — or no corners with `bleed` (ADR-0211): four
 * corners close the band and it reads as one more card.
 *
 * Pair it with `RevealTransition` for the entrance the product gives it: the
 * band opens its own height once the data arrives.
 */
interface Props {
  /**
   * `static` — the band is as wide as its capsules.
   * `scroll` — it clips and the reader scrolls it.
   * `marquee` — it scrolls itself, continuously, pausing under the pointer and
   * draggable. This is what the product's dashboard does.
   */
  motion?: 'static' | 'scroll' | 'marquee'
  /** Accessible name for the band, e.g. "Vos modules". */
  label?: string
  /**
   * Edge to edge (ADR-0211): no corners. The product lays the band across the
   * whole window, under the navigation column on the left and out through the
   * window's edge on the right — the overflow is what says it scrolls. No fade
   * at either edge: the clean cut is what passes over it.
   */
  bleed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  motion: 'scroll',
  label: undefined,
  bleed: false,
})

// The composable owns the frame loop; the component owns only the shape it
// needs — a clipping viewport and a track whose transform is written each frame.
const { container, content, pause, resume, startDrag, drag, endDrag, isDragging, reducedMotion } =
  useMarquee()
</script>

<template>
  <div
    :class="['ds-module-banner', `ds-module-banner--${props.motion}`, { 'ds-module-banner--bleed': props.bleed }]"
    data-theme="dark"
    :role="label ? 'group' : undefined"
    :aria-label="label"
  >
    <template v-if="props.motion === 'marquee'">
      <div
        ref="container"
        class="ds-module-banner__viewport"
        :class="{ 'is-dragging': isDragging, 'is-reduced': reducedMotion }"
        @mouseenter="pause"
        @mouseleave="resume"
        @mousedown="startDrag"
        @mousemove="drag"
        @mouseup="endDrag"
      >
        <div ref="content" class="ds-module-banner__track">
          <!-- The run is rendered TWICE and the two halves must be identical:
               the loop wraps by subtracting half the track width, so any
               difference between them shows up as a jump at the seam. The copy
               is hidden from assistive tech — it is the same content. -->
          <div class="ds-module-banner__run"><slot /></div>
          <div class="ds-module-banner__run" aria-hidden="true"><slot /></div>
        </div>
      </div>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped>
.ds-module-banner {
  display: flex;
  align-items: stretch;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg);
  /* token-lint-disable-next-line no-raw-primitive — the band is dark on any page, its own neutral palette (ADR-0202) */
  background-color: var(--ds-color-gray-light-800);
  border-radius: var(--ds-radius-surface);
}

/* Edge to edge: the band is not a card, it passes under what bounds it (ADR-0211). */
.ds-module-banner--bleed {
  border-radius: 0;
}

/* …and the cut is at its edge: the marquee's window reaches through the band's
   side padding (which it keeps as its own, so the run starts where it did), or
   the capsules would be cut 12px short, against the band's ground. */
.ds-module-banner--bleed .ds-module-banner__viewport {
  margin-inline: calc(-1 * var(--ds-spacing-lg));
  padding-inline: var(--ds-spacing-lg);
}

.ds-module-banner--scroll {
  overflow-x: auto;
}

/* A capsule hugs its content, which inside a scrolling row would let flexbox
   shrink it below that. */
.ds-module-banner > :deep(*) {
  flex: none;
}

/* ── Marquee ──────────────────────────────────────────────────────── */
.ds-module-banner--marquee {
  overflow: hidden;
}

.ds-module-banner__viewport {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.ds-module-banner__viewport.is-dragging {
  cursor: grabbing;
}

/* The loop is stopped when the system asks for less motion, and a stopped
   marquee inside `overflow: hidden` would put every capsule past the fold out of
   reach. Less motion must not mean less content, so the viewport hands the row
   back to the reader to scroll. */
.ds-module-banner__viewport.is-reduced {
  overflow-x: auto;
  cursor: default;
}

/* The transform on this element is rewritten every frame, so it must carry no
   transition of its own — a transition here would push every frame through an
   interpolation and the row would seize. */
.ds-module-banner__track {
  display: flex;
  align-items: stretch;
  gap: var(--ds-spacing-md);
  width: max-content;
}

/* The same gap as the band's, between capsules and between the two runs: the
   loop wraps by subtracting half the track, so a seam wider or narrower than
   the rhythm shows up as a jump. */
.ds-module-banner__run {
  display: flex;
  align-items: stretch;
  gap: var(--ds-spacing-md);
}

.ds-module-banner__run > :deep(*) {
  flex: none;
}
</style>
