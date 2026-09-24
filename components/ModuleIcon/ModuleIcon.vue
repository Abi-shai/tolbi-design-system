<script setup lang="ts">
import { computed } from 'vue'
import type { ArtworkSize } from '../artwork-size'
import { illustrations, logos, type ModuleName, type ModuleVariant } from './registry'

interface Props {
  module?: ModuleName
  /**
   * `logo` — the artwork on its rounded tile. The semantic value: this is what
   * product surfaces consume (module switcher, nav, cards).
   *
   * `illustration` — the same artwork with no tile. The primitive value: the
   * original drawing the logo is built from. Reach for it when the module is
   * already framed by its own surface, the way a raw colour primitive is only
   * used to define a semantic one.
   */
  variant?: ModuleVariant
  /**
   * **The artwork's box in px**, on the shared ladder — the same one `Logo`
   * takes, so the brand mark and a module mark at the same step are the same
   * height. The drawing is a `viewBox="0 0 48 48"`, so 48 is its native grid
   * and every other step is a clean scale of it.
   *
   * Off-ladder values stay allowed, the way `Icon`'s do and for the same kind
   * of reason — the union would collapse to `number` without the `& {}`:
   *
   * - a **number**, where a surface draws at a size Figma drew and the ladder
   *   does not carry (`ModuleCapsule` at 44 — ADR-0031);
   * - a **CSS length**, where the value must also live in the stylesheet
   *   because a second box has to match it (`ProjectCard`'s
   *   `--project-card-mark`, ADR-0041; `HorizontalNavigation`'s `--hnav-mark`).
   */
  size?: ArtworkSize | (number & {}) | string
  /**
   * Accessible name. Defaults to the module name; pass `null` for artwork that
   * is decorative next to a visible label, which hides it from assistive tech.
   */
  ariaLabel?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  module: 'Carbone',
  variant: 'logo',
  size: 48,
  ariaLabel: undefined,
})

const art = computed(() =>
  props.variant === 'illustration' ? illustrations[props.module] : logos[props.module],
)

const label = computed(() =>
  props.ariaLabel === undefined ? props.module : props.ariaLabel,
)

const sizeStyle = computed(() => {
  const v = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { width: v, height: v }
})
</script>

<template>
  <component
    :is="art"
    class="ds-module-icon"
    :style="sizeStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
  />
</template>

<style scoped>
.ds-module-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
