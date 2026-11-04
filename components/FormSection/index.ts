/*
  `FormSection` is `SectionCard` (ADR-0097): the same titled block, named for the
  form it was first drawn in (ADR-0094). Kept as an alias so 0.82's name holds.
*/
export { default as FormSection } from '../SectionCard/SectionCard.vue'
export { default as FormLayout } from './FormLayout.vue'
export type { SectionCardHeadingLevel as FormSectionHeadingLevel } from '../SectionCard/SectionCard.vue'
