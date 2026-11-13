<script setup lang="ts">
import { Badge } from '../Badge'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'
import { ProjectGlyph, type ProjectGlyphKind, type ProjectGlyphStatus } from '../ProjectGlyph'
import { Skeleton } from '../Skeleton'

/** One project on one line (ADR-0166). */
export interface ProjectListItem {
  id: string | number
  title: string
  /** Where the project lives. Given, the row is a real `<a>` (ADR-0164's contract). */
  href?: string
  /** The module it belongs to: its drawing and its name, on the second line. */
  module: ModuleName
  /** The module's name as the product says it, when it differs from `module`. */
  moduleLabel?: string
  /** The project's drawing (ADR-0107). `zone` by default; no `status` is a planned project. The drawing carries the status: no badge says it again. */
  glyph?: { kind?: ProjectGlyphKind; status?: ProjectGlyphStatus }
  /** Already written by the product — « 20 juin », the year only when it is not this one. */
  date?: string
  /** A word beside the name — « Projet démo ». */
  badge?: string
}

/**
 * A short list of projects, each on one line — the home page's latest six,
 * every module together (ADR-0166). Not `ProjectCard`: a card counts and
 * measures, which a module's list needs and a home page does not. The model is
 * Google's Drive widget: a picture, a name, one line under it, no figures.
 */
interface Props {
  items?: ProjectListItem[]
  loading?: boolean
  /** How many placeholder rows while loading — the page size the product asks for. */
  loadingRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  loading: false,
  loadingRows: 6,
})

const emit = defineEmits<{
  /** A plain click on a row — with the click, so a router can take a link over. Never with ⌘/Ctrl/Shift/Alt on a link. */
  select: [item: ProjectListItem, event: MouseEvent]
}>()

function onSelect(item: ProjectListItem, event: MouseEvent) {
  /* A modified click on a link is the browser's: a tab, a window (ADR-0165). */
  if (item.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return
  emit('select', item, event)
}
</script>

<template>
  <div v-if="loading || items.length" class="ds-project-list" :aria-busy="loading || undefined">
    <ul class="ds-project-list__list">
      <template v-if="loading">
        <li v-for="n in loadingRows" :key="`skeleton-${n}`" class="ds-project-list__row" aria-hidden="true">
          <Skeleton variant="rect" width="3.5rem" height="3.5rem" />
          <span class="ds-project-list__text ds-project-list__text--skeleton">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="35%" />
          </span>
        </li>
      </template>

      <li v-for="item in items" v-else :key="item.id">
        <component
          :is="item.href ? 'a' : 'button'"
          class="ds-project-list__row ds-project-list__row--link"
          :href="item.href"
          :type="item.href ? undefined : 'button'"
          @click="onSelect(item, $event)"
        >
          <!-- The project's picture, as a document's type in Drive — decorative: the name says which. -->
          <span class="ds-project-list__picture">
            <ProjectGlyph :kind="item.glyph?.kind ?? 'zone'" :status="item.glyph?.status" :seed="item.id" :size="40" />
          </span>
          <span class="ds-project-list__text">
            <span class="ds-project-list__head">
              <span class="ds-project-list__name">{{ item.title }}</span>
              <Badge v-if="item.badge" :label="item.badge" tone="neutral" size="sm" class="ds-project-list__badge" />
              <span v-if="item.date" class="ds-project-list__date">{{ item.date }}</span>
            </span>
            <span class="ds-project-list__meta">
              <ModuleIcon :module="item.module" variant="illustration" :size="16" :aria-label="null" />
              <span class="ds-project-list__module">{{ item.moduleLabel ?? item.module }}</span>
            </span>
          </span>
        </component>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/*
  The Drive widget's frame (ADR-0166): a recessed ground, the list laid on it
  as a surface. The frame is a surface that holds a surface, so it takes the
  step past the surface's own corner (`radius-surface-lg`, minted here).
*/
.ds-project-list {
  box-sizing: border-box;
  width: 100%;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface-lg);
  background: var(--ds-bg-neutral-subtle);
}

/* Two columns on a desktop, one when the room runs out. */
.ds-project-list__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
  gap: var(--ds-spacing-xs) var(--ds-spacing-md);
  margin: 0;
  padding: var(--ds-spacing-md);
  list-style: none;
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
}

.ds-project-list__row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xl);
  width: 100%;
  min-width: 0;
  padding: var(--ds-spacing-md);
  border: 0;
  border-radius: var(--ds-radius-surface);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  text-decoration: none;
}

.ds-project-list__row--link {
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-project-list__row--link:hover {
  background: var(--ds-bg-hover);
}

.ds-project-list__row--link:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

@media (prefers-reduced-motion: reduce) {
  .ds-project-list__row--link {
    transition: none;
  }
}

.ds-project-list__picture {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-neutral);
}

.ds-project-list__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  min-width: 0;
}

.ds-project-list__text--skeleton {
  gap: var(--ds-spacing-sm);
}

/* The name gives first: neither the badge nor the date ever leaves the line. */
.ds-project-list__head {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-project-list__name {
  min-width: 0;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-project-list__badge {
  flex-shrink: 0;
}

/* At the line's end, level with the name rather than the row's middle. */
.ds-project-list__date {
  flex-shrink: 0;
  margin-inline-start: auto;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

.ds-project-list__meta {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  min-width: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

.ds-project-list__module {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
