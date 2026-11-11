<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { Button } from '../Button'
import { Card } from '../Card'
import { IconButton } from '../IconButton'
import { ProjectGlyph, type ProjectGlyphKind, type ProjectGlyphStatus } from '../ProjectGlyph'
import { Skeleton } from '../Skeleton'
import { Tooltip } from '../Tooltip'
import { useFormField } from '../FormField/context'

/** The drawing that stands for the zone — the product's (ADR-0107). */
export interface ZoneFieldGlyph {
  kind: ProjectGlyphKind
  status?: ProjectGlyphStatus
  /** Parcels stacked: 3 for producers or a file, 1 for a drawn parcel (ADR-0148). */
  count?: number
  /** The project's id, so the drawing is stable for it. */
  seed?: string | number
}

/**
 * The zone a project covers (ADR-0157). One shell in every state — `Card sunk`,
 * a title, a sentence — and one element under it that changes: a button while
 * empty, the result once filled (the zone's drawing, its area, the method).
 * The window that chooses the zone is the product's: the field only emits
 * `define`, `edit` and `remove`. **`method` decides** that the field is filled.
 */
export interface ZoneFieldProps {
  title?: string
  description?: string
  /** In hectares; `'pending'` while it is computed; `null` when it is unknown. */
  area?: number | 'pending' | null
  /** How the zone was given, in words and without a figure — « Mes producteurs ». Its presence fills the field. */
  method?: string
  glyph?: ZoneFieldGlyph
  /** Filled, without its two actions — a project being edited, a baseline launched from a zone. */
  readonly?: boolean
  disabled?: boolean
  locale?: string
  defineLabel?: string
  editLabel?: string
  removeLabel?: string
  unknownAreaLabel?: string
  /** Read in place of the placeholder while the area is computed. */
  pendingAreaLabel?: string
}

const props = withDefaults(defineProps<ZoneFieldProps>(), {
  title: 'Zone du projet',
  description: 'Choisissez une méthode pour délimiter la zone de votre projet.',
  area: null,
  method: undefined,
  glyph: () => ({ kind: 'zone' }),
  readonly: false,
  disabled: false,
  locale: 'fr-FR',
  defineLabel: 'Définir la zone',
  editLabel: 'Modifier la zone',
  removeLabel: 'Retirer la zone',
  unknownAreaLabel: 'Surface inconnue',
  pendingAreaLabel: 'Surface en calcul',
})

const emit = defineEmits<{
  /** Empty: choose a zone. */
  define: []
  /** Filled: change it. */
  edit: []
  /** Filled: take it away — at once, no question; the product offers « Annuler » (ADR-0157). */
  remove: []
}>()

const field = useFormField()
const uid = useId()
const titleId = `ds-zone-field-${uid}-title`
const descriptionId = `ds-zone-field-${uid}-description`

const isDisabled = computed(() => (field?.disabled.value ?? false) || props.disabled)
const isInvalid = computed(() => field?.invalid.value ?? false)
const filled = computed(() => Boolean(props.method))
const describedBy = computed(() => [descriptionId, field?.describedBy.value].filter(Boolean).join(' '))

/*
  The area in the locale's words, never abbreviated: one decimal under 10 ha
  (« 0,4 ha »), whole hectares above, the locale's thousands separator
  (« 12 480 ha »). `Intl`'s own unit, so the space before « ha » is the
  locale's too, and a line never breaks between the figure and its unit.
*/
const areaText = computed(() => {
  if (typeof props.area !== 'number') return null
  const n = props.area
  return new Intl.NumberFormat(props.locale, {
    style: 'unit',
    unit: 'hectare',
    unitDisplay: 'short',
    maximumFractionDigits: Math.abs(n) < 10 ? 1 : 0,
  }).format(n)
})

/*
  `remove` takes away the button that was pressed: once the product has
  emptied the field, the focus goes to « Définir la zone », where the next
  move is — not to the page's body.
*/
const root = ref<HTMLElement | null>(null)
let refocus = false

function onRemove() {
  refocus = true
  emit('remove')
}

watch(filled, (now) => {
  if (now || !refocus) return
  refocus = false
  nextTick(() => root.value?.querySelector<HTMLElement>('.ds-zone-field__define')?.focus())
})
</script>

