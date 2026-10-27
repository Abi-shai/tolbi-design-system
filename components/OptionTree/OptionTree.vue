<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, useId, watch } from 'vue'
import { Icon } from '../Icon'
import { InputField } from '../InputField'
import { Tag } from '../Tag'
import { FORM_FIELD_KEY, type FormFieldContext } from '../FormField/context'
import OptionTreeItem from './OptionTreeItem.vue'
import {
  keyOf,
  OPTION_TREE_KEY,
  type OptionTreeNode,
  type OptionTreeSegment,
} from './context'

/**
 * One choice in a hierarchy — a customs code: chapter → heading → subheading
 * (ADR-0081, the DDR's « Ajouter un produit »). Every level is a row: the
 * chevron on the left opens it, the code in a `Tag`, the label, the round mark
 * of the choice at the end. A parent can be chosen too (TRACES lets a
 * declaration stop at the level of Annex I).
 *
 * It is a **tree**, not a group of radios — no design system puts a radio in a
 * tree, because a radio group's arrows choose and a tree's move (APG): ↑ ↓
 * move, → opens then goes in, ← closes then goes out, Home / End, a letter
 * jumps to the next row starting with it, Enter or Space chooses. The round
 * mark is only the choice's sign; `aria-selected` is what is read.
 *
 * Each chapter is a block on `bg-neutral-subtle`; a row rises to `bg-default`
 * under the pointer (on that ground `bg-hover` is the same primitive,
 * ADR-0036) and the chosen one takes the current item's mark (ADR-0050).
 *
 * The search keeps what it finds **with its ancestors**, opened, and underlines
 * the words it found (Ant, Mantine, Chakra); what it finds keeps its own rows.
 * Accents and case do not count. The chosen path stays written above the tree,
 * so what was chosen is said even when its chapter is closed.
 */
interface Props {
  nodes: OptionTreeNode[]
  /** The tree's name. */
  label: string
  /** A search above the tree. */
  searchable?: boolean
  searchPlaceholder?: string
  searchLabel?: string
  noResultsLabel?: string
  /** The words before the chosen path. `null` writes no path. */
  chosenLabel?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  searchPlaceholder: 'Rechercher un code ou un produit…',
  searchLabel: 'Rechercher',
  noResultsLabel: 'Aucun résultat',
  chosenLabel: 'Choisi :',
})

/** The chosen node's value. */
const model = defineModel<string | number | null>({ default: null })
/** The values of the open rows — bind it to keep them, or leave it to the tree. */
const expanded = defineModel<(string | number)[]>('expanded', { default: () => [] })
/** The search's words. */
const query = defineModel<string>('query', { default: '' })

/* The search field is the tree's own: a FormField around the tree names
   nothing it could point at, and must not hand its id to the field. */
provide(FORM_FIELD_KEY, null as unknown as FormFieldContext)

const treeId = `ds-option-tree-${useId()}`

/* ── The hierarchy, indexed ─────────────────────────────────────────── */
interface Entry { node: OptionTreeNode; parent: OptionTreeNode | null }

const index = computed(() => {
  const map = new Map<string, Entry>()
  const walk = (nodes: OptionTreeNode[], parent: OptionTreeNode | null) => {
    for (const node of nodes) {
      map.set(keyOf(node.value), { node, parent })
      if (node.children) walk(node.children, node)
    }
  }
  walk(props.nodes, null)
  return map
})

function ancestors(node: OptionTreeNode): OptionTreeNode[] {
  const chain: OptionTreeNode[] = []
  let parent = index.value.get(keyOf(node.value))?.parent ?? null
  while (parent) {
    chain.unshift(parent)
    parent = index.value.get(keyOf(parent.value))?.parent ?? null
  }
  return chain
}

const selectedNode = computed(() =>
  model.value === null ? null : index.value.get(keyOf(model.value))?.node ?? null,
)

/* ── The search ─────────────────────────────────────────────────────── */
/* « feves » finds « fèves » and « CACAO » finds « Cacao ». The comparison is
   made on the folded text, the underline on the original — folding keeps the
   length of these alphabets' letters, so the positions carry over. */
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const words = computed(() => fold(query.value.trim()))

const hits = (node: OptionTreeNode) =>
  !words.value || fold(node.label).includes(words.value) || fold(node.code ?? '').includes(words.value)

