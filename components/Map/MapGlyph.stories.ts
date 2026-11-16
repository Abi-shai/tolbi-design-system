import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mapGlyphSvg, type MapGlyphOptions } from './mapGlyph'
import { createMapRelay, quarterZoom } from './mapMotion'

/** A glyph drawn in the document, where its colours resolve. */
const Glyph = defineComponent({
  props: { family: { type: String, required: true }, color: { type: String, required: true }, size: { type: Number, required: true }, selected: Boolean, severity: { type: String, default: undefined } },
  setup(props) {
    const el = ref<HTMLElement | null>(null)
    const draw = () => {
      if (el.value) el.value.innerHTML = mapGlyphSvg(props as unknown as MapGlyphOptions, el.value)
    }
    onMounted(draw)
    watch(() => [props.family, props.color, props.size, props.selected, props.severity], draw)
    return () => h('span', { ref: el, style: 'display:inline-block; line-height:0', 'data-glyph': `${props.family}-${props.size}` })
  },
})

const meta: Meta = {
  title: 'Données/Map/Glyph',
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'Les glyphes des points d’une carte (ADR-0190, cockpit ARR) : **deux familles, distinguées d’abord par la forme** — ' +
          'le point du projet est une pastille ronde (`land-plot`), le point de contrôle un carré arrondi (`crosshair`). Le ' +
          'fond est la couleur de la donnée, un liseré blanc et un contour encre les détachent de toute imagerie ; le ' +
          'pictogramme est à l’encre, et passe en blanc seulement où le blanc contraste mieux (WCAG) — sur la rampe ' +
          'séquentielle, son dernier palier. Choisi : contour 3 et ombre portée, l’image a une marge pour elle. Sous ' +
          '**32 px**, le viseur est le **petit** : un cercle plus petit, quatre traits courts et épais hors de lui.\n\n' +
          'Le paquet ne dessine pas la carte (ADR-0006) : `mapGlyphSvg` donne le dessin, `mapGlyphName` un nom stable, ' +
          '`loadMapGlyphs(map, glyphes)` les tramé et les ajoute à tout moteur qui a `hasImage` / `addImage` (Mapbox, ' +
          'MapLibre). Les encres ne suivent pas le thème : l’imagerie n’a pas de mode sombre.',
      },
    },
  },
}

export default meta
type Story = StoryObj

const RAMP = [1, 2, 3, 4, 5].map((n) => `var(--ds-chart-sequential-${n})`)
const COMPARE = ['var(--ds-bg-error-solid)', 'var(--ds-border-default)', 'var(--ds-bg-success-solid)']
const GROUND = "padding:24px; border-radius:var(--ds-radius-surface); background: var(--ds-map-land);"
const ROW = 'display:flex; align-items:center; gap:16px; margin-bottom:16px; font:var(--ds-font-label-md); color:var(--ds-text-subtle)'

/** Les deux familles sur la rampe de la carte, aux tailles du cockpit : projet 40 (46 au survol, choisi 56), contrôle 12 / 24 / 34. */
export const Range: Story = {
  name: 'Gamme',
  render: () => ({
    components: { Glyph },
    setup: () => ({ RAMP, COMPARE, GROUND, ROW }),
    template: `
      <div :style="GROUND">
        <div :style="ROW"><span style="width:140px">Projet · 40</span><Glyph v-for="c in RAMP" :key="c" family="project" :color="c" :size="40" /></div>
        <div :style="ROW"><span style="width:140px">Projet · survol 46</span><Glyph v-for="c in RAMP" :key="c" family="project" :color="c" :size="46" /></div>
        <div :style="ROW"><span style="width:140px">Projet · choisi 56</span><Glyph v-for="c in RAMP" :key="c" family="project" :color="c" :size="56" selected /></div>
        <div :style="ROW"><span style="width:140px">Contrôle · 12</span><Glyph v-for="c in RAMP" :key="c" family="control" :color="c" :size="12" /></div>
        <div :style="ROW"><span style="width:140px">Contrôle · 24</span><Glyph v-for="c in RAMP" :key="c" family="control" :color="c" :size="24" /></div>
        <div :style="ROW"><span style="width:140px">Contrôle · 34</span><Glyph v-for="c in RAMP" :key="c" family="control" :color="c" :size="34" /></div>
        <div :style="ROW"><span style="width:140px">« Comparer »</span><Glyph v-for="c in COMPARE" :key="c" family="project" :color="c" :size="40" /><Glyph v-for="c in COMPARE" :key="'c' + c" family="control" :color="c" :size="24" /></div>
      </div>`,
  }),
}

/**
 * Le viseur de Lucide se lit comme un simple rond à 24 px : ses traits, à l’intérieur du cercle, disparaissent.
 * Sous 32 px, le petit viseur — cercle de moitié, traits courts et épais hors de lui. À 34, celui de Lucide.
 */
export const Sight: Story = {
  name: 'Viseur aux petites tailles',
  render: () => ({
    components: { Glyph },
    setup: () => ({ GROUND, ROW, c: 'var(--ds-chart-sequential-2)', d: 'var(--ds-chart-sequential-5)' }),
    template: `
      <div :style="GROUND">
        <div :style="ROW"><span style="width:140px">12 · petit</span><Glyph family="control" :color="c" :size="12" /><Glyph family="control" :color="d" :size="12" /></div>
        <div :style="ROW"><span style="width:140px">24 · petit</span><Glyph family="control" :color="c" :size="24" /><Glyph family="control" :color="d" :size="24" /></div>
        <div :style="ROW"><span style="width:140px">31 · petit</span><Glyph family="control" :color="c" :size="31" /><Glyph family="control" :color="d" :size="31" /></div>
        <div :style="ROW"><span style="width:140px">32 · Lucide</span><Glyph family="control" :color="c" :size="32" /><Glyph family="control" :color="d" :size="32" /></div>
        <div :style="ROW"><span style="width:140px">34 · Lucide</span><Glyph family="control" :color="c" :size="34" /><Glyph family="control" :color="d" :size="34" /></div>
      </div>`,
  }),
}

