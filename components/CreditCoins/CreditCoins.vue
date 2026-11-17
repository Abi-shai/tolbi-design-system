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
 */
interface Props {
  size?: ArtworkSize | (number & {})
}

const props = withDefaults(defineProps<Props>(), { size: 56 })

const width = computed(() => Math.round((props.size * 64) / 56 * 100) / 100)
</script>

<template>
  <img :src="coinsSrc" alt="" class="ds-credit-coins" :width="width" :height="size" />
</template>

<style scoped>
.ds-credit-coins {
  display: block;
  flex: none;
}
</style>
