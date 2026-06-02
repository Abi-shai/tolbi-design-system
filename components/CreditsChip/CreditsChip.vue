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
      <span class="ds-credits-chip__avatar-wrap">
        <img :src="creditsIconSrc" alt="" class="ds-credits-chip__avatar-img" />
        <span class="ds-credits-chip__avatar-border" aria-hidden="true" />
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
      <Icon name="arrow-right" :size="17" aria-hidden="true" />
    </button>
  </div>

  <!-- État normal (good) : badge jaune seul -->
  <div v-else class="ds-credits-chip__badge ds-credits-chip__badge--good">
    <span class="ds-credits-chip__avatar-wrap">
      <img :src="creditsIconSrc" alt="" class="ds-credits-chip__avatar-img" />
      <span class="ds-credits-chip__avatar-border" aria-hidden="true" />
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
  gap: 8px;
  border-radius: var(--ds-radius-full);
  padding: 4px 12px 4px 10px;
  flex-shrink: 0;
}

/* Bon état : fond warning-50 */
.ds-credits-chip__badge--good {
  background: var(--ds-color-warning-50, #fffaeb);
}

/* État critique : fond error-50 */
.ds-credits-chip__badge--error {
  background: var(--ds-semantic-bg-error-primary, #fef3f2);
}

/* ── Outer (critique) ─────────────────────────────────────────────── */
.ds-credits-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.ds-credits-chip--critical {
  border: 1.083px solid var(--ds-color-error-700, #b42318);
  border-radius: var(--ds-radius-full);
  padding: 6px 12px 6px 6px;
  gap: 8px;
  background: var(--ds-semantic-bg-primary);
}

/* ── Mini avatar ──────────────────────────────────────────────────── */
.ds-credits-chip__avatar-wrap {
  position: relative;
  width: 17.331px;
  height: 17.331px;
  border-radius: var(--ds-radius-full);
  overflow: hidden;
  flex-shrink: 0;
}

.ds-credits-chip__avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--ds-radius-full);
  pointer-events: none;
}

.ds-credits-chip__avatar-border {
  position: absolute;
  inset: 0;
  border-radius: var(--ds-radius-full);
  border: 0.361px solid rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

/* ── Content (good) : flex gap-4px ───────────────────────────────── */
.ds-credits-chip__content {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
}

.ds-credits-chip__label {
  font-family: var(--ds-typography-font-family-inter);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-secondary);
}

/* ── Texte inline (critical) ──────────────────────────────────────── */
.ds-credits-chip__text--inline {
  margin: 0;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
}

/* ── Count (nombre de crédits) ────────────────────────────────────── */
.ds-credits-chip__count {
  font-size: 1rem;
  line-height: 1.5rem;
}

.ds-credits-chip__count--good {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 700;
  color: var(--ds-color-brand-700, #044b28);
}

.ds-credits-chip__count--error {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 700;
  color: var(--ds-semantic-fg-error-primary, #d92d20);
}

/* ── CTA "Contacter sales" ────────────────────────────────────────── */
.ds-credits-chip__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--ds-semantic-fg-error-primary, #d92d20);
  white-space: nowrap;
  transition: opacity 0.15s ease;
}

.ds-credits-chip__cta:hover {
  opacity: 0.8;
}
</style>
