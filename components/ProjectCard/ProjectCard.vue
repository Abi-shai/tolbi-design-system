<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { Badge } from '../Badge'
import { Icon, type IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'
import { Skeleton } from '../Skeleton'
import { ShareBar } from '../ShareBar'
import { Tooltip } from '../Tooltip'
import { Dropdown } from '../Dropdown'

/**
 * One project of one module, as a tile in a grid.
 *
 * **The shell is shared, the insight is not.** Every module's project has the
 * same anatomy — a status, a name, a line of identity metadata, two figures
 * and a freshness line — and that is what keeps a grid of mixed modules
 * readable. What a module *measures* is where the pattern is allowed to break,
 * because forcing one shape onto different data is how a card starts lying.
 *
 * The two shipped modules turned out to describe the **same kind of thing**:
 *
 * - **Scan** passes `crops` — 46 % groundnut against 27 % millet.
 * - **Yield** passes `stage` — and this one was read wrong for a while. A
 *   phenological stage looked like a step you advance through, "2 of 4". It is
 *   not: a parcel is never *at* a stage, its hectares are spread across several
 *   at once, 80 % in flowering and 5 % still tillering. So it is a spread, the
 *   same as crops, and it draws the same bar.
 *
 * Which is why there is **one geometry here, not two**. The block is still
 * derived from the data rather than declared by a `module` prop (ADR-0028) —
 * what changed is that the data was misread, not the rule. The props stay
 * separate (`stage`, `crops`) because a stage and a crop are not the same thing
 * to a caller; `stageLabel` is what decides which one a card is describing.
 *
 * **There is now a `module` prop, and it decides nothing.** It is the mark on
 * the title's line, and nothing in this file branches on it — the rule above is
 * about what the card *draws*, which stays derived. What the mark carries is
 * the one fact no other prop holds: whose project this is. A grid that mixes
 * modules had no way at all to say so.
 *
 * Segments are ordered **biggest first**, by the component and not the caller:
 * the categorical palette is ordered by measured ΔE (ADR-0016), so the dominant
 * share always gets the most distinguishable hue and the `+N` tail is always
 * the small change.
 *
 * **`state` is the card's one axis**, and it carries one thing that is not a
 * project state at all — `loading`. It sits beside `planned`, `running` and
 * `done` because it is what the consumer actually has to render, and because
 * the pill's tone falls out of the same value.
 *
 * **No banner** (ADR-0055). The card opened on a map snapshot of the project,
 * and generating one per project is more than the product's backend can carry.
 * The two controls that sat on the image keep their corners in a head row — the
 * status top left, the menu top right — and lose the one contrast risk the card
 * had: they stood on an arbitrary photograph, and now stand on the card's own
 * ground. `error`, the snapshot's failure, went with it: with nothing to fetch,
 * nothing can fail.
 */
export type ProjectCardState = 'planned' | 'running' | 'done' | 'loading' | 'computing'

/** A chip in the identity line: what the project *is*, not what it measures. */
export interface ProjectCardMeta {
  icon:  IconName
  label: string
}

/**
 * **The two words a figure is read with, and the card picks between them.**
 *
 * A forecast stops being a forecast when the campaign closes — Figma's own
 * component description says the pair never diverges from the status, which is
 * why ADR-0031 recorded it as one axis rather than two ("Rendement prévu" while
 * running, "Rendement estimé" once closed).
 *
 * The card cannot supply the words: they are a module's vocabulary, and reading
 * `module` to choose them is the branch ADR-0038 and ADR-0041 both forbid. So
 * the caller declares the pair and the card picks with `state` — the same value
 * that already picks the tone, so the two can no longer disagree.
 */
export interface ProjectCardMetricBadge {
  /** Before the period has passed — `Prévu`. Also what `planned` reads. */
  running: string
  /** Once it has — `Estimé`. */
  done:    string
}

/** One of the two figures. `badge` is a second reading of the same number. */
export interface ProjectCardMetric {
  label:  string
  /** `null`: not known yet — « — » in the figure's place, read as `pendingLabel` (ADR-0105). */
  value:  string | number | null
  unit?:  string
  /**
   * A plain string is the same word in every state, which is right for a
   * reading that does not change nature. A pair re-words when the period does.
   */
  badge?: string | ProjectCardMetricBadge
}

/**
 * One share of a spread — a phenological stage, a crop. `share` is a percentage.
 *
 * Both modules use this shape and it is the same shape on purpose: a parcel is
 * **not** at a stage, its hectares are spread across several at once. See the
 * component docblock.
 */
export interface ProjectCardShare {
  label: string
  share: number
  /** Its own colour, kept whatever its rank (ADR-0139) — see `ShareBarItem.color`. */
  color?: string
}

/** Yield's phenological spread. */
export type ProjectCardStage = ProjectCardShare
/** Scan's detected crops. */
export type ProjectCardCrop  = ProjectCardShare

interface Props {
  /** Where the project is, plus the two render conditions. */
  state?:      ProjectCardState
  title:       string
  /**
   * Whose project this is — the mark on the title's line.
   *
   * **Content, not a switch.** ADR-0038 recorded that there is no `module`
   * prop, and the rule it protects is intact: what the insight block draws is
   * derived from the data (ADR-0028), never declared. Nothing branches on this.
   * It renders the module's artwork, which is a fact about the project that no
   * other prop carries and no data on the card can derive.
   *
   * **The type is the coverage.** `ModuleName` spells only the 11 modules the
   * system has artwork for, so a project of any other one leaves the prop out
   * and gets no mark — the same call ADR-0005 and ADR-0031 made for `Eudr`,
   * `ina` and `conformite`. A wrong mark is worse than no mark.
   */
  module?:     ModuleName
  /**
   * The drawing of the project's **zone** — its parcels' outline, generated by
   * the product from the geometry (ADR-0038: generated, never chosen). Given,
   * it takes the mark's place in a 40px box, no ground (ADR-0106, the owner's drawing):
   * the projects of a module whose drawing the system does not carry (dMRV,
   * ARR's baselines) are told apart by **where** they are. An image source; the
   * `#zone` slot takes anything else (an inline SVG, a `<canvas>`), the prop as
   * its fallback — ADR-0040's shape. Decorative: the title names the project.
   */
  zone?:       string
  /** The pill at the head of the card. Defaults to a label read off `state`. */
  status?:     string
  /** The "Projet démo" badge. A condition of the account, not of the project. */
  demo?:       boolean
  demoLabel?:  string
  meta?:       ProjectCardMeta[]
  metrics?:    ProjectCardMetric[]
  /**
   * Yield's phenological spread. Mutually exclusive with `crops` in practice.
   * Empty with a `stageLabel` set is the planned form: the line alone, no bar.
   */
  stage?:      ProjectCardStage[]
  stageLabel?: string
  stageShown?: number
  /** Scan's crop spread. */
  crops?:      ProjectCardCrop[]
  cropsLabel?: string
  /**
   * How many legend entries fit on one line before the rest collapse to `+N`.
   * The legend never wraps — a card that changes height with its data breaks
   * the grid it sits in.
   */
  cropsShown?: number
  /**
   * Where the card goes. With it the control is an `<a>`, without it a
   * `<button>` — ADR-0014's rule, and the reason the card is reachable at all.
   */
  href?:       string
  freshness?:  string
  ariaLabel?:  string
  /** Read where a figure is not known yet — `computing`'s figures, or any `null` value; the eye sees « — » (ADR-0105). */
  pendingLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  state:      'running',
  module:     undefined,
  status:     undefined,
  demo:       false,
  demoLabel:  'Projet démo',
  meta:       () => [],
  metrics:    () => [],
  stage:      () => [],
  stageLabel: undefined,
  stageShown: 3,
  crops:      () => [],
  cropsLabel: 'Répartition des cultures',
  cropsShown: 3,
  href:       undefined,
  freshness:  undefined,
  ariaLabel:  undefined,
  pendingLabel: 'en calcul',
})

