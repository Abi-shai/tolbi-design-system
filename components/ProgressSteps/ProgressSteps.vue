<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export interface ProgressStep {
  title: string
  description?: string
  icon?: IconName
}

export type ProgressStepsType = 'icon' | 'featured-icon'
export type ProgressStepsSize = 'sm' | 'md' | 'lg'

type StepStatus = 'complete' | 'current' | 'incomplete'

interface Props {
  steps: ProgressStep[]
  currentStep: number
  type?: ProgressStepsType
  size?: ProgressStepsSize
}

const props = withDefaults(defineProps<Props>(), {
  type: 'icon',
  size: 'md',
})

function stepStatus(i: number): StepStatus {
  if (i < props.currentStep - 1) return 'complete'
  if (i === props.currentStep - 1) return 'current'
  return 'incomplete'
}

const checkSize = computed(() => {
  if (props.size === 'lg') return 20
  if (props.size === 'md') return 16
  return 12
})
</script>

<template>
  <div :class="['ds-steps', `ds-steps--${type}`, `ds-steps--${size}`]">
    <div
      v-for="(step, i) in steps"
      :key="i"
      class="ds-steps__step"
      :class="[
        `ds-steps__step--${size}`,
        type === 'featured-icon' ? `ds-steps__step--${stepStatus(i)}` : '',
      ]"
    >
      <!-- Left: icon + connector -->
      <div class="ds-steps__connector-wrap">
        <!-- Featured icon type -->
        <div v-if="type === 'featured-icon'" class="ds-steps__featured-icon">
          <Icon v-if="step.icon" :name="step.icon" :size="20" />
        </div>

        <!-- Icon type -->
        <div
          v-else
          class="ds-steps__icon"
          :class="[`ds-steps__icon--${size}`, `ds-steps__icon--${stepStatus(i)}`]"
        >
          <Icon
            v-if="stepStatus(i) === 'complete'"
            name="check"
            :size="checkSize"
            class="ds-steps__check"
          />
          <span v-else class="ds-steps__dot" />
        </div>

        <!-- Connector line (omitted on last step) -->
        <div
          v-if="i < steps.length - 1"
          class="ds-steps__line"
          :class="type === 'icon' && stepStatus(i) === 'complete' ? 'ds-steps__line--complete' : ''"
        />
      </div>

      <!-- Right: text -->
      <div
        class="ds-steps__text"
        :class="[
          `ds-steps__text--${size}`,
          type === 'icon' ? `ds-steps__text--${stepStatus(i)}` : '',
        ]"
      >
        <span class="ds-steps__title">{{ step.title }}</span>
        <span v-if="step.description" class="ds-steps__description">{{ step.description }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
.ds-steps {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ── Step row ──────────────────────────────────────────────────────── */
.ds-steps__step {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.ds-steps--sm .ds-steps__step  { gap: var(--ds-spacing-lg); }
.ds-steps--md .ds-steps__step,
.ds-steps--lg .ds-steps__step  { gap: var(--ds-spacing-xl); }

/* Opacity states — featured-icon type only */
.ds-steps--featured-icon .ds-steps__step--complete,
.ds-steps--featured-icon .ds-steps__step--incomplete {
  opacity: 0.6;
}

/* ── Connector wrap ────────────────────────────────────────────────── */
.ds-steps__connector-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xs);
  align-self: stretch;
  flex-shrink: 0;
  padding-bottom: var(--ds-spacing-xs);
}

/* ── Featured icon box ─────────────────────────────────────────────── */
.ds-steps__featured-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  box-shadow: var(--ds-elevation-control);
  background-color: var(--ds-bg-default);
  flex-shrink: 0;
  color: var(--ds-text-default);
}

/* ── Icon circle ───────────────────────────────────────────────────── */
.ds-steps__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
  overflow: hidden;
}

.ds-steps__icon--sm { width: 24px; height: 24px; }
.ds-steps__icon--md { width: 32px; height: 32px; }
.ds-steps__icon--lg { width: 40px; height: 40px; }

.ds-steps__icon--complete {
  background-color: var(--ds-bg-brand-solid);
}

.ds-steps__icon--current {
  background-color: var(--ds-bg-brand-solid);
  box-shadow: var(--ds-focus-ring-brand);
  overflow: visible;
}

.ds-steps__icon--incomplete {
  background-color: var(--ds-bg-disabled);
  border: var(--ds-border-width-strong) solid var(--ds-border-subtle);
}

/* ── Check icon (complete) ─────────────────────────────────────────── */
.ds-steps__check {
  color: white;
}

/* ── Status dot (current / incomplete) ────────────────────────────── */
.ds-steps__dot {
  display: block;
  flex-shrink: 0;
  border-radius: var(--ds-radius-pill);
}

.ds-steps__icon--sm .ds-steps__dot  { width: 8px;  height: 8px; }
.ds-steps__icon--md .ds-steps__dot  { width: 10px; height: 10px; }
.ds-steps__icon--lg .ds-steps__dot  { width: 12px; height: 12px; }

.ds-steps__icon--current    .ds-steps__dot { background-color: var(--ds-text-on-brand-solid); }
.ds-steps__icon--incomplete .ds-steps__dot { background-color: var(--ds-bg-neutral-strong); }

/* ── Connector line ────────────────────────────────────────────────── */
.ds-steps__line {
  flex: 1 0 0;
  width: 2px;
  min-height: 1px;
  background-color: var(--ds-border-subtle);
  border-radius: 2px;
}

.ds-steps__line--complete {
  background-color: var(--ds-border-brand-solid);
}

/* ── Text block ────────────────────────────────────────────────────── */
.ds-steps__text {
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Size: bottom padding and font size */
.ds-steps__text--sm {
  font: var(--ds-font-label-lg);
  padding-bottom: var(--ds-spacing-3xl);
}

.ds-steps__text--md,
.ds-steps__text--lg {
  font: var(--ds-font-label-xl);
  padding-bottom: var(--ds-spacing-4xl);
}

/* Top padding per type × size */
.ds-steps--icon.ds-steps--sm  .ds-steps__text { padding-top: var(--ds-spacing-xxs); }
.ds-steps--icon.ds-steps--md  .ds-steps__text { padding-top: var(--ds-spacing-xs); }
.ds-steps--icon.ds-steps--lg  .ds-steps__text { padding-top: var(--ds-spacing-sm); }
.ds-steps--featured-icon.ds-steps--sm .ds-steps__text { padding-top: var(--ds-spacing-xs); }

/* ── Title ─────────────────────────────────────────────────────────── */
.ds-steps__title {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg-strong);
  color: var(--ds-text-default);
}

/* ── Description ───────────────────────────────────────────────────── */
.ds-steps__description {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-body-md);
  color: var(--ds-text-subtle);
}

/* ── Current step text (icon type) ────────────────────────────────── */
.ds-steps--icon .ds-steps__text--current .ds-steps__title {
  color: var(--ds-text-on-brand-subtle);
}

.ds-steps--icon .ds-steps__text--current .ds-steps__description {
  color: var(--ds-text-brand);
}
</style>