/**
 * Le relais glyphe ↔ forme : un point qui a une forme est son glyphe **ou** sa forme, jamais les deux. La bascule
 * se fait quand le petit côté de la forme atteint 40 px à l’écran — la taille du glyphe. Ce qui part s’efface en se
 * resserrant (1 → 0,6) sur les 60 premiers pour cent, ce qui arrive vient sur les 60 derniers ; 300 ms
 * (`process`, `easing-out`) ; une bascule nette sous mouvement réduit. Le zoom est suivi au quart
 * (`quarterZoom`) : dans Mapbox, `['zoom']` mêlé aux données est évalué au zoom entier de la tuile.
 */
export const Relay: Story = {
  name: 'Relais glyphe ↔ forme',
  render: () => ({
    components: { Glyph },
    setup() {
      const zoom = ref(11)
      /** The parcel's short side at zoom 12 (px), doubling with each step. */
      const side = computed(() => 18 * 2 ** (zoom.value - 12))
      const threshold = 12 + Math.log2(40 / 18)
      let now = quarterZoom(zoom.value)
      const shape = ref(now >= threshold ? 1 : 0)
      const glyph = ref(1 - shape.value)
      const scale = ref(1)
      const relay = createMapRelay({
        onFrame() {
          const all = relay.active()
          const swap = all[all.length - 1]
          const settled = now >= threshold
          shape.value = swap ? swap.shape : settled ? 1 : 0
          glyph.value = swap ? swap.glyph : settled ? 0 : 1
          scale.value = swap ? swap.scale : 1
        },
      })
      watch(zoom, (z) => {
        const q = quarterZoom(z)
        if (q === now) return
        const crossed = (now < threshold) !== (q < threshold)
        const toShape = q > now
        now = q
        if (crossed) relay.push(['parcel'], toShape)
      })
      onBeforeUnmount(() => relay.stop())
      return { zoom, side, shape, glyph, scale, GROUND, threshold: threshold.toFixed(2) }
    },
    template: `
      <div>
        <label style="display:flex; gap:12px; align-items:center; margin-bottom:12px; font:var(--ds-font-label-md)">
          Zoom <input type="range" min="10" max="14" step="0.05" v-model.number="zoom" style="width:280px" data-zoom />
          <span style="font-variant-numeric:tabular-nums">{{ zoom.toFixed(2) }}</span>
          <span style="color:var(--ds-text-subtle)">— bascule à {{ threshold }}</span>
        </label>
        <div :style="GROUND + 'position:relative; height:260px; overflow:hidden'">
          <div data-shape :style="{ position:'absolute', left:'50%', top:'50%', width: side * 1.4 + 'px', height: side + 'px', transform:'translate(-50%, -50%)', background:'color-mix(in srgb, var(--ds-chart-sequential-4) 80%, transparent)', outline:'1px solid var(--ds-color-gray-light-900)', opacity: shape }" />
          <div data-glyph-wrap :style="{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%) scale(' + scale + ')', opacity: glyph, lineHeight: 0 }">
            <Glyph family="project" color="var(--ds-chart-sequential-4)" :size="40" />
          </div>
        </div>
      </div>`,
  }),
}

/**
 * **Carbone (dMRV)** (ADR-0194) — la parcelle suivie : la pastille du projet, pictogramme `leaf` (on suit le carbone de
 * la végétation). 40, 46 au survol, choisie 56. **En alerte**, un anneau de 3 px à la teinte de la gravité
 * (`--ds-chart-status-*`) : bloque, à surveiller, à revoir — l’anneau que porte aussi le contour de la parcelle. Un
 * point de contrôle peut le porter aussi.
 */
export const Monitored: Story = {
  name: 'Parcelle suivie et alertes',
  render: () => ({
    components: { Glyph },
    setup: () => ({ RAMP, GROUND, ROW, SEV: ['blocking', 'watch', 'review'] }),
    template: `
      <div :style="GROUND">
        <div :style="ROW"><span style="width:160px">Suivie · 40</span><Glyph v-for="c in RAMP" :key="c" family="monitored" :color="c" :size="40" /></div>
        <div :style="ROW"><span style="width:160px">Survol 46 · choisie 56</span><Glyph family="monitored" :color="RAMP[2]" :size="46" /><Glyph family="monitored" :color="RAMP[3]" :size="56" selected /></div>
        <div :style="ROW"><span style="width:160px">En alerte · 40</span><Glyph v-for="s in SEV" :key="s" family="monitored" :color="RAMP[3]" :size="40" :severity="s" /></div>
        <div :style="ROW"><span style="width:160px">Choisie en alerte</span><Glyph family="monitored" :color="RAMP[3]" :size="56" selected severity="blocking" /></div>
        <div :style="ROW"><span style="width:160px">Contrôle en alerte</span><Glyph v-for="s in SEV" :key="s" family="control" :color="RAMP[2]" :size="24" :severity="s" /></div>
      </div>`,
  }),
}