<template>
  <div
    :id="field?.id.value"
    ref="root"
    class="ds-zone-field"
    :class="{ 'ds-zone-field--invalid': isInvalid, 'ds-zone-field--disabled': isDisabled }"
    role="group"
    :aria-labelledby="titleId"
    :aria-describedby="describedBy"
  >
    <Card variant="sunk" padding="md" class="ds-zone-field__card">
      <p :id="titleId" class="ds-zone-field__title">{{ title }}</p>
      <p :id="descriptionId" class="ds-zone-field__description">{{ description }}</p>

      <!-- Empty: the one way in. -->
      <Button
        v-if="!filled"
        class="ds-zone-field__define"
        variant="secondary-gray"
        size="sm"
        icon-leading="map"
        :label="defineLabel"
        :disabled="isDisabled"
        @click="emit('define')"
      />

      <!-- Filled: what was chosen, and how. -->
      <div v-else class="ds-zone-field__zone" :aria-busy="area === 'pending' || undefined">
        <span class="ds-zone-field__glyph">
          <ProjectGlyph :kind="glyph.kind" :status="glyph.status" :count="glyph.count" :seed="glyph.seed" :size="40" />
        </span>
        <p class="ds-zone-field__text">
          <span class="ds-zone-field__hidden">{{ title }} : </span>
          <span v-if="area === 'pending'" class="ds-zone-field__area ds-zone-field__area--pending">
            <Skeleton variant="text" emphasis="strong" surface="tinted" :width="72" :height="16" />
            <span class="ds-zone-field__hidden">{{ pendingAreaLabel }}</span>
          </span>
          <span v-else-if="areaText" class="ds-zone-field__area">{{ areaText }}</span>
          <span v-else class="ds-zone-field__area ds-zone-field__area--unknown">{{ unknownAreaLabel }}</span>
          <span class="ds-zone-field__hidden">, </span>
          <span class="ds-zone-field__method">{{ method }}</span>
        </p>
        <span v-if="!readonly" class="ds-zone-field__actions">
          <Tooltip :title="editLabel" placement="top">
            <IconButton icon="square-pen" variant="ghost" size="sm" :ariaLabel="editLabel" :disabled="isDisabled" @click="emit('edit')" />
          </Tooltip>
          <Tooltip :title="removeLabel" placement="top">
            <IconButton icon="x" variant="ghost" size="sm" :ariaLabel="removeLabel" :disabled="isDisabled" @click="onRemove" />
          </Tooltip>
        </span>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.ds-zone-field {
  min-width: 0;
}

/* The field's error is the box's (ADR-0157): a control's border in the error's
   solid, the sunk ground kept. The message is FormField's, under the block. */
.ds-zone-field--invalid .ds-zone-field__card {
  border-color: var(--ds-border-error-solid);
}

.ds-zone-field__card :deep(.ds-card__body) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ds-zone-field__title {
  margin: 0;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
}

/* Title → sentence 4, sentence → what changes 12 (FormSection's 4, ADR-0094). */
.ds-zone-field__description {
  margin: var(--ds-spacing-xs) 0 var(--ds-spacing-lg);
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

/*
  Filled: the brand's tint, no border, the control's corner. One height
  whatever the drawing: the glyph sits in a 52px slot, the box a pile of
  parcels takes (ADR-0148), so a drawn parcel and three producers' parcels
  stand on the same row.
*/
.ds-zone-field__zone {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  align-self: stretch;
  min-width: 0;
  padding: var(--ds-spacing-md);
  padding-inline-end: var(--ds-spacing-md);
  border-radius: var(--ds-radius-control);
  background-color: var(--ds-bg-brand-subtle);
}

.ds-zone-field__glyph {
  display: grid;
  place-items: center;
  flex: none;
  width: 52px;
  height: 52px;
}

.ds-zone-field__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  margin: 0;
}

/* Line 1: the area, the result. The placeholder sits in its line box, so the
   row does not move when the figure arrives. */
.ds-zone-field__area {
  display: block;
  min-height: 24px;
  font: var(--ds-font-label-lg-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-zone-field__area--pending {
  display: flex;
  align-items: center;
}

.ds-zone-field__area--unknown {
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

/* Line 2: how — words, no figure. */
.ds-zone-field__method {
  display: block;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-zone-field__actions {
  display: flex;
  flex: none;
  gap: var(--ds-spacing-xs);
}

/* On the tint, `bg-hover` is the tint again (1.0:1): the actions take the row
   actions' veil, which stacks on any ground (ADR-0111). */
.ds-zone-field__actions :deep(.ds-icon-button--ghost:is(:hover, .ds-icon-button--active):not(:disabled)) {
  background: color-mix(in srgb, var(--ds-text-strong) 7%, transparent);
  color: var(--ds-text-strong);
}

/* Disabled, as every field: the ink greys, the drawing fades (OptionCard's
   muted 0.4), the ground stays. */
.ds-zone-field--disabled .ds-zone-field__glyph { opacity: 0.4; }
.ds-zone-field--disabled :is(.ds-zone-field__area, .ds-zone-field__method) { color: var(--ds-text-disabled); }

.ds-zone-field__hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
