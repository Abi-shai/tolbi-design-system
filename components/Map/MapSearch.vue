<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
import { Icon, type IconName } from '../Icon'
import { InputField } from '../InputField'
import { Scrollbar } from '../Scrollbar'

/**
 * What the tools column's « Rechercher » opens (ADR-0171): a field, and under
 * it the results **grouped by kind** — « Parcelles », « Producteurs »,
 * « Lieux » — the groups and their order the product's, who knows its objects
 * and does the geocoding. A row is a glyph (`#media`, or an icon on a tile), a
 * name, a line of facts and an optional `Badge`.
 *
 * The keyboard is a combobox's (APG): the focus stays in the field, ↓ ↑ move
 * through the rows of every group, Enter chooses the one lit, and a pointer
 * chooses too. Choosing emits `select` — the product selects the object (its
 * sheet, its pin); the search does not clear itself.
 */
export interface MapSearchItem {
  value: string | number
  label: string
  /** One line of facts — « Koné Affoué · Lot 2023 ». */
  meta?: string
  /** A glyph on a tile, when `#media` draws nothing for this row. */
  icon?: IconName
  badge?: string
  badgeTone?: BadgeTone
}

export interface MapSearchGroup {
  label: string
  items: MapSearchItem[]
}

interface Props {
  groups?: MapSearchGroup[]
  placeholder?: string
  /** The field's name, for a reader. */
  label?: string
  /** Said when something is typed and nothing is found. */
  emptyLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  groups: () => [],
  placeholder: 'Parcelle, producteur, lieu…',
  label: 'Rechercher sur la carte',
  emptyLabel: 'Aucun résultat',
})

const emit = defineEmits<{ select: [item: MapSearchItem] }>()

defineSlots<{
  /** The row's glyph — a `ProjectGlyph` for a parcel. Without it, `icon` on a tile. */
  media?: (props: { item: MapSearchItem }) => unknown
}>()

const query = defineModel<string>({ default: '' })

const id = useId()
const listId = `${id}-list`
const optionId = (g: number, i: number) => `${id}-${g}-${i}`

const shown = computed(() => props.groups.filter((g) => g.items.length))
const flat = computed(() => shown.value.flatMap((g, gi) => g.items.map((item, ii) => ({ item, gi, ii }))))
const active = ref(-1)
const activeId = computed(() => {
  const a = flat.value[active.value]
  return a ? optionId(a.gi, a.ii) : undefined
})
const indexOf = (gi: number, ii: number) => flat.value.findIndex((f) => f.gi === gi && f.ii === ii)

/* New results, the first one lit: Enter chooses what the eye reads first. */
watch(flat, (now) => (active.value = now.length ? 0 : -1), { immediate: true })

const list = ref<HTMLElement | null>(null)
function lit(to: number) {
  active.value = to
  const a = flat.value[to]
  if (a) list.value?.querySelector(`#${CSS.escape(optionId(a.gi, a.ii))}`)?.scrollIntoView({ block: 'nearest' })
}

function onKey(e: KeyboardEvent) {
  const n = flat.value.length
  if (!n) return
  if (e.key === 'ArrowDown') lit((active.value + 1) % n)
  else if (e.key === 'ArrowUp') lit((active.value - 1 + n) % n)
  else if (e.key === 'Enter' && active.value >= 0) emit('select', flat.value[active.value].item)
  else return
  e.preventDefault()
}
</script>

<template>
  <div class="ds-map-search">
    <div class="ds-map-search__field">
      <InputField
        v-model="query"
        type="search"
        size="sm"
        :placeholder="placeholder"
        :aria-label="label"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="flat.length > 0"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        data-autofocus
        @keydown="onKey"
      >
        <template #icon-leading><Icon name="search" :size="16" /></template>
      </InputField>
    </div>

    <Scrollbar v-if="shown.length" shadows class="ds-map-search__scroll">
      <div :id="listId" ref="list" class="ds-map-search__list" role="listbox" :aria-label="label">
        <div v-for="(g, gi) in shown" :key="g.label" class="ds-map-search__group" role="group" :aria-labelledby="`${id}-g${gi}`">
          <div :id="`${id}-g${gi}`" class="ds-map-search__group-label">{{ g.label }}</div>
          <div
            v-for="(item, ii) in g.items"
            :id="optionId(gi, ii)"
            :key="item.value"
            class="ds-map-search__row"
            :class="{ 'ds-map-search__row--active': indexOf(gi, ii) === active }"
            role="option"
            :aria-selected="indexOf(gi, ii) === active"
            @pointerenter="active = indexOf(gi, ii)"
            @mousedown.prevent
            @click="emit('select', item)"
          >
            <span class="ds-map-search__media" aria-hidden="true">
              <slot name="media" :item="item">
                <span class="ds-map-search__tile"><Icon :name="item.icon ?? 'map-pin'" :size="16" /></span>
              </slot>
            </span>
            <span class="ds-map-search__text">
              <span class="ds-map-search__name">{{ item.label }}</span>
              <span v-if="item.meta" class="ds-map-search__meta">{{ item.meta }}</span>
            </span>
            <Badge v-if="item.badge" :label="item.badge" :tone="item.badgeTone ?? 'neutral'" size="sm" class="ds-map-search__badge" />
          </div>
        </div>
      </div>
    </Scrollbar>

    <p v-else-if="query.trim()" class="ds-map-search__empty" role="status">{{ emptyLabel }}</p>
  </div>
</template>

<style scoped>
/* 20rem: a name, its facts and a badge on one row. */
.ds-map-search {
  display: flex;
  flex-direction: column;
  width: 20rem;
  max-width: 100%;
  min-height: 0;
}

.ds-map-search__field {
  flex: none;
  padding: var(--ds-spacing-md);
}

.ds-map-search__scroll {
  flex: 1 1 auto;
  min-height: 0;
  border-top: var(--ds-border-width-default) solid var(--on-glass-rule, var(--ds-border-subtle));
}

.ds-map-search__list {
  display: flex;
  flex-direction: column;
  padding-block: var(--ds-spacing-xs) var(--ds-spacing-md);
}

.ds-map-search__group + .ds-map-search__group {
  margin-top: var(--ds-spacing-xs);
  padding-top: var(--ds-spacing-xs);
  border-top: var(--ds-border-width-default) solid var(--on-glass-rule, var(--ds-border-subtle));
}

/* A group is titled as `SideNavGroup` titles a run of rows: `label-md`, `text-subtle`. */
.ds-map-search__group-label {
  padding: var(--ds-spacing-md) var(--ds-spacing-lg) var(--ds-spacing-xs);
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}

.ds-map-search__row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  margin-inline: var(--ds-spacing-xs);
  padding: var(--ds-spacing-sm) var(--ds-spacing-md);
  border-radius: var(--on-glass-row-radius, var(--ds-radius-control));
  cursor: pointer;
}

.ds-map-search__row--active {
  background: var(--ds-bg-hover);
}

.ds-map-search__media {
  flex: none;
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
}

.ds-map-search__media > :deep(*) {
  max-width: 100%;
  max-height: 100%;
}

.ds-map-search__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--ds-radius-control);
  background: var(--on-glass-tile, var(--ds-bg-neutral-subtle));
  color: var(--ds-text-subtle);
}

.ds-map-search__text {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.ds-map-search__name,
.ds-map-search__meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-map-search__name {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-map-search__meta {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-map-search__badge {
  flex: none;
}

.ds-map-search__empty {
  margin: 0;
  padding: 0 var(--ds-spacing-lg) var(--ds-spacing-lg);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}
</style>
