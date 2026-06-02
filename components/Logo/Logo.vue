<script setup lang="ts">
import logoNavSrc from './logo-nav.svg'

// Asset URLs sourced from Figma — replace with hosted SVG files before production.
const ICON_INNER = 'https://www.figma.com/api/mcp/asset/fdea7f63-a81b-45f8-a462-4bce0d0ad617'
const ICON_OUTER = 'https://www.figma.com/api/mcp/asset/64e34a7d-bb08-4ab2-a58e-237d9fe9e0c9'
const WORDMARK   = 'https://www.figma.com/api/mcp/asset/1b65a47d-8f82-43fd-aad7-13abe10f9f96'

export type LogoVariant = 'default' | 'nav'

interface Props {
  alt?:     string
  variant?: LogoVariant
}

withDefaults(defineProps<Props>(), { alt: 'Tolbi', variant: 'default' })
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
  <div v-else class="ds-logo">
    <div class="ds-logo__icon">
      <img class="ds-logo__icon-inner" :src="ICON_INNER" alt="" />
      <img class="ds-logo__icon-outer" :src="ICON_OUTER" alt="" />
    </div>
    <img class="ds-logo__wordmark" :src="WORDMARK" :alt="alt" />
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
  gap: 8px;
}

.ds-logo__icon {
  position: relative;
  width: 30.45px;
  height: 32px;
  flex-shrink: 0;
}

.ds-logo__icon-inner {
  position: absolute;
  display: block;
  top: 7.22px;
  left: 7.26px;
  width: 19.349px;
  height: 21.722px;
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
  width: 65.209px;
  height: 28px;
}
</style>
