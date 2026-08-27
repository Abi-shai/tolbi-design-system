<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(true)
function toggle() { visible.value = !visible.value }
</script>

<template>
  <div class="root">
    <div class="header">
      <div>
        <h3 class="title">Entrée / Sortie asymétriques</h3>
        <p class="subtitle">L'interface fait de la place à l'arrivée. Elle s'écarte efficacement au départ.</p>
      </div>
      <button class="play-btn" @click="toggle">{{ visible ? 'Masquer' : 'Afficher' }}</button>
    </div>

    <div class="timing-row">
      <span class="timing timing--enter">↓ Entrée — 200ms easing-out</span>
      <span class="timing timing--exit">↑ Sortie — 150ms easing-in</span>
    </div>

    <div class="stage">
      <Transition name="card">
        <div v-if="visible" class="card">
          <div class="card__icon">✓</div>
          <div class="card__content">
            <div class="card__title">Analyse disponible</div>
            <div class="card__body">Imagerie satellite chargée. 3 parcelles à vérifier.</div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.root {
  font-family: var(--ds-typography-font-family-poppins, 'Poppins', sans-serif);
  max-width: 480px;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title {
  margin: 0 0 4px;
  font-family: var(--ds-typography-font-family-poppins, 'Poppins', sans-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-semantic-text-primary, #101828);
}

.subtitle {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--ds-semantic-text-tertiary, #475467);
}

.play-btn {
  padding: 8px 16px;
  background: var(--ds-semantic-bg-brand-solid, #056033);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--ds-typography-font-family-poppins, 'Poppins', sans-serif);
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

.play-btn:hover { background: var(--ds-semantic-bg-brand-solid-hover, #044B28); }

.timing-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.timing {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.timing--enter {
  background: var(--ds-semantic-bg-brand-primary, #E6F0EB);
  color: var(--ds-semantic-text-brand-primary, #032C18);
}

.timing--exit {
  background: var(--ds-semantic-bg-secondary, #F9FAFB);
  color: var(--ds-semantic-text-secondary, #344054);
  border: 1px solid var(--ds-semantic-border-secondary, #EAECF0);
}

.stage {
  min-height: 80px;
}

.card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--ds-semantic-bg-primary, #fff);
  border: 1px solid var(--ds-semantic-border-secondary, #EAECF0);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
}

.card__icon {
  width: 28px;
  height: 28px;
  background: var(--ds-semantic-bg-brand-primary, #E6F0EB);
  color: var(--ds-semantic-fg-brand-primary, #056033);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.card__title {
  font-family: var(--ds-typography-font-family-poppins, 'Poppins', sans-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-semantic-text-primary, #101828);
  margin-bottom: 2px;
}

.card__body {
  font-size: 0.8125rem;
  color: var(--ds-semantic-text-tertiary, #475467);
}

/* ── Transition ──────────────────────────────────────────────────── */
.card-enter-active {
  transition:
    opacity var(--ds-motion-duration-enter, 200ms) var(--ds-motion-easing-out, cubic-bezier(0, 0, 0.2, 1)),
    transform var(--ds-motion-duration-enter, 200ms) var(--ds-motion-easing-out, cubic-bezier(0, 0, 0.2, 1));
}

.card-leave-active {
  transition:
    opacity var(--ds-motion-duration-moderate, 150ms) var(--ds-motion-easing-in, cubic-bezier(0.4, 0, 1, 1)),
    transform var(--ds-motion-duration-moderate, 150ms) var(--ds-motion-easing-in, cubic-bezier(0.4, 0, 1, 1));
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
