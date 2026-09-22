<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '../Badge'
import { Icon, type IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { Skeleton } from '../Skeleton'

/**
 * One project of one module, as a tile in a grid.
 *
 * **The shell is shared, the insight is not.** Every module's project has the
 * same anatomy — a snapshot, a name, a line of identity metadata, two figures
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
 * Segments are ordered **biggest first**, by the component and not the caller:
 * the categorical palette is ordered by measured ΔE (ADR-0016), so the dominant
 * share always gets the most distinguishable hue and the `+N` tail is always
 * the small change.
 *
 * **`state` is the card's one axis**, and it carries two things that are not
 * project states at all — `loading` and `error`. They sit beside `planned`,
 * `running` and `done` because they are what the consumer actually has to
 * render, and because the pill's tone falls out of the same value.
 *
 * **`error` is the snapshot's failure, not the project's.** The status pill
 * stays, because the project is still running; only its picture is missing.
 *
 * **Nothing in the body is laid over the image.** Only the pill and the overflow
 * button are, which is the one contrast risk the card carries: a snapshot is an
 * arbitrary photograph and neither is guaranteed a ground. Felt avoids this
 * entirely by putting every control below the image — worth revisiting if the
 * pill turns out to be unreadable on pale tiles.
 */
export type ProjectCardState = 'planned' | 'running' | 'done' | 'loading' | 'error'

/** A chip in the identity line: what the project *is*, not what it measures. */
export interface ProjectCardMeta {
  icon:  IconName
  label: string
}

/** One of the two figures. `badge` is a second reading of the same number. */
export interface ProjectCardMetric {
  label:  string
  value:  string | number
  unit?:  string
  badge?: string
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
}

/** Yield's phenological spread. */
export type ProjectCardStage = ProjectCardShare
/** Scan's detected crops. */
export type ProjectCardCrop  = ProjectCardShare

interface Props {
  /** Where the project is, plus the two render conditions. */
  state?:      ProjectCardState
  title:       string
  /** The pill over the snapshot. Defaults to a label read off `state`. */
  status?:     string
  /** The "Projet démo" badge. A condition of the account, not of the project. */
  demo?:       boolean
  demoLabel?:  string
  /** The map snapshot. Framed on every geometry the project holds. */
  snapshot?:   string
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
  /** What the media says when there is no snapshot to show. */
  emptyLabel?: string
  ariaLabel?:  string
}

const props = withDefaults(defineProps<Props>(), {
  state:      'running',
  status:     undefined,
  demo:       false,
  demoLabel:  'Projet démo',
  snapshot:   undefined,
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
  emptyLabel: 'Imagerie indisponible',
  ariaLabel:  undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  menu:  [event: MouseEvent]
}>()

const isLoading = computed(() => props.state === 'loading')
const isError   = computed(() => props.state === 'error')

/** The pill's tone is the state's, so the two can never disagree. */
const STATUS = {
  planned: { label: 'Planifié', tone: 'neutral' },
  running: { label: 'En cours', tone: 'warning' },
  done:    { label: 'Terminé',  tone: 'success' },
  error:   { label: 'En cours', tone: 'warning' },
  loading: { label: '',         tone: 'neutral' },
} as const

const statusLabel = computed(() => props.status ?? STATUS[props.state].label)
const statusTone  = computed(() => STATUS[props.state].tone)

/** The snapshot shows only when there is one and nothing has gone wrong. */
const showSnapshot = computed(() => !!props.snapshot && !isLoading.value && !isError.value)

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

/**
 * **Biggest first, always.** The order is the component's, not the caller's:
 * the palette is ordered by measured ΔE (ADR-0016), so the first series are the
 * most distinguishable — and a spread whose dominant share is not the first
 * colour wastes that. It also means the `+N` tail is always the small change.
 */
const ordered = computed(() => spread.value ? [...spread.value.items].sort((a, b) => b.share - a.share) : [])
const shown   = computed(() => ordered.value.slice(0, spread.value?.shown ?? 0))
const hidden  = computed(() => Math.max(0, ordered.value.length - (spread.value?.shown ?? 0)))

/**
 * Past the palette's comfortable ceiling the tail shares one neutral (ADR-0016)
 * — reaching further down a ramp solved for five gives two series nobody can
 * tell apart.
 *
 * The legend binds first, though: **a colour the legend does not name is not a
 * colour, it is noise.** Whatever collapses into `+N` collapses into the same
 * neutral in the bar, so the two readings of the spread always agree on how
 * many things have names. The ceiling still caps — a legend wide enough for six
 * entries still only gets five hues.
 */
const CEILING = 5
const named = computed(() => Math.min(spread.value?.shown ?? 0, CEILING))
function shareColour(i: number) {
  return i < named.value ? `var(--ds-chart-categorical-${i + 1})` : 'var(--project-card-share-rest)'
}
</script>

<template>
  <article
    class="ds-project-card"
    :class="`ds-project-card--${state}`"
    :aria-label="ariaLabel"
    :aria-busy="isLoading || undefined"
  >
    <!-- ── Media ────────────────────────────────────────────────────
         Loading carries neither pill nor menu: there is nothing to
         command yet, and a glyph here would read as a final state. -->
    <div class="ds-project-card__media">
      <img
        v-if="showSnapshot"
        :src="snapshot"
        alt=""
        class="ds-project-card__snapshot"
      />

      <!-- The word, and nothing else. Both error variants hide the glyph and
           the frame was re-centred on the line alone, so this is a state and
           not a stray toggle — but it does overturn ADR-0038's "the absence
           speaks: glyph, word, action". One line to put back. -->
      <div v-if="isError" class="ds-project-card__media-empty">
        <span>{{ emptyLabel }}</span>
      </div>

      <Badge
        v-if="!isLoading"
        class="ds-project-card__status"
        :label="statusLabel"
        :tone="statusTone"
        size="md"
      />
    </div>

    <!-- ── Body ─────────────────────────────────────────────────── -->
    <div class="ds-project-card__body">
      <!-- Yield and Scan load **identically** — the wait says nothing about
           which module is coming, because a placeholder that guessed would be
           wrong half the time. What it does say is the card's *shape*: a name
           over a caption, then two figures and a bar inside the insight. -->
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
            <component
              :is="href ? 'a' : 'button'"
              class="ds-project-card__link"
              :type="href ? undefined : 'button'"
              :href="href"
              @click="emit('click', $event)"
            >{{ title }}</component>
          </h3>
          <Badge v-if="demo" :label="demoLabel" tone="neutral" size="md" />
        </div>

        <ul v-if="meta.length" class="ds-project-card__meta">
          <li v-for="m in meta" :key="m.label">
            <Icon :name="m.icon" :size="16" aria-hidden="true" />
            <span>{{ m.label }}</span>
          </li>
        </ul>

        <div class="ds-project-card__insight">
          <div v-if="metrics.length" class="ds-project-card__metrics">
            <div v-for="m in metrics" :key="m.label" class="ds-project-card__metric">
              <span class="ds-project-card__metric-label">{{ m.label }}</span>
              <span class="ds-project-card__metric-value">
                <span class="ds-project-card__metric-number">{{ m.value }}</span>
                <span v-if="m.unit" class="ds-project-card__metric-unit">{{ m.unit }}</span>
              </span>
            </div>
            <Badge
              v-if="metrics.find((m) => m.badge)"
              class="ds-project-card__metric-badge"
              :label="metrics.find((m) => m.badge)!.badge"
              :tone="state === 'done' ? 'success' : 'warning'"
              variant="pill-outline"
              size="sm"
            />
          </div>

          <!-- Widths are the data, so they must not be equal. Same block for
               stages and for crops: both say how the parcel is divided. -->
          <div
            v-if="spread"
            class="ds-project-card__stage"
            :class="{ 'ds-project-card__stage--bare': !ordered.length }"
          >
            <div class="ds-project-card__stage-head">
              <span>{{ spread.label }}</span>
            </div>

            <template v-if="ordered.length">
              <div class="ds-project-card__track" role="presentation">
                <span
                  v-for="(c, i) in ordered"
                  :key="c.label"
                  class="ds-project-card__segment"
                  :style="{ flexGrow: c.share, background: shareColour(i) }"
                />
              </div>
              <div class="ds-project-card__legend">
                <!-- The track is **clipped**, not counted down: entries are laid
                     out in full and the row cuts wherever it runs out. -->
                <ul class="ds-project-card__legend-track">
                  <li v-for="(c, i) in shown" :key="c.label">
                    <span class="ds-project-card__dot" :style="{ background: shareColour(i) }" />
                    <span>{{ c.label }} {{ c.share }} %</span>
                  </li>
                </ul>
                <!-- Outside the clip, so the count can never be the thing cut. -->
                <Badge
                  v-if="hidden"
                  class="ds-project-card__legend-rest"
                  :label="`+${hidden}`"
                  tone="neutral"
                  variant="pill-outline"
                  size="sm"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="ds-project-card__footer">
        <Skeleton v-if="isLoading" variant="rect" :height="12" :width="110" />
        <span v-else-if="freshness">{{ freshness }}</span>
      </div>
    </div>

    <!--
      **Last in the DOM, on purpose.** It sits on the snapshot, but a keyboard
      reaches things in source order, and a grid that goes menu, project, menu,
      project puts the afterthought before the thing itself. Placed against the
      card rather than the media, which also keeps its shadow out of the clip.

      `xs`: 32px, not the navigation bar's 36. A tile 280px wide cannot spend a
      36px disc on a menu it shares with a status pill.
    -->
    <IconButton
      v-if="!isLoading"
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
  the gap the ten variants agree on for the card's three seams: media to body,
  identity block to insight, content to footer. Not control padding, so
  ADR-0013's exemption does not cover it: either it becomes a step or it snaps
  to `spacing-md`.
*/
.ds-project-card {
  --project-card-gap: 10px;
  --project-card-share-rest: var(--ds-bg-neutral-strong);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--project-card-gap);
  box-sizing: border-box;
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
  .ds-project-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--ds-elevation-surface);
  }
}

