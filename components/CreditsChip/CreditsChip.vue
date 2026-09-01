<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import creditsIconSrc from './credits-icon.png'

export type CreditsState   = 'good' | 'low' | 'empty'
export type CreditsContext = 'home' | 'project'

interface Props {
  credits:  number
  state?:   CreditsState
  context?: CreditsContext
}

const props = withDefaults(defineProps<Props>(), {
  state:   'good',
  context: 'home',
})

const emit = defineEmits<{ 'contact-sales': [] }>()

const isGood     = computed(() => props.state === 'good')
const isCritical = computed(() => props.state === 'low' || props.state === 'empty')

const goodLabel = computed(() =>
  props.context === 'home' ? 'crédits disponibles' : 'crédits utilisés dans ce projet'
)
</script>

<template>
  <!-- État critique (low / empty) : outer avec bordure rouge -->
  <div v-if="isCritical" class="ds-credits-chip ds-credits-chip--critical">
    <!-- Badge rouge -->
    <div class="ds-credits-chip__badge ds-credits-chip__badge--error">
      <span class="ds-credits-chip__coin">
        <img :src="creditsIconSrc" alt="" class="ds-credits-chip__coin-img" />
        <span class="ds-credits-chip__coin-ring" aria-hidden="true" />
      </span>
      <!-- Texte inline : "Plus que [N] crédits disponibles" -->
      <p class="ds-credits-chip__text ds-credits-chip__text--inline">
        <span>Plus que </span><strong class="ds-credits-chip__count ds-credits-chip__count--error">{{ credits }}</strong><span> crédits disponibles</span>
      </p>
    </div>

    <!-- Lien "Contacter sales" -->
    <button
      type="button"
      class="ds-credits-chip__cta"
      @click="emit('contact-sales')"
    >
      <span>Contacter sales</span>
      <Icon name="arrow-right" :size="16" aria-hidden="true" />
    </button>
  </div>

  <!-- État normal (good) : badge jaune seul -->
  <div v-else class="ds-credits-chip__badge ds-credits-chip__badge--good">
    <span class="ds-credits-chip__coin">
      <img :src="creditsIconSrc" alt="" class="ds-credits-chip__coin-img" />
      <span class="ds-credits-chip__coin-ring" aria-hidden="true" />
    </span>
    <!-- Content : flex gap-4px entre le count et le label -->
    <span class="ds-credits-chip__content">
      <strong class="ds-credits-chip__count ds-credits-chip__count--good">{{ credits }}</strong>
      <span class="ds-credits-chip__label">{{ goodLabel }}</span>
    </span>
  </div>
</template>

<style scoped>
/* ── Badge partagé ────────────────────────────────────────────────── */
.ds-credits-chip__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  border-radius: var(--ds-radius-pill);
  padding: var(--ds-spacing-xs) var(--ds-spacing-lg) var(--ds-spacing-xs) 10px;
  flex-shrink: 0;
}

/* Bon état : fond warning-50 */
.ds-credits-chip__badge--good {
  background: var(--ds-bg-warning-subtle);
}

/* État critique : fond error-50 */
.ds-credits-chip__badge--error {
  background: var(--ds-bg-error-subtle);
}

/* ── Outer (critique) ─────────────────────────────────────────────── */
.ds-credits-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.ds-credits-chip--critical {
  border: var(--ds-border-width-default) solid var(--ds-border-error-solid);
  border-radius: var(--ds-radius-pill);
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg) var(--ds-spacing-sm) var(--ds-spacing-sm);
  gap: var(--ds-spacing-md);
  background: var(--ds-bg-default);
}

/* ── Credits coin — a currency glyph, not an Avatar (ADR-0016) ────── */
.ds-credits-chip__coin {
  position: relative;
  width: 17.331px;
  height: 17.331px;
  border-radius: var(--ds-radius-pill);
  overflow: hidden;
  flex-shrink: 0;
}

.ds-credits-chip__coin-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--ds-radius-pill);
  pointer-events: none;
}

.ds-credits-chip__coin-ring {
  position: absolute;
  inset: 0;
  border-radius: var(--ds-radius-pill);
  border: var(--ds-border-width-default) solid var(--ds-border-inset);
  pointer-events: none;
}

/* ── Content (good) : flex gap-4px ───────────────────────────────── */
.ds-credits-chip__content {
  display: inline-flex;
  align-items: baseline;
  gap: var(--ds-spacing-xs);
  white-space: nowrap;
}

.ds-credits-chip__label {  font: var(--ds-font-label-xl);
  color: var(--ds-text-default);
}

/* ── Texte inline (critical) ──────────────────────────────────────── */
.ds-credits-chip__text--inline {
  margin: 0;
  font: var(--ds-font-body-lg-emphasis);
  color: var(--ds-text-default);
  white-space: nowrap;
}

/* ── Count (nombre de crédits) ────────────────────────────────────── */
.ds-credits-chip__count {
  font: var(--ds-font-label-xl);
  font-variant-numeric: tabular-nums;
}

.ds-credits-chip__count--good {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg);
  color: var(--ds-text-brand);
}

.ds-credits-chip__count--error {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-xl-strong);
  color: var(--ds-text-error);
}

/* ── CTA "Contacter sales" ────────────────────────────────────────── */
.ds-credits-chip__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font: var(--ds-font-label-xl);
  color: var(--ds-text-error);
  white-space: nowrap;
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-credits-chip__cta:hover {
  opacity: 0.8;
}
</style>
