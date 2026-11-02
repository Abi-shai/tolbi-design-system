<script setup lang="ts">
import { Card } from '../Card'

export type FormSectionHeadingLevel = 2 | 3 | 4 | 5 | 6

/**
 * A titled part of a form: a title, an optional sentence, then the fields
 * (ADR-0094). The section cuts the form; it does not relate its fields.
 *
 * A heading, not a `<fieldset>`: some screen readers read a legend before every
 * control it holds (W3C WAI), so « Informations du commerçant » around five
 * unrelated fields would be heard five times. Fields that ARE related — several
 * controls under one label — already have their group: `FormField group`.
 *
 * The surface is `Card sunk`, rendered rather than redrawn (ADR-0001), and it
 * is not a prop: one surface was drawn, validated and has one consumer.
 */
interface Props {
  title: string
  /** One sentence under the title. `#description` takes over when it must carry a link. */
  description?: string
  /** The title's level in the page's outline — 3 inside a panel titled in `h2`. */
  headingLevel?: FormSectionHeadingLevel
}

withDefaults(defineProps<Props>(), {
  headingLevel: 3,
})

const slots = defineSlots<{
  default?: () => unknown
  /** Phrasing content: it sits in a `<p>`. */
  description?: () => unknown
}>()
</script>

<template>
  <Card variant="sunk" padding="none" class="ds-form-section">
    <div class="ds-form-section__inner">
      <div class="ds-form-section__head">
        <component :is="`h${headingLevel}`" class="ds-form-section__title">{{ title }}</component>
        <p v-if="slots.description || description" class="ds-form-section__description">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
      <div class="ds-form-section__body">
        <slot />
      </div>
    </div>
  </Card>
</template>

<style scoped>
/*
  Track A of the spacing benchmark (19 systems, median field gap 16): one step
  per level — 16 between fields, 20 under the head and around the content. The
  24 between sections is not here: it belongs to whatever stacks them
  (`FormLayout`), because a section sits beside lone fields too, and a margin
  on the section would space it from its siblings but not them from each other.
*/
.ds-form-section__inner {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-2xl);
  padding: var(--ds-spacing-2xl);
  min-width: 0;
}

/* Title and sentence read as one head: 4px, the closest step. */
.ds-form-section__head {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
}

.ds-form-section__title {
  margin: 0;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
}

.ds-form-section__description {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-default);
}

.ds-form-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  min-width: 0;
}
</style>
