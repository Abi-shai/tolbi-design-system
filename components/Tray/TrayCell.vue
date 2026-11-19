<script setup lang="ts">
import { Badge, type BadgeTone } from '../Badge'

/**
 * One thing on a tray, in its own white cell (ADR-0231): a mark (`#media` — a
 * `ModuleIcon logo` at **40**, ADR-0232), the name in `label-lg-strong`, an optional `Badge`
 * after it (« Bas » — the word and its tone, **no dot**: the owner, ADR-0233), and a **value at the cell's end** in
 * `label-lg-strong` with tabular figures — a balance, a count. `bg-default`,
 * `radius-surface`, `spacing-sm` / `spacing-lg` in — the mark grew to 40 and the
 * padding gave, so the cell stays near its 48 (52). In a `TrayGrid`.
 *
 * The name gives first (one line, cut); the badge and the value keep their
 * width. The mark is decorative: the name names the thing.
 */
interface Props {
  label: string
  /** At the cell's end — « 12 450 ». */
  value?: string
  /** After the name — « Bas ». */
  badge?: string
  badgeTone?: BadgeTone
}

withDefaults(defineProps<Props>(), { value: undefined, badge: undefined, badgeTone: 'neutral' })

defineSlots<{
  /** The thing's mark — a `ModuleIcon` at 40. Decorative. */
  media?: () => unknown
}>()
</script>

<template>
  <li class="ds-tray-cell">
    <span v-if="$slots.media" class="ds-tray-cell__media" aria-hidden="true"><slot name="media" /></span>
    <span class="ds-tray-cell__label">{{ label }}</span>
    <Badge v-if="badge" :label="badge" :tone="badgeTone" size="sm" class="ds-tray-cell__badge" />
    <span v-if="value" class="ds-tray-cell__value">{{ value }}</span>
  </li>
</template>

<style scoped>
.ds-tray-cell {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  min-width: 0;
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg);
  border-radius: var(--ds-radius-surface);
  background-color: var(--ds-bg-default);
}

.ds-tray-cell__media {
  display: inline-flex;
  flex: none;
}

.ds-tray-cell__label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-tray-cell__badge {
  flex: none;
}

.ds-tray-cell__value {
  flex: none;
  font: var(--ds-font-label-lg-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
  white-space: nowrap;
}
</style>
