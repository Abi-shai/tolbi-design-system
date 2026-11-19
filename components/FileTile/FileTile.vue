<script setup lang="ts">
import { useId } from 'vue'
import { Icon, type IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { Tooltip } from '../Tooltip'

/**
 * A file chosen by its picture (ADR-0234) — one of a report's files, in a
 * grid: the file in miniature, its name, its format. The **whole tile
 * chooses** (the file shown beside it); downloading is a separate control on
 * the picture.
 *
 * - **The picture** is the product's (`#picture`, or `src`): the package draws
 *   the frame — the basemap thumbnail's (ADR-0221): 16 / 10, a `border-subtle`
 *   hairline, `radius-inner`, `bg-default`, `elevation-control`. With neither,
 *   the format's glyph on `ModulesList`'s plate (`bg-brand-subtlest`,
 *   `text-brand`, ADR-0176).
 * - **The name** in `label-md`, two lines at most; **the format** under it — a
 *   16px glyph and « Tableau · CSV » in `body-sm` / `text-subtle`.
 * - **Downloading** is an `IconButton xs surface` (a white disc on a picture,
 *   ADR-0187's shape) at the picture's top end, named by `downloadLabel` and
 *   described by the file's name (ADR-0126). It shows on hover and on keyboard
 *   focus inside the tile, and always where there is no hover (`hover: none`)
 *   — ADR-0111's row actions. Still in the tab order. `:downloadable="false"`
 *   removes it.
 *
 * **The active file** — the one shown beside — takes the basemap picker's
 * chosen state (ADR-0221 / 0230): the tile on `bg-brand-subtle`, raised
 * (`elevation-raised`); the picture ringed in the brand (`border-brand-solid`
 * and one pixel outside it, the `focus-ring-brand` halo); the name in
 * `label-md-strong`, name and format in `text-on-brand-subtle`. It is
 * `aria-current="true"`: one of a set is the one shown, not a toggle.
 *
 * Hover takes the tray's hover (`--on-tray-hover`, ADR-0199/0234) and the
 * picture's hairline steps to `border-default`.
 */
interface Props {
  /** The file's name, as the reader knows it — « Rapport de suivi 2026 ». */
  name: string
  /** What kind of file it is, in words — « Tableau · CSV ». */
  format?: string
  /** The format's glyph, beside the format (and on the plate without a picture). */
  icon?: IconName
  /** The picture's source — or the `#picture` slot for an element of the product's own. */
  src?: string
  /** The file shown beside the grid. */
  active?: boolean
  /** The download's name (its tooltip too); the file's name describes it. */
  downloadLabel?: string
  /** `false`: no download on the tile. */
  downloadable?: boolean
}

withDefaults(defineProps<Props>(), {
  format: undefined,
  icon: 'file-text',
  src: undefined,
  active: false,
  downloadLabel: 'Télécharger',
  downloadable: true,
})

const emit = defineEmits<{
  /** The tile was pressed: show this file. */
  select: []
  /** The download was pressed. */
  download: []
}>()

defineSlots<{
  /** The file in miniature, in place of `src` — decorative. */
  picture?: () => unknown
}>()

const nameId = `ds-file-tile-name-${useId()}`
</script>

<template>
  <div class="ds-file-tile" :class="{ 'ds-file-tile--active': active }">
    <button type="button" class="ds-file-tile__choose" :aria-current="active ? 'true' : undefined" @click="emit('select')">
      <span class="ds-file-tile__picture" aria-hidden="true">
        <slot name="picture">
          <img v-if="src" :src="src" alt="" />
          <span v-else class="ds-file-tile__plate"><Icon :name="icon" :size="24" /></span>
        </slot>
      </span>
      <span class="ds-file-tile__text">
        <span :id="nameId" class="ds-file-tile__name">{{ name }}</span>
        <span v-if="format" class="ds-file-tile__format">
          <Icon :name="icon" :size="16" />
          {{ format }}
        </span>
      </span>
    </button>
    <span v-if="downloadable" class="ds-file-tile__download">
      <Tooltip :title="downloadLabel" placement="top">
        <IconButton
          icon="download"
          size="xs"
          variant="surface"
          :ariaLabel="downloadLabel"
          :aria-describedby="nameId"
          @click="emit('download')"
        />
      </Tooltip>
    </span>
  </div>
</template>

<style scoped>
.ds-file-tile {
  position: relative;
  min-width: 0;
  border-radius: var(--ds-radius-surface);
  /* token-lint-disable-next-line focus-ring-instant — the tile's elevation when it becomes the shown file, not a focus ring */
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-file-tile:hover {
  background: var(--on-tray-hover, var(--ds-bg-neutral-subtle-hover));
}

.ds-file-tile__choose {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-sm);
  width: 100%;
  padding: var(--ds-spacing-sm);
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-file-tile__choose:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* The basemap thumbnail's frame (ADR-0221), at 16 / 10. */
.ds-file-tile__picture {
  position: relative;
  display: block;
  box-sizing: border-box;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
  transition:
    border-color var(--ds-motion-duration-instant) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-file-tile:hover .ds-file-tile__picture {
  border-color: var(--ds-border-default);
}

.ds-file-tile__picture :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Without a picture: the format's glyph on `ModulesList`'s plate (ADR-0176). */
.ds-file-tile__plate {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--ds-bg-brand-subtlest);
  color: var(--ds-text-brand);
}

.ds-file-tile__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  min-width: 0;
}

.ds-file-tile__name {
  display: -webkit-box;
  overflow: hidden;
  font: var(--ds-font-label-md);
  color: var(--ds-text-strong);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ds-file-tile__format {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* The active file (ADR-0221 / 0230): the tile on the brand's tint, raised; the
   picture in the brand's ring and halo; the words in the tint's exact ink. */
.ds-file-tile--active,
.ds-file-tile--active:hover {
  background: var(--ds-bg-brand-subtle);
  box-shadow: var(--ds-elevation-raised);
}

.ds-file-tile--active .ds-file-tile__picture,
.ds-file-tile--active:hover .ds-file-tile__picture {
  border-color: var(--ds-border-brand-solid);
  box-shadow:
    0 0 0 var(--ds-border-width-default) var(--ds-border-brand-solid),
    var(--ds-focus-ring-brand),
    var(--ds-elevation-control);
}

.ds-file-tile--active .ds-file-tile__name {
  font: var(--ds-font-label-md-strong);
}

.ds-file-tile--active .ds-file-tile__name,
.ds-file-tile--active .ds-file-tile__format {
  color: var(--ds-text-on-brand-subtle);
}

/* The download, on the picture's top end, `spacing-sm` in from its corner. It
   shows with the pointer or the keyboard inside the tile (ADR-0111), always
   where nothing hovers. */
.ds-file-tile__download {
  position: absolute;
  top: calc(2 * var(--ds-spacing-sm));
  right: calc(2 * var(--ds-spacing-sm));
  display: flex;
  opacity: 0;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-file-tile:hover .ds-file-tile__download,
.ds-file-tile:has(:focus-visible) .ds-file-tile__download {
  opacity: 1;
}

@media (hover: none) {
  .ds-file-tile__download {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-file-tile,
  .ds-file-tile__download {
    transition: none;
  }
}
</style>
