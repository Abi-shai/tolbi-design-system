<script setup lang="ts">
export type TooltipArrow =
  | 'none'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'left'
  | 'right'

interface Props {
  title:           string
  supportingText?: string
  arrow?:          TooltipArrow
}

withDefaults(defineProps<Props>(), { arrow: 'none' })
</script>

<template>
  <div
    class="ds-tooltip"
    :class="[`ds-tooltip--${arrow}`, { 'ds-tooltip--rich': !!supportingText }]"
  >
    <!-- ▲ top-center (au-dessus du contenu) -->
    <div v-if="arrow === 'top-center'" class="ds-tooltip__arrow ds-tooltip__arrow--top" />

    <!-- ◀ left (à gauche du contenu) -->
    <div v-if="arrow === 'left'" class="ds-tooltip__arrow ds-tooltip__arrow--left" />

    <!-- Contenu -->
    <div class="ds-tooltip__content">
      <div v-if="supportingText" class="ds-tooltip__text-group">
        <p class="ds-tooltip__title">{{ title }}</p>
        <p class="ds-tooltip__supporting">{{ supportingText }}</p>
      </div>
      <p v-else class="ds-tooltip__title ds-tooltip__title--single">{{ title }}</p>
    </div>

    <!-- ▶ right (à droite du contenu) -->
    <div v-if="arrow === 'right'" class="ds-tooltip__arrow ds-tooltip__arrow--right" />

    <!-- ▼ bottom-* (sous le contenu) -->
    <div
      v-if="arrow === 'bottom-center' || arrow === 'bottom-left' || arrow === 'bottom-right'"
      class="ds-tooltip__arrow ds-tooltip__arrow--bottom"
      :class="`ds-tooltip__arrow--${arrow}`"
    />
  </div>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-tooltip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  /* shadow-lg */
  filter: drop-shadow(0px 4px 6px rgba(16, 24, 40, 0.03))
          drop-shadow(0px 12px 16px rgba(16, 24, 40, 0.08));
}

/* Largeur fixe sur le wrapper (box-sizing: border-box côté Figma) */
.ds-tooltip--rich {
  width: 320px;
}

.ds-tooltip--left,
.ds-tooltip--right  { flex-direction: row; align-items: center; }
.ds-tooltip--bottom-left  { align-items: flex-start; }
.ds-tooltip--bottom-right { align-items: flex-end; }

/* ── Contenu ──────────────────────────────────────────────────────── */
.ds-tooltip__content {
  background: #0c111d;
  border-radius: var(--ds-radius-md);
  width: 100%;
  box-sizing: border-box;
}

/* Simple : py-8px px-12px */
.ds-tooltip:not(.ds-tooltip--rich) .ds-tooltip__content {
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
}

/* Rich : p-12px */
.ds-tooltip--rich .ds-tooltip__content {
  padding: var(--ds-spacing-lg);
}

/* ── Textes ───────────────────────────────────────────────────────── */
.ds-tooltip__text-group {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
}

.ds-tooltip__title {
  margin: 0;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.125rem;
  color: #ffffff;
}

.ds-tooltip__title--single {
  white-space: nowrap;
  text-align: center;
}

.ds-tooltip__supporting {
  margin: 0;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem;
  color: #d0d5dd;
}

/* ── Flèches CSS ──────────────────────────────────────────────────── */
.ds-tooltip__arrow { flex-shrink: 0; }

/* ▼ Bottom — 16px large × 6px haut */
.ds-tooltip__arrow--bottom {
  width: 0;
  height: 0;
  border-left:  8px solid transparent;
  border-right: 8px solid transparent;
  border-top:   6px solid #0c111d;
}

.ds-tooltip__arrow--bottom-left  { align-self: flex-start; margin-left: 12px; }
.ds-tooltip__arrow--bottom-right { align-self: flex-end;   margin-right: 12px; }

/* ▲ Top center — 16px large × 6px haut */
.ds-tooltip__arrow--top {
  width: 0;
  height: 0;
  border-left:   8px solid transparent;
  border-right:  8px solid transparent;
  border-bottom: 6px solid #0c111d;
}

/* ◀ Left — 6px large × 16px haut */
.ds-tooltip__arrow--left {
  width: 0;
  height: 0;
  border-top:    8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right:  6px solid #0c111d;
}

/* ▶ Right — 6px large × 16px haut */
.ds-tooltip__arrow--right {
  width: 0;
  height: 0;
  border-top:    8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left:   6px solid #0c111d;
}
</style>
