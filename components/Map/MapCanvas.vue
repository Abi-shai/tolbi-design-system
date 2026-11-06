<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export type MapCanvasBasemap = 'pending' | 'loading' | 'ready'

/**
 * The map's place (ADR-0122): the positioned container a map's overlays sit
 * in, and the ground that holds the engine's place until its basemap is there.
 * The engine is the product's (`#engine`, Mapbox's container) — the system
 * draws the wait around it, never the canvas.
 *
 * The ground is `--ds-map-land`, the TOLBI style's own land: 23 of 32 products
 * hold the canvas with a flat colour, almost always their style's. On it, the
 * engine is **hidden until its basemap is complete** and then fades in whole,
 * over `ambient` — a scene arriving, which nobody watches — instead of painting
 * tile by tile (26 of 30 do; 0 of 30 fade the whole map, and the owner chose
 * the whole). It stays rendered while hidden (opacity, not `display`), or the
 * engine could not measure itself.
 *
 * `basemap` is the one fact it cannot know: `pending` before the style is
 * resolved, `loading` once tiles are on their way, `ready` at the engine's
 * `idle`. A basemap that has not finished **2s after `loading`** is shown
 * anyway (`ceiling`): the fade must not become a second wait. Under reduced
 * motion it is shown without a fade.
 */
interface Props {
  basemap?: MapCanvasBasemap
  /** In ms from `loading`: past it the engine shows, finished or not. */
  ceiling?: number
}

const props = withDefaults(defineProps<Props>(), {
  basemap: 'ready',
  ceiling: 2000,
})

defineSlots<{
  /** The engine's container — Mapbox mounts in it. */
  engine?: () => unknown
  /** What sits on the map: `MapOverlay`s. */
  default?: () => unknown
}>()

const late = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.basemap,
  (b) => {
    clearTimeout(timer)
    late.value = false
    if (b === 'loading') timer = setTimeout(() => { late.value = true }, props.ceiling)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(timer))

const shown = computed(() => props.basemap === 'ready' || late.value)
</script>

<template>
  <div class="ds-map-canvas" :aria-busy="!shown || undefined">
    <div class="ds-map-canvas__engine" :class="{ 'ds-map-canvas__engine--shown': shown }">
      <slot name="engine" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.ds-map-canvas {
  position: relative;
  overflow: hidden;
  background: var(--ds-map-land);
}

.ds-map-canvas__engine {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.ds-map-canvas__engine > :deep(*) {
  width: 100%;
  height: 100%;
}

/* In, and only in: a basemap that leaves (another project) is cut, since the
   next one fades in over the same ground. */
.ds-map-canvas__engine--shown {
  opacity: 1;
  transition: opacity var(--ds-motion-duration-ambient) var(--ds-motion-easing-out);
}

@media (prefers-reduced-motion: reduce) {
  .ds-map-canvas__engine--shown {
    transition: none;
  }
}
</style>
