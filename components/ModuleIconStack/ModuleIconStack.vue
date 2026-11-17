<script setup lang="ts">
import { computed } from 'vue'
import type { ArtworkSize } from '../artwork-size'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'

/**
 * A user's modules, said by their logos laid over one another (ADR-0208) —
 * « Se former » on the home page: the guides are those of *your* modules.
 * `AvatarGroup`'s shape for modules: each logo overlaps the one before by a
 * quarter of its size, the first on top, two at most by default.
 *
 * A logo's tile is a 30 % tint, nearly transparent, so an overlapped logo would
 * show through the one above it. Each logo therefore stands on a **cut-out**:
 * a fill of the ground it sits on, at the tile's own corner (14.2 of 48), and a
 * ring of that ground around it, a twelfth of the size (2px at 24, 1.5 at 18)
 * — the plate's edge, not a border. The ground is read from `--on-plate-ground`, which a plate hands down (an
 * `ActionListItem`'s, at rest and under the pointer alike); elsewhere it is
 * `bg-default`.
 *
 * Decorative: the logos are what the words beside them are about. No `+N` —
 * past `max`, the rest are not drawn; it is an illustration, not a count.
 */
interface Props {
  modules: ModuleName[]
  /** How many logos are drawn, the first ones. */
  max?: number
  /** Each logo's box (ADR-0043). */
  size?: ArtworkSize | (number & {})
}

const props = withDefaults(defineProps<Props>(), { max: 2, size: 24 })

const shown = computed(() => props.modules.slice(0, props.max))
</script>

<template>
  <span class="ds-module-icon-stack" :style="{ '--module-stack-size': `${size}px` }" aria-hidden="true">
    <span v-for="(module, i) in shown" :key="module" class="ds-module-icon-stack__item" :style="{ zIndex: shown.length - i }">
      <ModuleIcon :module="module" variant="logo" :size="size" :aria-label="null" />
    </span>
  </span>
</template>

<style scoped>
.ds-module-icon-stack {
  display: inline-flex;
  align-items: center;
  isolation: isolate;
}

/* The cut-out: the ground's fill under the logo and its ring around it, at the
   tile's corner (14.207 / 48 of the box). */
.ds-module-icon-stack__item {
  position: relative;
  display: inline-flex;
  border-radius: calc(var(--module-stack-size) * 0.296);
  background: var(--on-plate-ground, var(--ds-bg-default));
  /* The ring scales with the logo, as the overlap and the corner do (ADR-0209):
     2px at 24, 1.5 at 18 — a fixed 2px would eat a ninth of a small logo. */
  box-shadow: 0 0 0 calc(var(--module-stack-size) / 12) var(--on-plate-ground, var(--ds-bg-default));
}

.ds-module-icon-stack__item + .ds-module-icon-stack__item {
  margin-inline-start: calc(var(--module-stack-size) / -4);
}
</style>
