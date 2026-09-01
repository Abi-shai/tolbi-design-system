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
  /* drop-shadow() cannot consume a box-shadow token, so --ds-elevation-overlay
     is restated here geometrically; the colour still comes from a token. */
  filter: drop-shadow(0px 4px 6px color-mix(in srgb, var(--ds-bg-inverse) 3%, transparent))
          drop-shadow(0px 12px 16px color-mix(in srgb, var(--ds-bg-inverse) 8%, transparent));
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
  background: var(--ds-bg-inverse);
  border-radius: var(--ds-radius-control);
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
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-on-inverse);
}

.ds-tooltip__title--single {
  white-space: nowrap;
  text-align: center;
}

.ds-tooltip__supporting {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-on-inverse-subtle);
}

/* ── Flèches CSS ──────────────────────────────────────────────────── */
.ds-tooltip__arrow { flex-shrink: 0; }

/* ▼ Bottom — 16px large × 6px haut */
.ds-tooltip__arrow--bottom {
  width: 0;
  height: 0;
  border-left:  8px solid transparent;
  border-right: 8px solid transparent;
  border-top:   6px solid var(--ds-bg-inverse);
}

.ds-tooltip__arrow--bottom-left  { align-self: flex-start; margin-left: var(--ds-spacing-lg); }
.ds-tooltip__arrow--bottom-right { align-self: flex-end;   margin-right: var(--ds-spacing-lg); }

/* ▲ Top center — 16px large × 6px haut */
.ds-tooltip__arrow--top {
  width: 0;
  height: 0;
  border-left:   8px solid transparent;
  border-right:  8px solid transparent;
  border-bottom: 6px solid var(--ds-bg-inverse);
}

/* ◀ Left — 6px large × 16px haut */
.ds-tooltip__arrow--left {
  width: 0;
  height: 0;
  border-top:    8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right:  6px solid var(--ds-bg-inverse);
}

/* ▶ Right — 6px large × 16px haut */
.ds-tooltip__arrow--right {
  width: 0;
  height: 0;
  border-top:    8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left:   6px solid var(--ds-bg-inverse);
}
</style>
