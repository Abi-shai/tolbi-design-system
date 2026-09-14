<script setup lang="ts">
import logoNavSrc    from './logo-nav.svg'
import logoIconInner from './logo-icon-inner.svg'
import logoIconOuter from './logo-icon-outer.svg'
import logoWordmark  from './logo-wordmark.svg'

export type LogoVariant = 'default' | 'nav'
/**
 * `md` is the full lockup. `sm` is Figma's tightened lockup for constrained
 * spaces — the bar chrome. It is not a uniform scale of `md`: the mark shrinks
 * to 75% and the wordmark to 71.4%, which is the tightening.
 */
export type LogoSize = 'sm' | 'md'

interface Props {
  alt?:     string
  variant?: LogoVariant
  size?:    LogoSize
}

withDefaults(defineProps<Props>(), { alt: 'Tolbi', variant: 'default', size: 'md' })
</script>

<template>
  <!-- Variante nav : wordmark compact sur fond sombre (46.578×20px) -->
  <img
    v-if="variant === 'nav'"
    class="ds-logo ds-logo--nav"
    :src="logoNavSrc"
    :alt="alt"
  />

  <!-- Variante default : icon + wordmark -->
  <div v-else class="ds-logo" :class="`ds-logo--${size}`">
    <div class="ds-logo__icon">
      <img class="ds-logo__icon-inner" :src="logoIconInner" alt="" />
      <img class="ds-logo__icon-outer" :src="logoIconOuter" alt="" />
    </div>
    <img class="ds-logo__wordmark" :src="logoWordmark" :alt="alt" />
  </div>
</template>

<style scoped>
/* Variante nav */
.ds-logo--nav {
  display: block;
  width: 46.578px;
  height: 20px;
  flex-shrink: 0;
}

.ds-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

/*
  The lockup geometry is artwork, not layout rhythm, so it stays in local
  custom properties: a size is one block to read and one block to change
  (ADR-0010 — a local property that switches a variant is not a token).
*/
.ds-logo--md {
  --logo-icon-w:       30.45px;
  --logo-icon-h:       32px;
  --logo-inner-top:    7.22px;
  --logo-inner-left:   7.26px;
  --logo-inner-w:      19.349px;
  --logo-inner-h:      21.722px;
  --logo-wordmark-w:   65.209px;
  --logo-wordmark-h:   28px;
}

.ds-logo--sm {
  --logo-icon-w:       22.837px;
  --logo-icon-h:       24px;
  --logo-inner-top:    5.42px;
  --logo-inner-left:   5.45px;
  --logo-inner-w:      14.512px;
  --logo-inner-h:      16.291px;
  --logo-wordmark-w:   46.578px;
  --logo-wordmark-h:   20px;
}

.ds-logo__icon {
  position: relative;
  width: var(--logo-icon-w);
  height: var(--logo-icon-h);
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
</style>