defineSlots<{
  /**
   * What the module measures, under the two figures — in place of the spread.
   * A figure and its `Sparkline` (ARR's « Indice de stock »). The shell stays
   * the card's; the insight is where a module may differ (ADR-0038).
   */
  insight?: () => unknown
  /** The zone's drawing, in place of `zone` — the 40px box stays the card's (ADR-0106). */
  zone?: () => unknown
  /**
   * The project's actions, as a menu (ADR-0113): `DropdownItem`s, a
   * `DropdownDivider` between groups, the destructive one last with
   * `tone="danger"`. **Presence decides** (ADR-0053): filled, the « ⋯ » opens
   * this menu and emits nothing; empty, it emits `menu` as before. The menu
   * closes when a row is chosen, and the focus goes back to the « ⋯ ».
   */
  menu?: () => unknown
}>()

/* The « ⋯ » menu (ADR-0113): open while its rows are shown. */
const menuOpen = ref(false)
const menuEl = ref<HTMLElement | null>(null)

/* A row chosen — by a click, or Enter / Space on a `div` row — closes the menu
   and hands the focus back to the « ⋯ », the menu button's rule. */
function onMenuChoose(event: Event) {
  if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return
  const row = (event.target as Element | null)?.closest?.('[role="menuitem"], button.ds-dropdown-item')
  if (!row || row.getAttribute('aria-disabled') === 'true') return
  nextTick(() => {
    menuOpen.value = false
    menuEl.value?.querySelector<HTMLElement>('.ds-project-card__more')?.focus()
  })
}

const emit = defineEmits<{
  click: [event: MouseEvent]
  menu:  [event: MouseEvent]
}>()

const isLoading = computed(() => props.state === 'loading')
/**
 * **Computing is a project the card cannot open yet** (ADR-0100, track A): the
 * server is still working out its figures. It keeps the card's geometry — the
 * grid stays on one height — and says what it knows; what it does not know is
 * said **in words**, « en calcul », never a dash (which reads « nothing ») nor
 * a skeleton (which promises seconds where this takes minutes). There is
 * nothing to open: no link, no lift. **The menu stays** (ADR-0100, amended
 * 10 Nov.): it acts on the project, not on its figures — a project being
 * computed is renamed or abandoned like any other.
 */
