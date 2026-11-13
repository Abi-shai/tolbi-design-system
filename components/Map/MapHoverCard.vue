<script setup lang="ts">
import { Badge, type BadgeTone } from '../Badge'

/**
 * What the pointer is over, on a map (ADR-0168) — Google Weather Lab's hover:
 * a small card beside the object, its code and status, one line of facts, one
 * figure. It is **not** `MapTooltip`: that one is opened by a click and stays,
 * a dialog with its close; this one follows the pointer and holds nothing —
 * no close, no focus, no pointer (`pointer-events: none`), so it never sits
 * between the pointer and the map. The click keeps its own rule: it opens the
 * object's sheet (`MapPanel lg closable`), which is where a reader and a
 * keyboard get the same facts — so the card is `aria-hidden`.
 *
 * The engine places it, beside the object (ADR-0006, as `MapTooltip`). It
 * arrives after a short wait (`duration-quick`) so a pointer crossing the map
 * does not light every parcel on its way, then fades in; under reduced motion
 * it appears at once. On a touch screen there is no hover: it shows nothing.
 */
interface Props {
  /** The object's code — « P-2041 ». */
  title: string
  /** Its status in a word, on a neutral or toned `Badge`. */
  status?: string
  statusTone?: BadgeTone
  /** One line of facts — « Koné Affoué · 18,5 ha ». */
  meta?: string
  /** One figure, and its unit. */
  value?: string
  unit?: string
}

withDefaults(defineProps<Props>(), {
  status: undefined,
  statusTone: 'neutral',
  meta: undefined,
  value: undefined,
  unit: undefined,
})
</script>

<template>
  <div class="ds-map-hover-card" aria-hidden="true">
    <div class="ds-map-hover-card__head">
      <span class="ds-map-hover-card__title">{{ title }}</span>
      <Badge v-if="status" :label="status" :tone="statusTone" size="sm" class="ds-map-hover-card__status" />
    </div>
    <p v-if="meta" class="ds-map-hover-card__meta">{{ meta }}</p>
    <p v-if="value" class="ds-map-hover-card__value">
      {{ value }}<span v-if="unit" class="ds-map-hover-card__unit">{{ unit }}</span>
    </p>
  </div>
</template>

<style scoped>
/* MapTooltip's surface, at its content's width up to the same 280px. */
.ds-map-hover-card {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  box-sizing: border-box;
  width: max-content;
  max-width: 17.5rem;
  padding: var(--ds-spacing-lg);
  border-radius: var(--ds-radius-surface-lg);
  /* Pilot glass (ADR-0172): the map shows through as colour. */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-control);
  -webkit-backdrop-filter: var(--ds-backdrop-map-control);
  backdrop-filter: var(--ds-backdrop-map-control);
  /* On the darkest imagery behind it, text-subtlest fails (3.0–4.3:1); subtle holds (4.6). */
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-control-radius: var(--ds-radius-pill);
  --on-glass-rule: color-mix(in srgb, var(--ds-text-strong) 8%, transparent);
  /* A rim of light on top, a wide soft shadow (ADR-0173). */
  box-shadow: var(--ds-elevation-map-glass);
  pointer-events: none;
  animation: ds-map-hover-card-in var(--ds-motion-duration-quick) var(--ds-motion-easing-default)
    var(--ds-motion-duration-quick) both;
}

@keyframes ds-map-hover-card-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ds-map-hover-card {
    animation: none;
  }
}

/* No hover on a touch screen: nothing to follow. */
@media (hover: none) {
  .ds-map-hover-card {
    display: none;
  }
}

.ds-map-hover-card__head {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-map-hover-card__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-map-hover-card__status {
  flex: none;
}

.ds-map-hover-card__meta {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-map-hover-card__value {
  margin: 0;
  font: var(--ds-font-heading-sm);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

.ds-map-hover-card__unit {
  margin-inline-start: var(--ds-spacing-xs);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* Less transparency asked for: the same surface, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-hover-card {
    border-color: var(--ds-border-subtle);
    background: var(--ds-bg-default);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    --on-glass-raised: var(--ds-bg-default);
    --on-glass-sunk: var(--ds-bg-neutral-subtle);
  }
}
</style>
