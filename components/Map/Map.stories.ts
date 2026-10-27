import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import MapOverlay from './MapOverlay.vue'
import MapPanel from './MapPanel.vue'
import MapControls from './MapControls.vue'
import { Button } from '../Button'
import { ChartLegend } from '../ChartLegend'
import { InputDropdown } from '../Dropdown'

const meta: Meta<typeof MapOverlay> = {
  title: 'Données/Carte',
  component: MapOverlay,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Ce qui se pose sur une carte (ADR-0087), d’après le dessin du propriétaire (« Tester la conformité ») : ' +
          '`MapOverlay` est une place — six, les quatre coins et le milieu du haut et du bas — à 16 px des bords, qui empile ' +
          'ce qu’elle tient vers le centre, 8 px d’écart ; `MapPanel` est la surface (bg-default, border-subtle, ' +
          'elevation-raised, radius-surface-sm, 12 px dedans), repliable en un bouton ; `MapControls` est la pile de boutons ' +
          '— `Button` icône seule de 36 px, infobulle à gauche, un outil actif enfoncé. La légende est `ChartLegend` en ' +
          'liste (`orientation="vertical"`). Le conteneur de la carte doit être positionné.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* A stand-in for imagery: the story has no tiles to load. */
const MAP = 'position:relative; height:560px; margin:var(--ds-spacing-2xl); overflow:hidden; border-radius:var(--ds-radius-surface); background:' +
  'repeating-linear-gradient(35deg, transparent 0 46px, color-mix(in srgb, var(--ds-bg-success-solid) 10%, transparent) 46px 92px),' +
  'repeating-linear-gradient(-55deg, transparent 0 60px, color-mix(in srgb, var(--ds-border-default) 40%, transparent) 60px 120px),' +
  'var(--ds-bg-neutral);'

/** Le dessin : la consigne et l’année en haut à gauche, les contrôles en haut à droite, la barre d’outils en bas à droite, la légende en bas à gauche. */
export const OnAMap: Story = {
  name: 'Sur la carte',
  render: () => ({
    components: { MapOverlay, MapPanel, MapControls, Button, ChartLegend, InputDropdown },
    setup() {
      const drawing = ref(true)
      const zoom = ref(14)
      const year = ref('2025')
      const last = ref('—')
      const controls = computed(() => [
        { key: 'zoom-in', icon: 'plus', label: 'Zoomer', disabled: zoom.value >= 18 },
        { key: 'zoom-out', icon: 'minus', label: 'Dézoomer', disabled: zoom.value <= 3 },
        { key: 'draw', icon: 'pencil', label: 'Tracer une parcelle', pressed: drawing.value },
        { key: 'layers', icon: 'layers', label: 'Couches' },
      ])
      function act(key: string) {
        last.value = key
        if (key === 'zoom-in') zoom.value++
        if (key === 'zoom-out') zoom.value--
        if (key === 'draw') drawing.value = !drawing.value
      }
      const legend = [
        { key: 'ok', label: 'Conforme', color: 'var(--ds-bg-success-solid)', value: '61' },
        { key: 'check', label: 'À vérifier', color: 'var(--ds-bg-warning-solid)', value: '12' },
        { key: 'ko', label: 'Non conforme', color: 'var(--ds-bg-error-solid)', value: '26' },
      ]
      const years = ['2023', '2024', '2025'].map(y => ({ value: y, label: 'Campagne ' + y }))
      return { MAP, controls, act, legend, years, year, zoom, last }
    },
    template: `
      <div :style="MAP">
        <MapOverlay position="top-start">
          <MapPanel>
            <p style="margin:0; max-width:18rem; font:var(--ds-font-body-md); color:var(--ds-text-default)">Cliquez sur la carte pour poser le premier sommet de la parcelle.</p>
            <p style="margin:0; font:var(--ds-font-label-md); color:var(--ds-text-subtle)">3 parcelles · 10,7 ha</p>
          </MapPanel>
          <div style="width:13rem"><InputDropdown v-model="year" :options="years" size="sm" aria-label="Campagne" /></div>
        </MapOverlay>
        <MapOverlay position="top-end">
          <MapControls :controls="controls" @action="act" />
        </MapOverlay>
        <MapOverlay position="bottom-end">
          <MapPanel>
            <div style="display:flex; gap:var(--ds-spacing-md)">
              <Button label="Annuler le point" variant="secondary-gray" size="sm" icon-leading="undo-2" />
              <Button label="Terminer la parcelle" size="sm" />
            </div>
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="bottom-start">
          <MapPanel title="Conformité EUDR" collapsible>
            <ChartLegend :items="legend" orientation="vertical" />
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="bottom">
          <span style="font:var(--ds-font-label-md); color:var(--ds-text-subtle); background:var(--ds-bg-default); padding:var(--ds-spacing-xs) var(--ds-spacing-md); border-radius:var(--ds-radius-pill)">zoom {{ zoom }} · dernier : {{ last }}</span>
        </MapOverlay>
      </div>
    `,
  }),
}
