<script setup lang="ts">
import { ref } from 'vue'

const easings = [
  { name: 'default', value: 'cubic-bezier(0.25, 0, 0, 1)',  desc: 'Ancré — démarre vite, décélère avec poids' },
  { name: 'in',      value: 'cubic-bezier(0.4, 0, 1, 1)',   desc: "Sortie — accélère et s'écarte" },
  { name: 'out',     value: 'cubic-bezier(0, 0, 0.2, 1)',   desc: 'Entrée — décélère en arrivant' },
  { name: 'in-out',  value: 'cubic-bezier(0.4, 0, 0.2, 1)', desc: 'Spatial — déplacement latéral' },
]

const triggered = ref(false)
const transitioning = ref(false)

function play() {
  triggered.value = false
  transitioning.value = false
  requestAnimationFrame(() => requestAnimationFrame(() => {
    transitioning.value = true
    triggered.value = true
  }))
}
</script>

<template>
  <div class="root">
    <div class="header">
      <div>
        <h3 class="title">Courbes d'accélération</h3>
        <p class="subtitle">Même durée (500ms), easings différents. Observez où la balle accélère ou décélère.</p>
      </div>
      <button class="play-btn" @click="play">Jouer ▶</button>
    </div>

    <div v-for="e in easings" :key="e.name" class="row">
      <div class="row__meta">
        <code class="row__token">--ds-motion-easing-{{ e.name }}</code>
        <div class="row__info">
          <span class="row__label">{{ e.name }}</span>
          <span class="row__value"> {{ e.value }}</span>
        </div>
        <div class="row__desc">{{ e.desc }}</div>
      </div>
      <div class="track">
        <div
          class="dot"
          :class="{ 'dot--moved': triggered }"
          :style="transitioning
            ? { transition: `left 500ms var(--ds-motion-easing-${e.name}, ${e.value})` }
            : { transition: 'none' }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  font-family: var(--ds-typography-font-family-inter, 'Inter', sans-serif);
  max-width: 760px;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ds-semantic-border-secondary, #EAECF0);
}

.row__meta { width: 240px; flex-shrink: 0; }

.row__token {
  display: block;
  font-family: monospace;
  font-size: 0.6875rem;
  background: var(--ds-semantic-bg-brand-primary, #E6F0EB);
  color: var(--ds-semantic-text-brand-primary, #032C18);
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 3px;
}

.row__info { font-size: 0.8125rem; margin-bottom: 2px; }

.row__label {
  font-weight: 600;
  color: var(--ds-semantic-text-secondary, #344054);
}

.row__value {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--ds-semantic-text-tertiary, #475467);
}

.row__desc {
  font-size: 0.75rem;
  color: var(--ds-semantic-text-tertiary, #475467);
}

.track {
  flex: 1;
  height: 20px;
  background: var(--ds-semantic-bg-secondary, #F9FAFB);
  border: 1px solid var(--ds-semantic-border-secondary, #EAECF0);
  border-radius: 9999px;
  position: relative;
  overflow: hidden;
}

.dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--ds-semantic-fg-brand-primary, #056033);
}

.dot--moved { left: calc(100% - 18px); }
</style>
