<script setup lang="ts">
import { useMarquee } from '../../composables/useMarquee'

/**
 * The band that carries the module capsules — Figma *Sprint 18* `1308:5261`.
 *
 * It is the half of the design that is pure colour. The band is
 * `bg-neutral-subtle` and every capsule inside it is `bg-default`, so in dark the
 * tray sits at `gray-forest/800` and the capsules are **recessed** into it at
 * `900`; in light the same pair reads as white cards in a grey tray. Without the
 * band a capsule is `bg-default` on `bg-default` and has no edge at all — which
 * is exactly what a capsule rendered on its own looks like.
 *
 * Square corners on purpose: sampled at every corner of the Figma render, the
 * fill runs to the pixel. It is a full-bleed band across the page, not a card.
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
}

const props = withDefaults(defineProps<Props>(), {
  motion: 'scroll',
  label: undefined,
})

// The composable owns the frame loop; the component owns only the shape it
// needs — a clipping viewport and a track whose transform is written each frame.
const { container, content, pause, resume, startDrag, drag, endDrag, isDragging, reducedMotion } =
  useMarquee()
</script>

<template>
  <div
    :class="['ds-module-banner', `ds-module-banner--${props.motion}`]"
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
  /* 6px, both — the band's only geometry. */
  gap: var(--ds-spacing-sm);
  padding: var(--ds-spacing-sm);
  background-color: var(--ds-bg-neutral-subtle);
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
  gap: var(--ds-spacing-sm);
  width: max-content;
}

.ds-module-banner__run {
  display: flex;
  align-items: stretch;
  gap: var(--ds-spacing-sm);
}

.ds-module-banner__run > :deep(*) {
  flex: none;
}
</style>
