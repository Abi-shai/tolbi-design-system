<script setup lang="ts">
/**
 * The declaration and its signature (ADR-0089) — Regulation (EU) 2023/1115,
 * Annex II: « Signed for and on behalf of / Date / Name and function /
 * Signature ». None of the ten documents benchmarked carried one, the
 * regulation asks for it. The statement is the default slot; a value left
 * empty is a line to write on, on paper. It is never cut across two pages.
 */
interface Props {
  onBehalfOf?: string
  date?: string
  /** « Awa Diop, responsable conformité ». */
  name?: string
  onBehalfOfLabel?: string
  dateLabel?: string
  nameLabel?: string
  signatureLabel?: string
}

withDefaults(defineProps<Props>(), {
  onBehalfOf: undefined,
  date: undefined,
  name: undefined,
  onBehalfOfLabel: 'Signé pour le compte de',
  dateLabel: 'Date',
  nameLabel: 'Nom et fonction',
  signatureLabel: 'Signature',
})
</script>

<template>
  <div class="ds-report-signature">
    <p v-if="$slots.default" class="ds-report-signature__statement"><slot /></p>
    <dl class="ds-report-signature__fields">
      <div v-for="[label, value] in [[onBehalfOfLabel, onBehalfOf], [dateLabel, date], [nameLabel, name]]" :key="label" class="ds-report-signature__field">
        <dt>{{ label }} :</dt>
        <dd>{{ value }}</dd>
      </div>
      <div class="ds-report-signature__field ds-report-signature__field--sign">
        <dt>{{ signatureLabel }} :</dt>
        <dd />
      </div>
    </dl>
  </div>
</template>

<style scoped>
.ds-report-signature {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  break-inside: avoid;
}

.ds-report-signature__statement {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
}

.ds-report-signature__fields {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  margin: 0;
  padding: var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-inner);
}

.ds-report-signature__field {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-body-sm);
}

.ds-report-signature__field dt {
  flex: none;
  color: var(--ds-text-subtle);
}

/* A value, or a line to write it on. */
.ds-report-signature__field dd {
  flex: 1;
  min-height: 1lh;
  margin: 0;
  color: var(--ds-text-strong);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-report-signature__field--sign dd {
  min-height: calc(3 * 1lh);
}
</style>
