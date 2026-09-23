<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'

export interface BreadcrumbsItem {
  label: string
  href?: string
}

interface Props {
  /**
   * The ancestors, then the current page. The house is not in here — the
   * component posts it.
   *
   * **Empty is a depth, not a missing value.** The house alone *is* the home
   * page, so a bar on the home page still shows a trail — it just has nothing
   * to trail to. Every item takes its chevron, including the first: a trail of
   * one still trails.
   */
  items?: BreadcrumbsItem[]
  /**
   * Where the house goes. With it the house is an `<a>`, without it a
   * `<button>` — ADR-0014's rule, the one `SideNavItem` and `ProjectCard`
   * already follow. The home page is a destination, not an action.
   */
  homeHref?: string
  /**
   * The house's accessible name. It is the only word this component says, and
   * a word belongs to the product — the glyph is a drawing and stays ours, the
   * string is not. Defaulted rather than required so the common case costs
   * nothing.
   */
  homeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  homeLabel: 'Accueil',
})

const emit = defineEmits<{
  home: [event: MouseEvent]
  /**
   * A crumb was activated. Emitted **even when it is an `<a>`**, so a router
   * can `preventDefault()` and navigate client-side — an `href` alone costs a
   * full page load in an SPA. Carries the item, because a trail that cannot
   * say *which* crumb was clicked cannot navigate either.
   */
  select: [item: BreadcrumbsItem, event: MouseEvent]
}>()

function onSelect(item: BreadcrumbsItem, event: MouseEvent): void {
  emit('select', item, event)
}

/**
 * **Five nodes, house included.** Spectrum truncates at five, Carbon keeps the
 * first and the last two, Fluent collapses from the second — the threshold is
 * the one number every system agrees on. Tolbi's own trails land either side of
 * it: ID stops at three, Yield at five, and only Data OS
 * (`Data OS › Projets › Forums › Forum 123 › Assurance`) reaches six.
 */
const MAX_NODES = 5

/** Depth 0: there is no trail, so the house *is* the page you are on. */
const homeIsCurrent = computed(() => props.items.length === 0)

/** The ellipsis opens the trail in place rather than into a menu (Spectrum). */
const expanded = ref(false)
const isCollapsed = computed(
  () => !expanded.value && props.items.length + 1 > MAX_NODES,
)

interface TrailNode {
  key: string
  /** Present on a crumb. */
  item?: BreadcrumbsItem
  current?: boolean
  /** Present on the ellipsis — the ancestors it stands for. */
  hidden?: BreadcrumbsItem[]
}

const trail = computed<TrailNode[]>(() => {
  const items = props.items
  const last = items.length - 1
  const crumb = (item: BreadcrumbsItem, i: number): TrailNode => ({
    key: `crumb-${i}`,
    item,
    current: i === last,
  })

  if (!isCollapsed.value) return items.map(crumb)

  // First and last two survive; the middle becomes the ellipsis (Carbon).
  return [
    crumb(items[0], 0),
    { key: 'ellipsis', hidden: items.slice(1, -2) },
    crumb(items[last - 1], last - 1),
    crumb(items[last], last),
  ]
})

/**
 * One key at a time: a tooltip is a pointer, and there is only one pointer.
 *
 * **A label is cut by width, not by a character count** — every product we
 * measured does it that way, and Linear showing a 61-character crumb whole
 * proves the count is not the rule. It cannot be: in proportional type fifteen
 * `W` are twice fifteen `i`, so a count truncates the wrong labels in both
 * directions. The ceiling lives in CSS as `--breadcrumb-label-max`.
 *
 * Which means we cannot know from the string whether it was cut — so we ask
 * the element, at the only moment the answer matters: the pointer is already
 * on it. No observer, no measurement on a frame nobody is looking at.
 */
const hovered = ref<string | null>(null)
const clipped = ref(false)

function enter(event: Event, key: string): void {
  hovered.value = key
  const crumb = (event.currentTarget as HTMLElement | null)
    ?.querySelector<HTMLElement>('.ds-breadcrumbs__crumb')
  clipped.value = !!crumb && crumb.scrollWidth > crumb.clientWidth
}

function leave(): void {
  hovered.value = null
  clipped.value = false
}
</script>