/* ── Media ────────────────────────────────────────────────────────── */
/*
  A ratio rather than a height: the snapshot is framed on the union of the
  project's geometries, so the tile's shape is what the framing has to satisfy,
  and it has to hold at any card width.
*/
/* The clip moved here from the card. The card had to stop clipping so the
   focus ring — 4px outside the border box — is not cut off; the only thing that
   ever needed clipping was the snapshot, and it can do it itself. */
.ds-project-card__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 280 / 128;
  border-radius: var(--ds-radius-surface) var(--ds-radius-surface) 0 0;
  background-color: var(--ds-bg-neutral);
}

.ds-project-card__snapshot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ds-project-card__media-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-sm);
  color: var(--ds-text-subtle);
  font: var(--ds-font-label-md);
}

/* No edge while it waits, as drawn: the hairline is what makes the block a
   surface, and a placeholder is not one yet. `transparent` rather than `none`
   so the border box does not change — the skeleton bars sit exactly where the
   real content will, and nothing shifts on arrival. */
.ds-project-card--loading .ds-project-card__insight {
  border-color: transparent;
}

/* The snapshot's placeholder is the same `bg-pending` as the skeleton's heavy
   bars — Figma fills all of them with one value, because they are all the same
   statement. Says nothing else: no glyph, no word. */
