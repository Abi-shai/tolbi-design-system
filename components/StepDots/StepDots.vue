<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** How many steps the flow has. */
  total: number
  /** The step being shown, 1-based — the same convention as `ProgressSteps.currentStep`. */
  current?: number
  /**
   * Accessible name for the indicator. It names the widget, not its value:
   * `aria-valuetext` always carries the position ("Étape 2 sur 4").
   *
   * Pass `null` when a visible label already says where the user is — the
   * indicator is then hidden from assistive tech rather than announced twice.
   */
  ariaLabel?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  current: 1,
  ariaLabel: 'Progression',
})

/* Out-of-range input is a caller bug, but a dot still has to be lit. */
const steps = computed(() => Math.max(1, Math.floor(props.total)))
const active = computed(() => Math.min(Math.max(1, Math.floor(props.current)), steps.value))

const hidden = computed(() => props.ariaLabel === null)
const valueText = computed(() => `Étape ${active.value} sur ${steps.value}`)
</script>

<template>
  <div
    class="ds-step-dots"
    :role="hidden ? undefined : 'progressbar'"
    :aria-hidden="hidden ? true : undefined"
    :aria-label="ariaLabel ?? undefined"
    :aria-valuemin="hidden ? undefined : 1"
    :aria-valuemax="hidden ? undefined : steps"
    :aria-valuenow="hidden ? undefined : active"
    :aria-valuetext="hidden ? undefined : valueText"
  >
    <span
      v-for="step in steps"
      :key="step"
      class="ds-step-dots__dot"
      :class="{ 'ds-step-dots__dot--current': step === active }"
    />
  </div>
</template>

<style scoped>
/*
 * Figma Sprint 18 — frame 168:39 ("Pagination") on `01 · Bienvenue`: 6px dots,
 * a 22px pill on the current step, 6px apart.
 *
 * The two widths are own-values — off every ramp, expressing nothing but this
 * component's geometry — so they are private component tokens (ADR-0010). The
 * gap IS on the spacing ramp and therefore takes the token.
 *
 * Deliberately one size. Figma publishes one, and a ramp nobody consumes is the
 * `blur-*` mistake again (ADR-0015).
 */
.ds-step-dots {
  --step-dots-size: 6px;
  --step-dots-current-width: 22px;

  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
}

/*
 * Colour. The current dot is a brand fill, and `bg-brand-solid` is brand-600 —
 * the exact value Figma bound.
 *
 * The unreached dots are inert channel markers, which is the job
 * `bg-neutral-strong` names ("inert control channels: slider track, scrollbar
 * thumb") and the token `ProgressSteps` already uses for an incomplete step's
 * dot. Figma drew gray-light-200, which the bg ramp skips — it runs 50 → 100 →
 * 300, because ADR-0009 exposes 200 only as `border-subtle`, and a filled shape
 * is a background, not a border. So `bg-neutral-strong` is the role's token and
 * it is also the more legible of the two: 1.47:1 on `bg-default` against
 * Figma's 1.18:1. One step darker, on purpose.
 *
 * Motion. Nothing slides — each dot owns its width and the current one grows in
 * place — so this is not a `useSlidingIndicator` case (ADR-0024): no measured
 * indicator, and no transition withheld until first paint, because there is no
 * mount jump to prevent. The timing is still the catalogue's decision for a
 * selection changing width between aligned siblings: `Tabs` and `ButtonGroup`
 * both animate their indicator at `duration-enter` with `easing-in-out`.
 */
.ds-step-dots__dot {
  display: block;
  flex-shrink: 0;
  width: var(--step-dots-size);
  height: var(--step-dots-size);
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-bg-neutral-strong);
  transition:
    width            var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    background-color var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-step-dots__dot--current {
  width: var(--step-dots-current-width);
  background-color: var(--ds-bg-brand-solid);
}
</style>
