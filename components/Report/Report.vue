<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
import { Button } from '../Button'
import { Logo } from '../Logo'

/**
 * A document that prints (ADR-0089, track A) — the DDS first, the dMRV, Scan
 * and Baseline reports after: sober, as the official DDS is. A head of one
 * line (the mark, the status), the title and its reference, then the
 * product's sections (`ReportSection`, numbered by themselves), its
 * `DetailRow`s, `Table`s and figures, and at the end the declaration and its
 * signature (`ReportSignature`, Annex II).
 *
 * **On paper**: A4 portrait, 20mm margins, its own page type (`ds-report`), so
 * printing anything else in the product is left as it was. From the second
 * page a running head (title · reference, date) and, on every page, a running
 * foot (`footer`, « Page n sur N ») — CSS margin boxes, Chrome 131 and later;
 * Firefox and Safari print the document without them. A section's title never
 * ends a page, a table row and the signature are never cut, a table's head
 * repeats, and a badge keeps its colour (`print-color-adjust`).
 *
 * **On screen**: the sheet on the page's recessed ground, A4 wide, and a
 * « Imprimer » button above it that the paper does not show. The PDF is the
 * browser's (« Enregistrer en PDF », tagged since Chrome 85) or the product's
 * server's — not the package's.
 *
 * Print it from a view that holds it alone, or hide the app around it in
 * print: the page prints what it holds.
 */
interface Props {
  title: string
  /** « DDR-SN-2026-0142 » — written under the title and in the running head. */
  reference?: string
  /** « 27 oct. 2026 » — written under the title and in the running head. */
  date?: string
  /** The document's state — « Déposée ». */
  status?: string
  statusTone?: BadgeTone
  /** The running foot's start — « Tolbi · généré le 27 oct. 2026 à 10:42 ». */
  footer?: string
  pageLabel?: string
  ofLabel?: string
  printLabel?: string
  /** The « Imprimer » button above the sheet. */
  printable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reference: undefined,
  date: undefined,
  status: undefined,
  statusTone: 'success',
  footer: undefined,
  pageLabel: 'Page',
  ofLabel: 'sur',
  printLabel: 'Imprimer',
  printable: true,
})

const meta = computed(() => [props.reference, props.date].filter(Boolean).join(' · '))

/*
  The paper's margin boxes read custom properties from the document's root —
  not from this component — so the running texts are set there while the
  report is shown, as CSS strings, and taken back when it goes.
*/
const VARS = ['--ds-report-head', '--ds-report-date', '--ds-report-foot', '--ds-report-folio'] as const
const cssString = (s: string | undefined) => (s ? `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : '')

function setRunning() {
  const root = document.documentElement.style
  const values: Record<(typeof VARS)[number], string> = {
    '--ds-report-head': cssString([props.title, props.reference].filter(Boolean).join(' · ')),
    '--ds-report-date': cssString(props.date),
    '--ds-report-foot': cssString(props.footer),
    '--ds-report-folio': `${cssString(props.pageLabel)} " " counter(page) " " ${cssString(props.ofLabel)} " " counter(pages)`,
  }
  for (const name of VARS) {
    if (values[name]) root.setProperty(name, values[name])
    else root.removeProperty(name)
  }
}

onMounted(setRunning)
watch(() => [props.title, props.reference, props.date, props.footer, props.pageLabel, props.ofLabel], setRunning)
onBeforeUnmount(() => { for (const name of VARS) document.documentElement.style.removeProperty(name) })

function print() {
  window.print()
}
</script>

<template>
  <div class="ds-report-preview">
    <div v-if="printable" class="ds-report__toolbar">
      <Button variant="secondary-gray" size="sm" icon-leading="printer" :label="printLabel" @click="print" />
    </div>
    <article class="ds-report">
      <header class="ds-report__head">
        <div class="ds-report__brand">
          <Logo :size="24" />
          <Badge v-if="status" :label="status" :tone="statusTone" size="md" class="ds-report__status" />
        </div>
        <div class="ds-report__heading">
          <h1 class="ds-report__title">{{ title }}</h1>
          <p v-if="meta" class="ds-report__meta">{{ meta }}</p>
        </div>
        <slot name="summary" />
      </header>
      <slot />
    </article>
  </div>
</template>

<style scoped>
/* On screen: the sheet on the recessed ground, A4 wide. */
.ds-report-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xl);
  padding: var(--ds-spacing-3xl);
  background: var(--ds-bg-neutral);
}

.ds-report__toolbar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  max-width: 210mm;
}

.ds-report {
  counter-reset: ds-report-section;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-3xl);
  box-sizing: border-box;
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
  color: var(--ds-text-default);
  font: var(--ds-font-body-md);
}

.ds-report__head {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
}

.ds-report__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-report__heading {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
}

.ds-report__title {
  margin: 0;
  font: var(--ds-font-heading-md);
  color: var(--ds-text-strong);
}

.ds-report__meta {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* On paper, the sheet is the paper: no ground, frame, shadow or screen margin
   (the page's 20mm take their place), and no button. Here, in the scoped
   block, or the screen's own rules would outweigh them. */
@media print {
  .ds-report-preview {
    display: block;
    padding: 0;
    background: none;
  }

  .ds-report__toolbar {
    display: none;
  }

  .ds-report {
    max-width: none;
    min-height: 0;
    padding: 0;
    border: 0;
    box-shadow: none;
  }
}
</style>

<style>
/*
  On paper (ADR-0089). Unscoped: `@page` and the margin boxes have no element
  to scope, and the rules below must reach the product's tables and figures
  inside the report. The page type keeps every other printout as it was.
*/
.ds-report {
  page: ds-report;
}

@page ds-report {
  size: A4;
  margin: 20mm;

  @top-left {
    content: var(--ds-report-head);
    font: var(--ds-font-label-xs);
    color: var(--ds-text-subtle);
  }

  @top-right {
    content: var(--ds-report-date);
    font: var(--ds-font-label-xs);
    color: var(--ds-text-subtle);
  }

  @bottom-left {
    content: var(--ds-report-foot);
    font: var(--ds-font-label-xs);
    color: var(--ds-text-subtle);
  }

  @bottom-right {
    content: var(--ds-report-folio);
    font: var(--ds-font-label-xs);
    color: var(--ds-text-subtle);
  }
}

/* The first page carries the document's own head: no running head over it. */
@page ds-report:first {
  @top-left { content: none; }
  @top-right { content: none; }
}

@media print {
  /* A status prints in its colour; browsers drop backgrounds otherwise. */
  .ds-report .ds-badge {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .ds-report tr,
  .ds-report figure,
  .ds-report img,
  .ds-report-signature {
    break-inside: avoid;
  }

  .ds-report thead {
    display: table-header-group;
  }

  /* On paper a cut cell is a lost figure: a table's text wraps instead of
     ending in an ellipsis. Three classes, to outweigh the table's own two. */
  .ds-report .ds-table .ds-table__cell-text,
  .ds-report .ds-table .ds-table__th-label,
  .ds-report .ds-table .ds-table__th {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
  }
}
</style>