/* What the search shows: a hit, its ancestors and its own rows. Ancestors
   of a hit open by themselves; the hits do not. */
const searched = computed(() => {
  if (!words.value) return null
  const visible = new Set<string>()
  const opened = new Set<string>()
  const visit = (node: OptionTreeNode, underHit: boolean): boolean => {
    const self = hits(node)
    let below = false
    for (const child of node.children ?? []) if (visit(child, underHit || self)) below = true
    if (self || below || underHit) visible.add(keyOf(node.value))
    if (below) opened.add(keyOf(node.value))
    return self || below
  }
  for (const node of props.nodes) visit(node, false)
  return { visible, opened }
})

/* A row the search opened can still be closed while searching; a new search
   starts over. */
const closedWhileSearching = ref(new Set<string>())
watch(words, () => { closedWhileSearching.value = new Set() })

function isVisible(node: OptionTreeNode) {
  return !searched.value || searched.value.visible.has(keyOf(node.value))
}

function isOpen(node: OptionTreeNode) {
  const key = keyOf(node.value)
  if (searched.value?.opened.has(key) && !closedWhileSearching.value.has(key)) return true
  return expanded.value.some(v => keyOf(v) === key)
}

const hasResults = computed(() => props.nodes.some(isVisible))

function segments(label: string): OptionTreeSegment[] {
  if (!words.value) return [{ text: label, hit: false }]
  const folded = fold(label)
  if (folded.length !== label.length) return [{ text: label, hit: false }]
  const out: OptionTreeSegment[] = []
  let from = 0
  let at = folded.indexOf(words.value)
  while (at !== -1) {
    if (at > from) out.push({ text: label.slice(from, at), hit: false })
    out.push({ text: label.slice(at, at + words.value.length), hit: true })
    from = at + words.value.length
    at = folded.indexOf(words.value, from)
  }
  if (from < label.length) out.push({ text: label.slice(from), hit: false })
  return out
}

/* ── Open, close, choose ────────────────────────────────────────────── */
function setOpen(node: OptionTreeNode, next: boolean) {
  const key = keyOf(node.value)
  if (searched.value?.opened.has(key)) {
    const closed = new Set(closedWhileSearching.value)
    if (next) closed.delete(key)
    else closed.add(key)
    closedWhileSearching.value = closed
  }
  const rest = expanded.value.filter(v => keyOf(v) !== key)
  expanded.value = next ? [...rest, node.value] : rest
}

function toggle(node: OptionTreeNode) {
  setOpen(node, !isOpen(node))
}

function select(node: OptionTreeNode) {
  focused.value = keyOf(node.value)
  if (node.disabled) return
  model.value = node.value
}

/* A choice made elsewhere is shown: its chapter opens. */
function reveal(node: OptionTreeNode | null) {
  if (!node) return
  const closed = ancestors(node).filter(a => !isOpen(a))
  if (closed.length) expanded.value = [...expanded.value, ...closed.map(a => a.value)]
}

onMounted(() => reveal(selectedNode.value))
watch(selectedNode, node => reveal(node))

/* ── Focus: one row is in the tab order ─────────────────────────────── */
interface Row { node: OptionTreeNode; parent: OptionTreeNode | null }

/* The rows as the eye reads them — what the arrows walk. */
const rows = computed<Row[]>(() => {
  const out: Row[] = []
  const walk = (nodes: OptionTreeNode[], parent: OptionTreeNode | null) => {
    for (const node of nodes) {
      if (!isVisible(node)) continue
      out.push({ node, parent })
      if (node.children?.length && isOpen(node)) walk(node.children, node)
    }
  }
  walk(props.nodes, null)
  return out
})

const focused = ref<string | null>(null)
const elements = new Map<string, HTMLElement>()

const tabbable = computed(() => {
  const shown = new Set(rows.value.map(r => keyOf(r.node.value)))
  if (focused.value && shown.has(focused.value)) return focused.value
  const chosen = model.value === null ? null : keyOf(model.value)
  if (chosen && shown.has(chosen)) return chosen
  return rows.value[0] ? keyOf(rows.value[0].node.value) : null
})

function register(node: OptionTreeNode, el: HTMLElement | null) {
  if (el) elements.set(keyOf(node.value), el)
  else elements.delete(keyOf(node.value))
}