.ds-project-card--loading .ds-project-card__media {
  background-color: var(--ds-bg-pending);
}

.ds-project-card__status {
  position: absolute;
  top: var(--ds-spacing-lg);
  left: var(--ds-spacing-lg);
}

/* Above the title's overlay, or the card would swallow the menu's clicks.
   Stacking inside one component, so the number stays literal (ADR-0020). */
.ds-project-card__more {
  position: absolute;
  z-index: 1;
  top: var(--ds-spacing-lg);
  right: var(--ds-spacing-lg);
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
  .ds-project-card__more:focus-visible {
    opacity: 1;
  }
}

/* ── Body ─────────────────────────────────────────────────────────── */
/* No padding on top: the 10px above the body is the card's own seam, so the
   media stays flush to the three edges it touches. */
.ds-project-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 1 auto;
  gap: var(--project-card-gap);
  padding: 0 var(--ds-spacing-lg) var(--ds-spacing-lg);
}

.ds-project-card__content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: var(--project-card-gap);
}

.ds-project-card__identity {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
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

.ds-project-card__title {
  flex: 1 1 auto;
  min-width: 1px;
  margin: 0;
  font: var(--ds-font-label-xl-strong);
  color: var(--ds-text-strong);
}

/*
  A `<button>` unless there is an `href`, and it inherits everything so the
  heading still looks like a heading. The truncation lives here rather than on
  the `<h3>`, because the box that overflows has to be the one that clips.
*/
.ds-project-card__link {
  display: block;
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
  gap: var(--ds-spacing-xxs);
  white-space: nowrap;
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
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
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtlest);
}

