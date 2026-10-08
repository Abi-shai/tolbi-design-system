<script setup lang="ts">
import { computed } from 'vue'
import { DropdownGroup, DropdownItem } from '../Dropdown'
import { Skeleton } from '../Skeleton'
import {
  HISTORY_GROUPS,
  describe,
  fold,
  type TolbiAiConversation,
  type TolbiAiHistoryLabels,
} from './history'

/**
 * The rows of the head's switcher (ADR-0069) — internal, `TolbiAiPanel`'s
 * own. The project's conversations, the most recent first, under four
 * headings; each one a choice, the current one marked as every list in the
 * catalogue marks it (ADR-0050), dated by the hour, the day or the date.
 */
const props = defineProps<{
  conversations: TolbiAiConversation[]
  current: string | null
  loading: boolean
  query: string
  labels: TolbiAiHistoryLabels
  /** Taken when the list opens, so the times do not move while it is read. */
  now: Date
  locale: string
}>()

const emit = defineEmits<{ select: [id: string] }>()

const dated = computed(() =>
  [...props.conversations]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .map((c) => ({ ...c, ...describe(c.at, props.now, props.locale) })),
)

const groups = computed(() => {
  const q = fold(props.query.trim())
  const found = q ? dated.value.filter((c) => fold(c.title).includes(q)) : dated.value
  return HISTORY_GROUPS.map((key) => ({ key, label: props.labels[key], rows: found.filter((c) => c.group === key) })).filter(
    (g) => g.rows.length,
  )
})

const hint = computed(() => {
  if (!props.conversations.length) return props.labels.empty
  if (!groups.value.length) return props.labels.noMatch.replace('{query}', props.query.trim())
  if (props.conversations.length === 1 && props.conversations[0].id === props.current) return props.labels.alone
  return null
})

const SKELETON_ROWS = ['72%', '56%', '80%', '64%', '48%']
</script>

<template>
  <div v-if="loading" class="ds-tolbi-ai-history__loading" aria-busy="true">
    <div v-for="width in SKELETON_ROWS" :key="width" class="ds-tolbi-ai-history__skeleton">
      <Skeleton :width="width" />
      <Skeleton :width="36" />
    </div>
  </div>

  <template v-else>
    <DropdownGroup v-for="g in groups" :key="g.key" :label="g.label">
      <DropdownItem
        v-for="c in g.rows"
        :key="c.id"
        :label="c.title"
        :meta="c.pending ? labels.pending : c.meta"
        :selected="c.id === current"
        @click="emit('select', c.id)"
      />
    </DropdownGroup>
    <p v-if="hint" class="ds-tolbi-ai-history__hint">{{ hint }}</p>
  </template>
</template>

<style scoped>
/* A sentence in the menu's place: on the rows' text, in the group titles' ink. */
.ds-tolbi-ai-history__hint {
  margin: 0;
  padding: var(--ds-spacing-md) var(--ds-spacing-xl);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-tolbi-ai-history__loading {
  display: flex;
  flex-direction: column;
}

/* A row's height and its text's edges: 40px, `spacing-xl` in. */
.ds-tolbi-ai-history__skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-xl);
  height: 40px;
  padding: 0 var(--ds-spacing-xl);
}
</style>
