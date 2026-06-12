<script setup lang="ts">
import { ref } from 'vue'

const durations = [
  { name: 'instant',    value: '50ms',  desc: 'États press, focus rings' },
  { name: 'quick',      value: '100ms', desc: 'Feedback immédiat' },
  { name: 'moderate',   value: '150ms', desc: "Changements d'état" },
  { name: 'enter',      value: '200ms', desc: 'Éléments qui entrent' },
  { name: 'process',    value: '300ms', desc: 'Données en mouvement' },
  { name: 'considered', value: '400ms', desc: 'Surfaces lourdes' },
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
        <h3 class="title">Échelle de durée</h3>
        <p class="subtitle">Même easing (<code>easing-out</code>), durées différentes.</p>
      </div>
      <button class="play-btn" @click="play">Jouer ▶</button>
    </div>

    <div v-for="d in durations" :key="d.name" class="row">
      <div class="row__meta">
        <code class="row__token">--ds-motion-duration-{{ d.name }}</code>
        <div class="row__info">
          <span class="row__value">{{ d.value }}</span>
          <span class="row__desc"> — {{ d.desc }}</span>
        </div>
      </div>
      <div class="track">
        <div
          class="bar"
          :class="{ 'bar--active': triggered }"
          :style="transitioning
            ? { transition: `width ${d.value} var(--ds-motion-easing-out, cubic-bezier(0, 0, 0.2, 1))` }
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
  padding: 10px 0;
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

.row__info { font-size: 0.8125rem; }

.row__value {
  font-weight: 600;
  color: var(--ds-semantic-text-secondary, #344054);
}

.row__desc { color: var(--ds-semantic-text-tertiary, #475467); }

.track {
  flex: 1;
  height: 6px;
  background: var(--ds-semantic-bg-tertiary, #F2F4F7);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.bar {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  width: 0%;
  background: var(--ds-semantic-fg-brand-primary, #056033);
  border-radius: 9999px;
}

.bar--active { width: 100%; }
</style>
