<script setup lang="ts">
import { computed } from 'vue'
import type { ArtworkSize } from '../artwork-size'
import coinsSrc from './credit-coins.png'

/**
 * The credits' coins (ADR-0208) — the owner's artwork (Figma `3734:2260`): two
 * lying, one tilted, drawn 64 × 56. It was `CreditCost`'s own image (ADR-0104);
 * « Gérer les crédits » on the home page needs the same coins on a plate, so the
 * drawing stands on its own and `CreditCost` renders it (ADR-0001).
 *
 * **`size` is its height** (ADR-0043: the number is the artwork's height), the
 * width follows the drawing's 64:56. Off-ladder numbers are allowed, as
 * `ModuleIcon`'s are: `CreditCost` draws it at 56, its native height.
 *
 * Decorative, always: what the coins stand for is said by the words beside
 * them — nothing is written in an illustration's place (ADR-0104).
 *
 * **`trim`** (ADR-0231) gives the drawing's own box: the export carries a wide
 * empty margin (27 % above, 27 % below, 22 % on the left, 10 % on the right),
 * which `CreditCost`'s composition is drawn with but which, at 128, set the
 * pile 35px away from the words beside it. The scale does not change — `size`
 * is still the whole image's height, so `trim :size="128"` is the same coins,
 * without the air around them.
 */
interface Props {
  size?: ArtworkSize | (number & {})
  /** The drawing's own box, its empty margin cut away; the coins keep their size. */
  trim?: boolean
}

const props = withDefaults(defineProps<Props>(), { size: 56, trim: false })

const width = computed(() => Math.round((props.size * 64) / 56 * 100) / 100)

/* The ink's box in the export, measured on its alpha (192 × 168 px; ink 42…173 × 46…123). */
const INK = { left: 42 / 192, right: 19 / 192, top: 46 / 168, bottom: 45 / 168 }
const round = (n: number) => Math.round(n * 100) / 100
const trimmed = computed(() => ({
  width: `${round(width.value * (1 - INK.left - INK.right))}px`,
  height: `${round(props.size * (1 - INK.top - INK.bottom))}px`,
}))
const shifted = computed(() => ({
  marginLeft: `${-round(width.value * INK.left)}px`,
  marginTop: `${-round(props.size * INK.top)}px`,
}))
</script>

<template>
  <span v-if="trim" class="ds-credit-coins ds-credit-coins--trim" :style="trimmed" aria-hidden="true">
    <img :src="coinsSrc" alt="" :width="width" :height="size" :style="shifted" />
  </span>
  <img v-else :src="coinsSrc" alt="" class="ds-credit-coins" :width="width" :height="size" />
</template>

<style scoped>
.ds-credit-coins {
  display: block;
  flex: none;
}

/* The drawing's box: the image is laid at its full size and the empty margin
   falls outside a clipping box. */
.ds-credit-coins--trim {
  overflow: hidden;
}

.ds-credit-coins--trim > img {
  display: block;
  max-width: none;
}
</style>
