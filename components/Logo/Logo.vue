<script setup lang="ts">
import { computed } from 'vue'
import type { ArtworkSize } from '../artwork-size'
import logoNavSrc    from './logo-nav.svg'
import logoIconInner from './logo-icon-inner.svg'
import logoIconOuter from './logo-icon-outer.svg'
import logoWordmark  from './logo-wordmark.svg'

export type LogoVariant = 'default' | 'nav'

interface Props {
  alt?:     string
  variant?: LogoVariant
  /**
   * **The mark's height in px**, on the shared artwork ladder — the same one
   * `ModuleIcon` takes, so the brand mark and a module mark at the same step
   * are the same height. That is the whole reason the ladder is shared: this
   * component used to say `sm | md` and the other a free number, so "both at
   * the same size" was not expressible.
   *
   * No escape hatch, unlike `Icon` and `ModuleIcon`. A glyph inside a control
   * is an ornament and may go off-scale (ADR-0004); a brand lockup never is.
   */
  size?:    ArtworkSize
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Tolbi',
  variant: 'default',
  size: 32,
})

/** One value in, every dimension out — the ratios live in the stylesheet. */
const sizeVar = computed(() => ({ '--logo-size': `${props.size}px` }))
</script>

<template>
  <!-- Variante nav : wordmark compact sur fond sombre -->
  <img
    v-if="variant === 'nav'"
    class="ds-logo ds-logo--nav"
    :style="sizeVar"
    :src="logoNavSrc"
    :alt="alt"
  />

  <!-- Variante default : icon + wordmark -->
  <div v-else class="ds-logo" :style="sizeVar">
    <div class="ds-logo__icon">
      <img class="ds-logo__icon-inner" :src="logoIconInner" alt="" />
      <img class="ds-logo__icon-outer" :src="logoIconOuter" alt="" />
    </div>
    <img class="ds-logo__wordmark" :src="logoWordmark" :alt="alt" />
  </div>
</template>

<style scoped>
.ds-logo {
  /*
    The lockup is **one drawing**, so every dimension is a ratio of the one
    number the prop carries — the mark's height. Measured off Figma's 32px
    lockup, which is the one the file draws; at `size="32"` each line below
    resolves to within 0.002px of the hand-written value it replaces.

    The ratios stay in local custom properties because the geometry is artwork,
    not layout rhythm — one block to read and one to change (ADR-0010, a local
    property that switches a variant is not a token).

    What is gone is the old `sm` rung. Its **mark** was already a uniform 75% of
    `md`, but its wordmark was tightened a further 4.8% for a constrained bar —
    46.578×20 where the ratio gives 48.91×21. A ladder with one hand-tuned rung
    is not a ladder, and the tightening had no consumer left: the bar moved to
    the 32px lockup (ADR-0042) and `sm` was the only caller it ever had.
  */
  --logo-icon-w:     calc(var(--logo-size) * 0.9516);
  --logo-inner-top:  calc(var(--logo-size) * 0.2256);
  --logo-inner-left: calc(var(--logo-size) * 0.2269);
  --logo-inner-w:    calc(var(--logo-size) * 0.6047);
  --logo-inner-h:    calc(var(--logo-size) * 0.6788);
  --logo-wordmark-h: calc(var(--logo-size) * 0.875);
  --logo-wordmark-w: calc(var(--logo-size) * 2.0378);

  /*
    The gap scales with the lockup and leaves the spacing ramp doing it (5px at
    `size="20"`). That is right rather than sloppy: this is the lockup's own
    proportion — artwork, not rhythm — and at 32 it still computes to exactly
    the 8px `spacing-md` it has always been.
  */
  --logo-gap:        calc(var(--logo-size) * 0.25);

  display: inline-flex;
  align-items: center;
  gap: var(--logo-gap);
}

.ds-logo__icon {
  position: relative;
  width: var(--logo-icon-w);
  height: var(--logo-size);
  flex-shrink: 0;
}

.ds-logo__icon-inner {
  position: absolute;
  display: block;
  top: var(--logo-inner-top);
  left: var(--logo-inner-left);
  width: var(--logo-inner-w);
  height: var(--logo-inner-h);
}

.ds-logo__icon-outer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.ds-logo__wordmark {
  display: block;
  flex-shrink: 0;
  width: var(--logo-wordmark-w);
  height: var(--logo-wordmark-h);
}

/*
  The wordmark alone. It has no mark, so `size` cannot be a mark height here —
  it takes the height the lockup would have given the wordmark at that step,
  which makes `nav` at 32 pixel-identical to `default`'s wordmark at 32.

  Last, so `display: block` beats `.ds-logo`'s `inline-flex` — the two classes
  are the same specificity and this element carries both.
*/
.ds-logo--nav {
  display: block;
  height: var(--logo-wordmark-h);
  width: calc(var(--logo-wordmark-h) * 2.3289);
  flex-shrink: 0;
}
</style>
