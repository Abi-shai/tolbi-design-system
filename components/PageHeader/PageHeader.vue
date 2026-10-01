<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * The head of a page: its name — the page's one `<h1>` — an optional line
 * under it, and the page's own actions on the right.
 *
 * The product posted that `<h1>` by hand on 52 pages, in three sizes and in
 * Bold, none of them on a role (ADR-0003 has no 700). There is one now, and it
 * is `heading-lg` (20/28): set in Figma on the component itself, which settled
 * what the frame (`heading-xl`) and the request (`heading-lg`) disagreed on —
 * and the roles' descriptions were rewritten to match (ADR-0051).
 *
 * **No outer margin.** The space under the header — 24px in the frame — belongs
 * to the page, which spaces all its blocks the same way (ADR-0047's column, one
 * level down).
 */
interface Props {
  /** The page's name. Rendered as its `<h1>`, so a page has exactly one. */
  title:     string
  /**
   * One line under the title. `#subtitle` replaces it when the line needs a
   * link or a word in bold — the prop is the slot's fallback content
   * (ADR-0040's `snapshot`, ADR-0046's `panelTitle`). Neither: no line, and no
   * gap either.
   */
  subtitle?: string
}

const props = defineProps<Props>()
const slots = useSlots()

const hasSubtitle = computed(() => !!props.subtitle || !!slots.subtitle)
</script>

<template>
  <!--
    A `<div>`, not a `<header>`: outside a sectioning element a `<header>` is the
    page's banner landmark, and the navigation bar is already that.
  -->
  <div class="ds-page-header">
    <div class="ds-page-header__text">
      <h1 class="ds-page-header__title">{{ title }}</h1>
      <p v-if="hasSubtitle" class="ds-page-header__subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>

    <!-- The page's buttons. Their size and variant are the page's: the header
         only places them. -->
    <div v-if="$slots.actions" class="ds-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
/*
  One row, and it **wraps** rather than squeezes: when the text would get
  narrower than `20rem`, the actions drop under it, left-aligned, the same
  `spacing-xl` away. Intrinsic, not a breakpoint — the catalogue has none
  (ADR-0020) — so it answers to the column the header is put in, not to the
  window.

  The actions are centred on the text, as the frame draws them: with a one-line
  subtitle, level with the middle of the 52px block.
*/
.ds-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-xl);
}

/*
  `flex: 1 1 0` so the text takes the row and the actions sit at its end, and a
  `min-width` that is the wrap's threshold: the narrowest the text may get before
  the actions leave the row. `min(…, 100%)` so a column narrower than the
  threshold itself does not overflow.
*/
.ds-page-header__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  flex: 1 1 0;
  min-width: min(20rem, 100%);
}

.ds-page-header__title {
  margin: 0;
  font: var(--ds-font-heading-lg);
  color: var(--ds-text-strong);
  overflow-wrap: break-word;
}

/*
  `45rem` is the frame's 720px, and a ceiling rather than a size (ADR-0031): the
  line wraps there instead of running the width of the page.
*/
.ds-page-header__subtitle {
  margin: 0;
  max-width: 45rem;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

.ds-page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  flex: none;
}
</style>