const isComputing = computed(() => props.state === 'computing')
const slotsZone = useSlots() as Record<string, unknown>
const hasZone = computed<boolean>(() => Boolean(props.zone || slotsZone.zone))
const interactive = computed(() => !isLoading.value && !isComputing.value)
/** Every state but the skeleton carries the « ⋯ »; the slot decides what it opens (ADR-0053). */
const hasMenu = computed(() => !isLoading.value)

/** The pill's tone is the state's, so the two can never disagree. */
const STATUS = {
  planned: { label: 'Planifié', tone: 'neutral' },
  running: { label: 'En cours', tone: 'warning' },
  done:    { label: 'Terminé',  tone: 'success' },
  loading: { label: '',         tone: 'neutral' },
  /* Neutral, and a glyph: the tone alone would say nothing (ADR-0006). */
  computing: { label: 'En calcul', tone: 'neutral' },
} as const

const statusLabel = computed(() => props.status ?? STATUS[props.state].label)
const statusTone  = computed(() => STATUS[props.state].tone)

/**
 * **One computed owns both halves of the badge.** The tone was derived from
 * `state` while the word came from the caller, so a card could render a green
 * `Prévu` — the right colour on the wrong word, which is the failure ADR-0031
 * closed for `ModuleCapsule` and this component only half-applied.
 *
 * `done` is the only state that re-words: `planned` is still before the period
 * has passed, and `loading` renders no badge at all.
 */
const metricBadge = computed(() => {
  const badged = props.metrics.find((m) => m.badge)
  const badge = badged?.badge
  /* A second reading of a number the card does not have is no reading: while
     it computes, or where the value is `null`, the badge goes too (ADR-0100). */
  if (!badge || badged?.value === null || props.state === 'computing') return null
  const done = props.state === 'done'
  return {
    label: typeof badge === 'string' ? badge : done ? badge.done : badge.running,
    tone:  done ? 'success' : 'warning',
  } as const
})

/**
 * **One block, two props.** `stage` and `crops` carry the same shape and render
 * the same geometry, because they *are* the same kind of statement. They stay
 * separate props because a stage and a crop are not the same thing to a caller,
 * and a card handed both would have to pick — `stageLabel` decides, so a module
 * declares which spread it is describing by naming it.
 */
const spread = computed(() => {
  if (props.stageLabel) return { label: props.stageLabel, items: props.stage, shown: props.stageShown }
  if (props.crops.length) return { label: props.cropsLabel, items: props.crops, shown: props.cropsShown }
  return null
})

/* The bar and its legend are `ShareBar` (ADR-0097): biggest first, five hues
   at most, the tail neutral and counted `+N` — the rules this card wrote first. */

/*
  ── What does not fit (ADR-0109) ──────────────────────────────────────
  Two measurements, one observer: the name's two lines, and the identity line.
*/

/* The name keeps its one line — two at 20px cost every card 16px and still cut
   « FPH — Agroforesterie… » — and a cut name is given whole in a tooltip, only
   when it is cut, or a whole name would be said twice. */
const linkEl = ref<HTMLElement | null>(null)
const titleCut = ref(false)

/* The identity line never wraps and never shows half a chip: the chips that fit
   are shown whole, the rest are counted `+N` — the crops' legend rule. The rest
   stay in the list, visually hidden, so a reader still hears every one. */
const metaEl = ref<HTMLElement | null>(null)
const metaProbe = ref<HTMLElement | null>(null)
const metaShown = ref(Number.POSITIVE_INFINITY)
const metaHidden = computed(() => Math.max(0, props.meta.length - metaShown.value))

function fit() {
  const link = linkEl.value
  titleCut.value = !!link && link.scrollWidth > link.clientWidth + 1

  const list = metaEl.value
  const probe = metaProbe.value
  if (!list || !probe) return
  const chips = [...probe.children] as HTMLElement[]
  const more = chips.pop()
  const gap = parseFloat(getComputedStyle(probe).columnGap) || 0
  const widths = chips.map(c => c.getBoundingClientRect().width)
  const room = list.clientWidth
  const all = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, widths.length - 1)
  if (all <= room) { metaShown.value = widths.length; return }
  /* Room for the `+N` is kept from the start: it is there whenever one is cut. */
  const tail = gap + (more?.getBoundingClientRect().width ?? 0)
  let used = 0
  let k = 0
  while (k < widths.length && used + (k ? gap : 0) + widths[k] + tail <= room) {
    used += (k ? gap : 0) + widths[k]
    k++
  }
  /* The first chip always shows — cut with an ellipsis if it alone is too long. */
  metaShown.value = Math.max(1, k)
}

let observer: ResizeObserver | undefined
onMounted(() => {
  fit()
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(() => fit())
  if (linkEl.value) observer.observe(linkEl.value)
  if (metaEl.value) observer.observe(metaEl.value)
})
onBeforeUnmount(() => observer?.disconnect())
watch(() => [props.title, props.meta, props.state], async () => {
  await nextTick()
  observer?.disconnect()
  if (linkEl.value) observer?.observe(linkEl.value)
  if (metaEl.value) observer?.observe(metaEl.value)
  fit()
}, { deep: true })
</script>