<template>
  <nav class="ds-breadcrumbs" aria-label="Fil d'Ariane">
    <ol class="ds-breadcrumbs__list">
      <!-- Racine -->
      <li class="ds-breadcrumbs__item">
        <component
          :is="homeHref ? 'a' : 'button'"
          :type="homeHref ? undefined : 'button'"
          :href="homeHref"
          class="ds-breadcrumbs__home"
          :class="{ 'ds-breadcrumbs__home--current': homeIsCurrent }"
          :aria-label="homeLabel"
          :aria-current="homeIsCurrent ? 'page' : undefined"
          @click="emit('home', $event)"
        >
          <Icon name="house" :size="20" />
        </component>
      </li>

      <template v-for="node in trail" :key="node.key">
        <li class="ds-breadcrumbs__separator" aria-hidden="true">
          <Icon name="chevron-right" :size="16" />
        </li>

        <li
          class="ds-breadcrumbs__item"
          @mouseenter="enter($event, node.key)"
          @mouseleave="leave"
          @focusin="enter($event, node.key)"
          @focusout="leave"
        >
          <!-- Les ancêtres repliés -->
          <button
            v-if="node.hidden"
            type="button"
            class="ds-breadcrumbs__crumb ds-breadcrumbs__more"
            :aria-label="`Afficher les ${node.hidden.length} ancêtres masqués`"
            @click="expanded = true"
          >
            …
          </button>

          <!-- Un maillon -->
          <component
            v-else-if="node.item"
            :is="node.current ? 'span' : (node.item.href ? 'a' : 'button')"
            :type="!node.current && !node.item.href ? 'button' : undefined"
            :href="node.current ? undefined : node.item.href"
            :class="[
              'ds-breadcrumbs__crumb',
              node.current ? 'ds-breadcrumbs__crumb--current' : 'ds-breadcrumbs__crumb--link',
            ]"
            :aria-current="node.current ? 'page' : undefined"
            @click="node.current || onSelect(node.item, $event)"
          >
            {{ node.item.label }}
          </component>

          <!--
            L'infobulle ne double jamais ce qui est déjà lisible : elle
            n'apparaît que sur un libellé coupé, ou sur l'ellipse.
          -->
          <Tooltip
            v-if="hovered === node.key && (node.hidden || clipped)"
            class="ds-breadcrumbs__tip"
            :title="node.hidden
              ? node.hidden.map(h => h.label).join(' › ')
              : node.item!.label"
            arrow="top-center"
            role="presentation"
          />
        </li>
      </template>
    </ol>
  </nav>
</template>

<style scoped>
.ds-breadcrumbs__list {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md, 8px);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Ancre de l'infobulle — un maillon coupé la porte sous lui. */
.ds-breadcrumbs__item {
  position: relative;
  display: flex;
  align-items: center;
}

.ds-breadcrumbs__home {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xs, 4px);
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-inner);
  color: var(--ds-text-subtle);
  text-decoration: none;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms ease, color 150ms ease;
}

.ds-breadcrumbs__home:hover:not(.ds-breadcrumbs__home--current) {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-default);
}

.ds-breadcrumbs__home:focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

.ds-breadcrumbs__separator {
  display: flex;
  align-items: center;
  color: var(--ds-text-subtle);
}

/*
  `20ch` is the measured ceiling, not a guess: the one truncation we found in
  the wild cuts at about twenty characters, and the band every other product
  displays whole runs 17–28. `ch` is the honest unit for it — it reads as a
  character count and behaves as a width.

  Private, per ADR-0010: it is this component's own value, not a token.
*/
.ds-breadcrumbs__crumb {
  --breadcrumb-label-max: 20ch;

  /* `block`, not `flex`: text-overflow has no effect on a flex container. */
  display: block;
  max-width: var(--breadcrumb-label-max);
  padding: var(--ds-spacing-xs, 4px) var(--ds-spacing-md, 8px);
  border-radius: var(--ds-radius-inner);
  font: var(--ds-font-label-lg);
  color: var(--ds-text-subtle);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 150ms ease, color 150ms ease;
}

/* L'ellipse est un vrai contrôle : elle déplie le fil sur place. */
.ds-breadcrumbs__more {
  /* Un caractère ne déborde jamais — et il ne doit pas hériter du plafond,
     sinon le `ch` d'un `…` le rétrécit. Le reste des remises à zéro du
     <button> est partagé avec `--link`, juste en dessous. */
  max-width: none;
}

/*
  Le style suit l'état, pas la balise : un maillon actionnable est une ancre ou
  un bouton selon qu'il a un `href`, et les deux doivent se survoler pareil.
  Sélectionner sur `a` laissait le bouton sans survol ni anneau de focus.
*/
.ds-breadcrumbs__crumb--link,
.ds-breadcrumbs__more {
  /* Remises à zéro du <button> ; sans effet sur une ancre. */
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  outline: none;
}

.ds-breadcrumbs__crumb--link:hover,
.ds-breadcrumbs__more:hover {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-default);
}

.ds-breadcrumbs__crumb--link:focus-visible,
.ds-breadcrumbs__more:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

/*
  ── Where you are ─────────────────────────────────────────────────────

  **One treatment, written once**, because "you are here" is one meaning and
  the house is a crumb like the others. Splitting it cost us a visible
  inconsistency: at depth 0 the house has no sibling, so a distinction carried
  only by weight and colour distinguishes it from nothing — which means the
  state has to be a fill, and a fill at depth 0 must be the fill at every
  depth.

  The fill is **neutral, not brand**. `bg-selected` reads harder (1.165:1 and
  a hue against 1.102:1 of pure lightness) and is what Figma drew, but brand
  is interactive affordance (ADR-0009) and the current crumb is the one crumb
  that is not actionable — a `<span>`, not a control.

  `bg-neutral` and not `bg-neutral-subtle`: hover is `bg-hover`, which aliases
  the *same* primitive as `bg-neutral-subtle` (ADR-0033 found that collision on
  `SideNavigation`). One step deeper keeps the two apart and puts them in the
  right order — where you are sits lower than where you might go.

  The icon takes the colour only; a glyph has no weight to give.
*/
.ds-breadcrumbs__home--current,
.ds-breadcrumbs__crumb--current {
  background-color: var(--ds-bg-neutral);
  color: var(--ds-text-strong);
}

.ds-breadcrumbs__crumb--current {
  font: var(--ds-font-label-lg-strong);
}

/* L'infobulle sort sous la barre : le fil vit en haut de l'écran. */
.ds-breadcrumbs__tip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--ds-spacing-sm);
  z-index: var(--ds-z-popover);
  pointer-events: none;
  white-space: nowrap;
}
</style>
