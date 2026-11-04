<script setup lang="ts">
import { Card } from '../Card'

export type SectionCardHeadingLevel = 2 | 3 | 4 | 5 | 6

/**
 * A titled block: a title, an optional sentence, then its content (ADR-0097).
 *
 * It was `FormSection` (ADR-0094) — a part of a form. The ARR panel drew the
 * same object around figures and a chart: a title, a sentence, content on the
 * sunk ground. Two components for one object is the drift ADR-0001 exists to
 * stop, so it is one, named for what it is; `FormSection` stays as its alias.
 * Two words, because a component named `Section` is the HTML element's name.
 *
 * A heading, not a `<fieldset>`: some screen readers read a legend before every
 * control it holds (W3C WAI), so « Informations du commerçant » around five
 * unrelated fields would be heard five times. Fields that ARE related — several
 * controls under one label — already have their group: `FormField group`.
 *
 * The surface is `Card sunk`, rendered rather than redrawn (ADR-0001), and it
 * is not a prop: one surface was drawn and validated.
 */
interface Props {
  title: string
  /** One sentence under the title. `#description` takes over when it must carry a link. */
  description?: string
  /** The title's level in the page's outline — 3 inside a panel titled in `h2`. */
  headingLevel?: SectionCardHeadingLevel
}

withDefaults(defineProps<Props>(), {
  headingLevel: 3,
})

const slots = defineSlots<{
  default?: () => unknown
  /** Phrasing content: it sits in a `<p>`. */
  description?: () => unknown
  /** At the head's end, on the title's line — a `Badge` (« 7× plus vite »), a `HelpIcon`, a link. */
  actions?: () => unknown
}>()
</script>

<template>
  <Card variant="sunk" padding="none" class="ds-section-card">
    <div class="ds-section-card__inner">
      <div class="ds-section-card__head">
        <div class="ds-section-card__heading">
          <component :is="`h${headingLevel}`" class="ds-section-card__title">{{ title }}</component>
          <p v-if="slots.description || description" class="ds-section-card__description">
            <slot name="description">{{ description }}</slot>
          </p>
        </div>
        <div v-if="slots.actions" class="ds-section-card__actions">
          <slot name="actions" />
        </div>
      </div>
      <div class="ds-section-card__body">
        <slot />
      </div>
    </div>
  </Card>
</template>

<style scoped>
/*
  Track A of the spacing benchmark (19 systems, median field gap 16): one step
  per level — 16 between children, 20 under the head and around the content.
  The 24 between blocks is not here: it belongs to whatever stacks them
  (`FormLayout` in a form), because a block sits beside lone fields too, and a
  margin on it would space it from its siblings but not them from each other.
*/
.ds-section-card__inner {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-2xl);
  padding: var(--ds-spacing-2xl);
  min-width: 0;
}

/* The actions sit on the title's line, centred on it — a badge beside a heading. */
.ds-section-card__head {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

/* Title and sentence read as one head: 4px, the closest step. */
.ds-section-card__heading {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
}

.ds-section-card__title {
  margin: 0;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
}

.ds-section-card__description {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-default);
}

.ds-section-card__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: var(--ds-line-height-label-lg-strong);
}

.ds-section-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  min-width: 0;
}
</style>