<template>
  <article
    class="ds-project-card"
    :class="[`ds-project-card--${state}`, { 'ds-project-card--static': !interactive, 'ds-project-card--zone': hasZone }]"
    :aria-label="ariaLabel"
    :aria-busy="isLoading || undefined"
  >
    <div class="ds-project-card__body">
      <!-- ── Head ───────────────────────────────────────────────────
           Where the banner was: the status keeps its corner, top left, and
           the menu keeps the other (ADR-0055). Loading holds the pill's place
           with a bar — the wait says nothing, so no glyph and no word, but a
           head that appeared on arrival would push the whole card down. -->
      <div class="ds-project-card__head">
        <!-- 20px: the `md` badge's own height, or the card's content would
             rise 4px on arrival (measured). -->
        <Skeleton v-if="isLoading" variant="rect" :height="20" :width="68" />
        <Badge
          v-else
          :label="statusLabel"
          :tone="statusTone"
          :icon="isComputing ? 'clock' : undefined"
          size="md"
        />
      </div>

      <!-- Yield and Scan load **identically** — the wait says nothing about
           which module is coming, because a placeholder that guessed would be
           wrong half the time. What it does say is the card's *shape*: a name
           over a caption, then two figures and a bar inside the insight.

           **No square for the module mark**, and not because the mark is
           secret: the skeleton previews the card's blocks, not its ornaments.
           It already leaves out the demo badge, the meta glyphs and the metric
           pill, and the mark is optional besides — a placeholder for something
           that may never arrive is a 28px jump on arrival, which is exactly
           what the loading rhythm below is tuned to avoid. -->

      <div v-if="isLoading" class="ds-project-card__content ds-project-card__content--loading">
        <div class="ds-project-card__identity-bars">
          <Skeleton variant="rect" emphasis="strong" :height="24" :width="168" />
          <Skeleton variant="rect" :height="16" :width="120" />
        </div>

        <div class="ds-project-card__insight">
          <div class="ds-project-card__metrics">
            <div v-for="n in 2" :key="n" class="ds-project-card__metric-bars">
              <Skeleton variant="rect" :height="12" :width="64" />
              <Skeleton variant="rect" emphasis="strong" :height="20" :width="72" />
            </div>
          </div>
          <Skeleton variant="rect" :height="12" />
          <Skeleton variant="rect" emphasis="strong" :height="6" />
        </div>
      </div>

      <div v-else class="ds-project-card__content">
        <div class="ds-project-card__identity">
          <!-- The **title is the control**, and its `::after` is what makes the
               whole card clickable (ADR-0014: a container that emits `click` is
               unreachable by keyboard). The menu rides above that overlay. -->
          <h3 class="ds-project-card__title">
            <!-- The **illustration, not the logo** (ADR-0005): the card is
                 already the surface, so the logo's tile would be a tile inside
                 a tile — the same call `ModulesList` and `ModuleCapsule` made.

                 **Named**, where those two pass `aria-label="null"`. There, the
                 module's name is visible text right beside the artwork; here
                 nothing on the card says which module this is, so the mark is
                 the only carrier of the fact and has to carry it for assistive
                 technology too. `ModuleIcon` defaults its name to the module's,
                 which is exactly the string wanted.

                 Inside the `<h3>` rather than beside it, so the heading reads
                 "Yield Rendement Arachide Nord" — the module qualifies the name.
                 The control keeps the title alone, which is right: the module is
                 not where the click goes. -->
            <!-- The zone takes the mark's place: one mark per card (ADR-0106). -->
            <span v-if="hasZone" class="ds-project-card__zone" aria-hidden="true">
              <slot name="zone"><img :src="zone" alt="" /></slot>
            </span>
            <ModuleIcon
              v-else-if="module"
              :module="module"
              variant="illustration"
              size="var(--project-card-mark)"
            />
            <!-- One line, and the whole name in a tooltip, only when it is cut
                 (ADR-0109). The overlay is the link's, so pointing
                 anywhere on the card asks for it. -->
            <Tooltip :title="title" :disabled="!titleCut" placement="top-start">
              <!-- Nothing to open while it computes: the title is a title. -->
              <span v-if="isComputing" ref="linkEl" class="ds-project-card__link">{{ title }}</span>
              <component
                v-else
                ref="linkEl"
                :is="href ? 'a' : 'button'"
                class="ds-project-card__link"
                :type="href ? undefined : 'button'"
                :href="href"
                @click="emit('click', $event)"
              >{{ title }}</component>
            </Tooltip>
          </h3>
          <Badge v-if="demo" :label="demoLabel" tone="neutral" size="md" />
        </div>

        <ul v-if="meta.length" ref="metaEl" class="ds-project-card__meta">
          <li
            v-for="(m, i) in meta"
            :key="m.label"
            :class="{ 'ds-project-card__hidden': i >= metaShown }"
          >
            <Icon :name="m.icon" :size="16" aria-hidden="true" />
            <span>{{ m.label }}</span>
          </li>
          <li v-if="metaHidden" class="ds-project-card__meta-more" aria-hidden="true">+{{ metaHidden }}</li>
        </ul>
        <!-- What every chip would measure, whole: the line is fitted from it. -->
        <ul v-if="meta.length" ref="metaProbe" class="ds-project-card__meta ds-project-card__meta--probe" aria-hidden="true">
          <li v-for="m in meta" :key="m.label">
            <Icon :name="m.icon" :size="16" aria-hidden="true" />
            <span>{{ m.label }}</span>
          </li>
          <li class="ds-project-card__meta-more">+9</li>
        </ul>

        <div class="ds-project-card__insight">
          <div v-if="metrics.length" class="ds-project-card__metrics">
            <div v-for="m in metrics" :key="m.label" class="ds-project-card__metric">
              <span class="ds-project-card__metric-label">{{ m.label }}</span>
              <span v-if="m.value === null" class="ds-project-card__metric-pending"><span aria-hidden="true">—</span><span class="ds-project-card__hidden">{{ pendingLabel }}</span></span>
              <span v-else class="ds-project-card__metric-value">
                <span class="ds-project-card__metric-number">{{ m.value }}</span>
                <span v-if="m.unit" class="ds-project-card__metric-unit">{{ m.unit }}</span>
              </span>
            </div>
            <Badge
              v-if="metricBadge"
              class="ds-project-card__metric-badge"
              :label="metricBadge.label"
              :tone="metricBadge.tone"
              variant="pill-outline"
              size="sm"
            />
          </div>

          <!-- Widths are the data, so they must not be equal. Same block for
               stages and for crops: both say how the parcel is divided. -->
          <div v-if="$slots.insight" class="ds-project-card__slot"><slot name="insight" /></div>
          <div
            v-else-if="spread"
            class="ds-project-card__stage"
            :class="{ 'ds-project-card__stage--bare': !spread.items.length }"
          >
            <div class="ds-project-card__stage-head">
              <span>{{ spread.label }}</span>
            </div>

            <ShareBar v-if="spread.items.length" :items="spread.items" :shown="spread.shown" />
          </div>
        </div>
      </div>

      <div class="ds-project-card__footer">
        <Skeleton v-if="isLoading" variant="rect" :height="12" :width="110" />
        <span v-else-if="freshness">{{ freshness }}</span>
      </div>
    </div>

    <!--
      **Last in the DOM, on purpose.** It sits in the head's corner, but a
      keyboard reaches things in source order, and a grid that goes menu,
      project, menu, project puts the afterthought before the thing itself.

      `xs`: 32px, not the navigation bar's 36. A tile 280px wide cannot spend a
      36px disc on a menu it shares with a status pill.
    -->
    <!-- Filled `#menu`: the « ⋯ » is the trigger of the package's menu (ADR-0113). -->
    <div
      v-if="hasMenu && $slots.menu"
      ref="menuEl"
      class="ds-project-card__menu"
      @click="onMenuChoose"
      @keydown="onMenuChoose"
    >
      <Dropdown v-model:open="menuOpen" align="end" :label="`Actions — ${title}`">
        <template #trigger>
          <IconButton
            class="ds-project-card__more"
            icon="ellipsis"
            size="xs"
            :active="menuOpen"
            :ariaLabel="`Actions — ${title}`"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            @click.stop="menuOpen = !menuOpen"
          />
        </template>
        <slot name="menu" />
      </Dropdown>
    </div>
    <IconButton
      v-else-if="hasMenu"
      class="ds-project-card__more"
      icon="ellipsis"
      size="xs"
      :ariaLabel="`Actions — ${title}`"
      @click.stop="emit('menu', $event)"
    />
  </article>
