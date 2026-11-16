<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { mapGlyphSvg, type MapGlyphFamily } from './mapGlyph'

/**
 * A map glyph drawn in the document (ADR-0192) — the very drawing the map
 * shows (`mapGlyphSvg`), for a legend's mark. Internal: `ChartLegend` and
 * `MapLegend` render it. Drawn once mounted, where its colour resolves — a
 * `var()` the legend sets on its subtree included — and decorative.
 */
interface Props {
  family: MapGlyphFamily
  color: string
  size: number
}

const props = defineProps<Props>()
const root = ref<HTMLElement | null>(null)
const svg = ref('')
const draw = () => {
  if (root.value) svg.value = mapGlyphSvg({ family: props.family, color: props.color, size: props.size }, root.value)
}
onMounted(draw)
watch(() => [props.family, props.color, props.size], draw)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- the package's own drawing (mapGlyph.ts) -->
  <span ref="root" class="ds-map-glyph-mark" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true" v-html="svg" />
</template>

<style scoped>
.ds-map-glyph-mark {
  display: inline-block;
  flex: none;
  line-height: 0;
}

.ds-map-glyph-mark > :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
