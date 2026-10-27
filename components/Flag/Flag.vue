<script setup lang="ts">
import { computed } from 'vue'
import { flags, type FlagCode } from './registry'

/**
 * A country's flag (ADR-0085) — a 4:3 box, the shape most country lists use
 * (4 / 7), drawn from country-flag-icons' 3:2 drawings, which are simplified
 * for small sizes, centred and cropped to fit. The set is generated from
 * `scripts/flags.manifest.txt` (`npm run flags`), never hand-written: a code
 * the manifest does not carry is a type error, and at run time an unknown
 * code draws an empty neutral box rather than nothing, so a row keeps its
 * geometry.
 *
 * **Its size is its width**, unlike the artwork ladder's heights (ADR-0043): a
 * flag takes an icon's place on a line, and that place is a width — 20 beside
 * a 16px text, as the glyphs in a field. A hairline (`border-inset`, the
 * avatar's) keeps a white or pale flag's edge on `bg-default`.
 *
 * Decorative by default — the country's name is written beside it. Give it a
 * `label` when it stands alone.
 */
export type FlagSize = 16 | 20 | 24 | 32

interface Props {
  code: FlagCode | (string & {})
  size?: FlagSize
  /** Its name, when nothing beside it says which country it is. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  label: undefined,
})

const flag = computed(() => (flags as Record<string, { viewBox: string; body: string }>)[props.code.toUpperCase()])
const style = computed(() => ({ width: `${props.size}px` }))
</script>

<template>
  <span
    class="ds-flag"
    :class="`ds-flag--${size}`"
    :style="style"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <!-- The drawing is the package's own, generated from the manifest — not user content. -->
    <svg
      v-if="flag"
      class="ds-flag__drawing"
      :viewBox="flag.viewBox"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      v-html="flag.body"
    />
  </span>
</template>

<style scoped>
.ds-flag {
  position: relative;
  display: inline-block;
  flex: none;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  vertical-align: middle;
  border-radius: calc(var(--ds-radius-inner-sm) / 2);
  background: var(--ds-bg-neutral-subtle);
}

/* From 24 up a flag is a mark of its own size, and takes the small mark's full radius. */
.ds-flag--24,
.ds-flag--32 {
  border-radius: var(--ds-radius-inner-sm);
}

/* The avatar's hairline (ADR-0015): a white band stays on the page. */
.ds-flag::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
  pointer-events: none;
}

.ds-flag__drawing {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