</template>

<style scoped>
/*
  `10px`, declared once and **off the ramp** — the scale goes 8 then 12. It is
  the gap the variants agree on for the card's three seams: head to identity,
  identity block to insight, content to footer. Not control padding, so
  ADR-0013's exemption does not cover it: either it becomes a step or it snaps
  to `spacing-md`.
*/
/*
  **280px is a ceiling, not a size** — ADR-0031's rule, and ADR-0035's after it.
  The card fills the column it is given and stops there; the grid decides how
  many fit, the card decides how wide it is willing to get. Without the cap it
  took whatever the container offered, and the media's `280 / 128` grew with it:
  a snapshot framed on the union of the project's geometries turning into a
  banner (ADR-0040; the snapshot itself has gone since, ADR-0055). `max-width`,
  not `width`, so a narrower column still gets a card.

  **`17.5em`, not `280px`.** The cap is expressed in the card's own type size,
  so a consumer that shrinks the text shrinks the shell with it rather than
  leaving the same box around smaller words. Worth knowing which way this
  resolves: `.ds-project-card` declares no `font:` of its own — every role in
  this file sits on a child — so the `em` reads the *inherited* size, i.e. the
  consumer's. That is the point, but it also means the ceiling is not a constant;
  `17.5rem` is the version that is (and is what `EmptyState` and `ChartTooltip`
  use for their own caps).

  **`20em` since ADR-0144** — 17.5 × 16/14: the body went 14 → 16 and the
  inherited `em` did not, so the shell is moved by the same ratio as its text.
  At 17.5em the dMRV card's two figures spilled 33px past its edge.
*/
.ds-project-card {
  /* A card is its own context, wherever it is shown: its width holds the floor's legends (ADR-0132, ADR-0144). */
  --reading-secondary-font: var(--ds-font-body-sm);
  --reading-secondary-font-emphasis: var(--ds-font-body-sm-emphasis);
  --reading-legend-wrap: nowrap;
  --reading-legend-fade: block;
  --project-card-gap: 10px;
  /*
    The module mark's box, and the identity row's floor — one value, because the
    two must never disagree (ADR-0034's `--side-nav-rail-row`, same reason). A
    variant switch, not a token (ADR-0010): it carries an own-value, it is
    component-scoped, and it stays private.
  */
  --project-card-mark: 32px;

  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 20em;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
  cursor: pointer;
  /* token-lint-disable-next-line focus-ring-instant — this box-shadow is the card's own elevation, not a focus ring; at 50ms the shadow would already be there while the card is still moving */
  transition:
    box-shadow var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    transform  var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

/*
  The card lifts — `elevation-control` → `elevation-surface`, and two pixels up.

  **`quick` (100ms), and it is not a free choice.** One gesture is moving two
  things here: the card rises and the menu fades in. ADR-0037 settled what
  happens when those disagree — two durations on one gesture tear — and the menu
  is the one with a real constraint, because the pointer is already travelling
  toward it. So the constrained mark sets the tempo and the lift follows it.
  `moderate` (150ms) is what every other hover in the catalogue uses, and it
  would be the answer if the card were hovering alone.

  `easing-default`: "responds instantly, settles with weight" — which is the
  whole sentence a lift is trying to say.

  **Two pixels is a literal on purpose.** ADR-0032 looked at minting a travel
  distance and declined: three sites, three values, not a scale.

  **In dark the shadow is not what carries this** (ADR-0030: the strongest
  shadow gray-forest/900 can hold is 1.262:1). The two pixels are, because
  geometry does not care how dark the ground is — which is the reason a lift
  survives a mode change where an elevation alone does not.
*/
@media (hover: hover) {
  .ds-project-card:not(.ds-project-card--static):hover {
    transform: translateY(-2px);
    box-shadow: var(--ds-elevation-surface);
  }
}

/* Nothing to open, nothing to point at. */
.ds-project-card--static {
  cursor: auto;
}

/* No edge while it waits, as drawn: the hairline is what makes the block a
   surface, and a placeholder is not one yet. `transparent` rather than `none`
   so the border box does not change — the skeleton bars sit exactly where the
   real content will, and nothing shifts on arrival. */
.ds-project-card--loading .ds-project-card__insight {
  border-color: transparent;
}

/* Above the title's overlay, or the card would swallow the menu's clicks.
   Stacking inside one component, so the number stays literal (ADR-0020). */
.ds-project-card__more,
.ds-project-card__menu {
  position: absolute;
  z-index: 1;
  top: var(--ds-spacing-lg);
  right: var(--ds-spacing-lg);
}

/* In the menu's wrapper, the button is placed by the wrapper. */
.ds-project-card__menu .ds-project-card__more {
  position: static;
}

.ds-project-card__more {
  background: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  box-shadow: var(--ds-elevation-surface);
}

/*
  The menu is **on hover only**, and three decisions sit under that.

  **`hover: hover` gates the whole thing.** A touch screen has no pointer to
  rest, so a control that waits for one is a control that never exists. There
  the button stays where it is.

  **`quick` (100ms), and it is not an enter/exit pair.** The scale names `enter`
  at 200ms for "the interface makes room" — this button makes no room, it was
  always in that corner and we were simply not showing it. What it has instead
  is a deadline: the pointer is already travelling toward the top-right when the
  card lights up, and 200ms of fade means clicking a button that is half there.
  `quick` is the token written for exactly that — "responds before you finish
  the gesture". One declaration, both directions: `exit` is also 100ms, so an
  asymmetry here would be two names for one number.

  **Opacity alone.** `SurfaceTransition`'s 0.96 scale is for something that
  arrives from somewhere (ADR-0021), and ADR-0023's rule is that movement must
  *explain*. A scale here would say the button just flew in; it did not. A fade
  says it was always there — which is the truth, and the reason it can be
  reached by keyboard the whole time.

  It stays in the DOM at `opacity: 0` rather than `display: none`, so it keeps
  its place in the tab order; `:focus-visible` brings it back for a keyboard
  that never hovers anything.
*/
@media (hover: hover) {
  .ds-project-card__more {
    opacity: 0;
    transition:
      opacity    var(--ds-motion-duration-quick)    var(--ds-motion-easing-default),
      background var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  }

  .ds-project-card:hover .ds-project-card__more,
  .ds-project-card__more:focus-visible,
  .ds-project-card__more.ds-icon-button--active {
    opacity: 1;
  }
}

/* ── Body ─────────────────────────────────────────────────────────── */
/* `spacing-lg` all round now that nothing is flush to the edge: the banner was,
   on three sides, and the body started under it with no padding of its own. */
.ds-project-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 1 auto;
  gap: var(--project-card-gap);
  padding: var(--ds-spacing-lg);
}