async function focusRow(row: Row | undefined) {
  if (!row) return
  focused.value = keyOf(row.node.value)
  await nextTick()
  elements.get(focused.value)?.focus()
}

function onKeydown(event: KeyboardEvent) {
  const item = (event.target as HTMLElement).closest('[role="treeitem"]')
  if (!item) return
  const at = rows.value.findIndex(r => elements.get(keyOf(r.node.value)) === item)
  const row = rows.value[at]
  if (!row) return
  const { node } = row
  const parent = Boolean(node.children?.length)

  switch (event.key) {
    case 'ArrowDown': focusRow(rows.value[at + 1]); break
    case 'ArrowUp': focusRow(rows.value[at - 1]); break
    case 'Home': focusRow(rows.value[0]); break
    case 'End': focusRow(rows.value[rows.value.length - 1]); break
    case 'ArrowRight':
      if (!parent) break
      if (!isOpen(node)) setOpen(node, true)
      else focusRow(rows.value[at + 1])
      break
    case 'ArrowLeft':
      if (parent && isOpen(node)) setOpen(node, false)
      else if (row.parent) focusRow(rows.value.find(r => r.node === row.parent))
      break
    case 'Enter':
    case ' ':
      select(node)
      break
    default: {
      /* A letter or a digit: the next row starting with it. */
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || !/\S/.test(event.key)) return
      const key = fold(event.key)
      const after = [...rows.value.slice(at + 1), ...rows.value.slice(0, at)]
      focusRow(after.find(r => fold(r.node.code ?? r.node.label).startsWith(key) || fold(r.node.label).startsWith(key)))
    }
  }
  event.preventDefault()
}

/* From the search, ↓ goes into the tree. */
function intoTree(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' || !rows.value.length) return
  event.preventDefault()
  focusRow(rows.value[0])
}

provide(OPTION_TREE_KEY, {
  isVisible,
  isOpen,
  isSelected: node => model.value !== null && keyOf(node.value) === keyOf(model.value),
  isTabbable: node => tabbable.value === keyOf(node.value),
  toggle,
  select,
  segments,
  register,
})

/* The path written above: the ancestors' codes, then the chosen row. */
const path = computed(() => (selectedNode.value ? ancestors(selectedNode.value) : []))
</script>

<template>
  <div class="ds-option-tree">
    <div v-if="searchable" class="ds-option-tree__search">
      <InputField
        v-model="query"
        type="search"
        :placeholder="searchPlaceholder"
        :aria-label="searchLabel"
        :aria-controls="treeId"
        autocomplete="off"
        @keydown="intoTree"
      >
        <template #icon-leading>
          <Icon name="search" :size="20" />
        </template>
      </InputField>
    </div>

    <p v-if="chosenLabel !== null && selectedNode" class="ds-option-tree__chosen">
      <span>{{ chosenLabel }}</span>
      <template v-for="node in path" :key="node.value">
        <Tag v-if="node.code" size="sm" :label="node.code" />
        <span v-else class="ds-option-tree__chosen-label">{{ node.label }}</span>
        <Icon name="chevron-right" :size="16" class="ds-option-tree__chosen-sep" aria-hidden="true" />
      </template>
      <Tag v-if="selectedNode.code" size="sm" :label="selectedNode.code" />
      <span class="ds-option-tree__chosen-label">{{ selectedNode.label }}</span>
    </p>

    <ul
      v-show="hasResults"
      :id="treeId"
      role="tree"
      class="ds-option-tree__tree"
      :aria-label="label"
      @keydown="onKeydown"
    >
      <OptionTreeItem v-for="node in nodes" :key="node.value" :node="node" :level="1" />
    </ul>
    <p v-if="!hasResults" class="ds-option-tree__empty" role="status">{{ noResultsLabel }}</p>
  </div>
</template>

<style scoped>
.ds-option-tree {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  min-width: 0;
}

/* The search is a search, not a line of the form: Figma's 400. */
.ds-option-tree__search {
  max-width: 25rem;
}

.ds-option-tree__chosen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ds-spacing-sm);
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-option-tree__chosen-label {
  color: var(--ds-text-default);
  overflow-wrap: anywhere;
}

.ds-option-tree__chosen-sep {
  color: var(--ds-text-subtlest);
}

.ds-option-tree__tree {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-option-tree__empty {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}
</style>