/* The figure and its unit sit on one **baseline**, not one line box: a 28px
   number and a 16px unit centred on each other would float the unit. */
.ds-project-card__metric-value {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-xs);
  white-space: nowrap;
}

.ds-project-card__metric-number {
  /* `heading-lg`, as drawn — the metric ramp starts at 30px and would swamp a
     280px tile, so the figure borrows a heading rather than a metric role. */
  font: var(--ds-font-heading-lg);
  /* Must follow `font:`, which resets font-variant-numeric (ADR-0011). */
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

.ds-project-card__metric-unit {
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
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
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
}

/* No bar under it: the line states a fact rather than labelling a scale. */
.ds-project-card__stage--bare .ds-project-card__stage-head {
  color: var(--ds-text-subtle);
}

/* `spacing-xxs` (2px), and both bars agree on it. The ordinal bar drew 3 for a
   while — off the ramp, and a gap is layout rhythm even when it is one pixel
   wide — so the file came to the code rather than the reverse. */
.ds-project-card__track {
  display: flex;
  gap: var(--ds-spacing-xxs);
  height: 6px;
}

/* `flex-grow` carries the share, so a series is as wide as it is big. The
   colour arrives inline, from `shareColour`. */
.ds-project-card__segment {
  flex: 1 1 0;
  flex-basis: 0;
  border-radius: var(--ds-radius-pill);
  background-color: var(--project-card-share-rest);
}

/*
  The legend never wraps: the overflow becomes `+N` instead, because a card that
  grows a line when a seventh crop appears stops matching its neighbours in the
  grid.
*/
/*
  Three parts, and the order matters. The **track** clips — entries are written
  out in full and the row cuts mid-word wherever the width ends. A **fade** over
  its right edge turns that cut into something deliberate. The **count** sits
  outside the clip, because the one thing that must never be truncated is the
  number saying how much was.

  `spacing-md` between entries where Figma draws 10 — the ramp goes 8 then 12.
*/
.ds-project-card__legend {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

.ds-project-card__legend-track {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 1px;
  gap: var(--ds-spacing-md);
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
}

/* The fade takes the insight's own ground, or it reads as a smudge. */
.ds-project-card__legend-track::after {
  content: '';
  position: absolute;
  inset-block: 0;
  right: 0;
  width: 32px;
  pointer-events: none;
  background: linear-gradient(to right, transparent, var(--ds-bg-neutral-subtle));
}

.ds-project-card__legend-track li {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  flex: none;
  white-space: nowrap;
  font: var(--ds-font-label-xs);
  color: var(--ds-text-subtle);
}

.ds-project-card__legend-rest {
  flex: none;
}

.ds-project-card__dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: var(--ds-radius-pill);
}

/* ── Footer ───────────────────────────────────────────────────────── */
.ds-project-card__footer {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtlest);
}
</style>