/*
  The head: the status, top left, where it sat on the banner. The menu is not in
  this row — it is last in the DOM for the tab order and placed against the card
  (`__more`), at the same 12px from the top and the right as before, so the two
  corners are where they were and nothing on hover moves.
*/
.ds-project-card__head {
  display: flex;
  align-items: center;
}

.ds-project-card__content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: var(--project-card-gap);
}

/*
  **The row declares its height**, which is the whole job of
  `--project-card-mark`.

  24px was the *free* size: exactly one `label-xl-strong` line box (16/24 in both
  type scales), so the row measured the same with the mark and without. 32px is
  not free, and the cost is not the 8px — it is that a card carrying a module
  would stand 8px taller than one whose module the system has no artwork for,
  and **a grid of two card heights is the thing ADR-0038 spends the most rules
  avoiding**. So the floor is the mark's own size, read from one value by both
  the row and the artwork, and whether a card has a mark stops being a height
  decision. Every card pays the 8px; none pays it twice.
*/
.ds-project-card__identity {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: var(--project-card-mark);
}

/*
  Loading has a **different rhythm**, and on purpose. Loaded, the card is three
  units evenly spaced by the 10px seam — name, identity line, insight. Loading,
  the name and its caption are one shape with nothing between them to separate,
  so they group at `spacing-md` and the group steps back from the insight at
  `spacing-lg`. Both add up to the same height, so nothing moves on arrival.
*/
.ds-project-card__content--loading {
  gap: var(--ds-spacing-lg);
}

.ds-project-card__identity-bars,
.ds-project-card__metric-bars {
  display: flex;
  flex-direction: column;
}

.ds-project-card__identity-bars { gap: var(--ds-spacing-md); }

/* The two figures hug, where the loaded pair splits the row: a placeholder
   states a width, it does not measure one. */
.ds-project-card__metric-bars   { gap: var(--ds-spacing-sm); }

/*
  The heading is the row that holds the module mark, so it is the flex box.

  **32px is a size that was chosen; 24px was the one that was free.** At 24 the
  mark is exactly the `label-xl-strong` line box and costs nothing; at 32 it
  overhangs the name by 4px top and bottom and the row grows to meet it. That is
  a trade — legibility of an eleven-way mark against 8px of card height — and it
  is paid uniformly, which is the condition (see `__identity`). The demo badge
  is still 24px and simply centres in the taller row.

  **`spacing-xs` here against `spacing-md` to the badge.** The mark and the name
  are one unit — *this project, of this module* — where the badge is a separate
  statement, about the account rather than the project. Two gaps, because they
  are two kinds of adjacency.
*/
/*
  The zone's box (ADR-0106, the owner's drawing — Figma `3757:1607`): 40px, **no
  ground** (amended: the drawing stands on the card itself), 8px from the name.
  The row's floor follows (`--project-card-mark`), so every card of a module
  that shows its zones shares one height.
*/
.ds-project-card--zone {
  --project-card-mark: 40px;
}

.ds-project-card--zone .ds-project-card__title {
  gap: var(--ds-spacing-md);
}

.ds-project-card__zone {
  flex: none;
  display: grid;
  place-items: center;
  width: var(--project-card-mark);
  height: var(--project-card-mark);
  overflow: hidden;
}

.ds-project-card__zone > :deep(img),
.ds-project-card__zone > :deep(svg),
.ds-project-card__zone > :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ds-project-card__title {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  flex: 1 1 auto;
  min-width: 1px;
  margin: 0;
  font: var(--ds-font-heading-lg);
  color: var(--ds-text-strong);
}

/* The tooltip's anchor is the flex item now, so it is what shrinks. */
.ds-project-card__title > :deep(.ds-tooltip-anchor) {
  flex: 1 1 auto;
  min-width: 1px;
}

/*
  A `<button>` unless there is an `href`, and it inherits everything so the
  heading still looks like a heading. The truncation lives here rather than on
  the `<h3>`, because the box that overflows has to be the one that clips —
  which now means the flex pair as well: a flex item will not shrink below its
  content without `min-width`, so without it the mark would be pushed out of
  the card instead of the name being cut.
*/
.ds-project-card__link {
  display: block;
  flex: 1 1 auto;
  min-width: 1px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  text-decoration: none;
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: inherit;
}

/*
  The overlay is what makes the whole card the target — the control stays a real
  one, and the click area stops being a `<div>` with a handler on it.
*/
.ds-project-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--ds-radius-surface);
}

/* ADR-0022: a focus ring confirms the keystroke immediately. Nothing transitions
   here, so it is instant by construction — and it rings the card, not the word,
   because the card is what the key press selected. */
.ds-project-card__link:focus-visible {
  outline: none;
}

.ds-project-card__link:focus-visible::after {
  box-shadow: var(--ds-focus-ring-brand);
}

/* The identity line: what the project *is*. Never wraps — a card whose height
   depends on how many chips fit would break the grid. */
.ds-project-card__meta {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
}

.ds-project-card__meta li {
  display: inline-flex;
  align-items: center;
  flex: 0 1 auto;
  gap: var(--ds-spacing-xxs);
  min-width: 0;
  white-space: nowrap;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-subtle);
}

/* Only a first chip too long for the whole line ever shrinks: the others that
   would not fit are counted instead (ADR-0109). */
.ds-project-card__meta li > span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-project-card__meta li > :deep(svg) {
  flex: none;
}

.ds-project-card__meta .ds-project-card__meta-more {
  flex: none;
  color: var(--ds-text-subtlest);
}

/* Off the page and out of the flow: it only measures. */
.ds-project-card__meta--probe {
  position: absolute;
  top: 0;
  left: 0;
  width: max-content;
  visibility: hidden;
  pointer-events: none;
}

/* ── Insight ──────────────────────────────────────────────────────── */
/*
  The block sits **one step up the neutral ramp** from where it started: the
  ground went `gray-light/100 → 50`. The hairline did not follow — it stays at
  `border-subtlest` (100), which is what all eight content variants draw. It
  used to be the same hex as the fill it enclosed and could not be seen at all;
  a step of ground is what made it, and the fraction pill beside it, appear.
  It is still faint on purpose: the edge separates, it does not frame.
*/
/* It **stretches**: the block reaches the footer whatever it holds, so two
   cards side by side agree on where the grey starts and where it ends. Yield's
   insight is a line shorter than Scan's, and without this the difference would
   land as white space above the footer rather than as room inside the block. */
.ds-project-card__insight {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtlest);
  border-radius: var(--ds-radius-control);
  background-color: var(--ds-bg-neutral-subtle);
}

.ds-project-card__metrics {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-xl);
}

/* Equal columns, not hugged content: the second figure has to start at the
   same abscissa on every card, or a grid of them stops lining up. */
.ds-project-card__metric {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  gap: var(--ds-spacing-xs);
  min-width: 1px;
}

.ds-project-card__metric-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtlest);
}

/*
  **The figure and its unit hold one line, and never run into the neighbour**
  (ADR-0109). The pair sits on one **baseline** — a number and a 12px unit
  centred on each other would float the unit. The figure is `heading-md` on
  every card of every module: at `heading-lg`, « 166 610 tCO2e » was 114px in a
  106px column, and stepping down only the cards that overflowed made two sizes
  in one grid. At 16px the pair is 99px; past ~12 characters with a unit the
  product writes it compactly.
*/
.ds-project-card__metric-value {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-xs);
  white-space: nowrap;
}

.ds-project-card__metric-number {
  /* A heading role, not a metric one — the metric ramp starts at 30px and would
     swamp a 280px tile. `heading-md`, on every card (ADR-0109). */
  font: var(--ds-font-heading-md);
  /* Must follow `font:`, which resets font-variant-numeric (ADR-0011). */
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

.ds-project-card__metric-unit {
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}

/*
  A figure not known yet keeps the figure's line — the outer box is the
  heading's line box, the words inside it are body text in the receding ink —
  so a card that computes is the height of its neighbours.
*/
.ds-project-card__metric-pending {
  display: block;
  /* What is not there yet is written « — », in the type of the figure it
     stands for and the receding ink (ADR-0105) — the same dash as
     `CreditCost`'s unpriced cost. */
  font: var(--ds-font-heading-md);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
}

/* Visually hidden, still read — never display:none. */
.ds-project-card__hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.ds-project-card__slot {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
}

/* Nothing has been measured yet, so the figure is a placeholder and drops to
   its own label's colour. Derived from the state, not from the value being a
   dash — a planned project has no number to make strong. */
.ds-project-card--planned .ds-project-card__metric-number {
  color: var(--ds-text-subtlest);
}

/* The badge keeps its size and the figures share what is left. */
.ds-project-card__metric-badge {
  flex: none;
  margin-left: auto;
}

/* ── Stage / distribution ─────────────────────────────────────────── */
.ds-project-card__stage {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
}

.ds-project-card__stage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-label-lg);
  color: var(--ds-text-default);
}

/* No bar under it: the line states a fact rather than labelling a scale. */
.ds-project-card__stage--bare .ds-project-card__stage-head {
  color: var(--ds-text-subtle);
}

/* ── Footer ───────────────────────────────────────────────────────── */
.ds-project-card__footer {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-body-sm);
  /* The `font:` shorthand resets `font-style`, so the slant has to come after
     it — the same ordering trap ADR-0011 records for `tabular-nums`. There is
     no italic role: the scale has 20 and none of them is a slant, so this is a
     single-axis override on a whole role, which the completeness rule permits
     because `font-style` is not one of its four axes. */
  font-style: italic;
  color: var(--ds-text-subtlest);
}
</style>
