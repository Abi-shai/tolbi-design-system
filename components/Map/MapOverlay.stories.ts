import type { Meta, StoryObj } from '@storybook/vue3'
import MapOverlay from './MapOverlay.vue'
import MapPanel from './MapPanel.vue'
import MapControls from './MapControls.vue'

const meta: Meta<typeof MapOverlay> = {
  title: 'Données/Map/Overlay',
  component: MapOverlay,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Une place, et rien d’autre** (ADR-0087) : `MapOverlay` ne dessine pas, il pose. Six positions ' +
          '— les quatre coins et le milieu du haut et du bas — à **16 px des bords**, qui empilent ce ' +
          'qu’elles tiennent **vers le centre**, 8 px d’écart.\n\n' +
          '**Seuls ses enfants prennent le pointeur** : le cadre, lui, laisse passer le clic, sinon un ' +
          'encart invisible de la largeur de la carte avalerait le glisser-déposer qui est tout l’usage ' +
          'd’une carte.\n\n' +
          'Le conteneur de la carte doit être positionné (`position: relative`).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapOverlay>

const POSITIONS = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const

/** Les six places, sur une carte figurée. */
export const Default: Story = {
  name: 'Les six places',
  render: () => ({
    components: { MapOverlay },
    setup: () => ({ POSITIONS }),
    template: `
      <div style="position:relative;height:420px;border-radius:12px;background:var(--ds-bg-neutral);overflow:hidden">
        <MapOverlay v-for="p in POSITIONS" :key="p" :position="p">
          <span style="padding:8px 12px;border:1px solid var(--ds-border-subtle);border-radius:var(--ds-radius-control);
                       background:var(--ds-bg-default);font:var(--ds-font-label-md);color:var(--ds-text-strong)">{{ p }}</span>
        </MapOverlay>
      </div>
    `,
  }),
}

/** Deux enfants dans une place s’empilent vers le centre, pas vers le bord. */
export const Stacking: Story = {
  name: 'L’empilement va vers le centre',
  render: () => ({
    components: { MapOverlay, MapPanel, MapControls },
    setup() {
      const controls = [
        { key: 'in', icon: 'plus' as const, label: 'Zoomer' },
        { key: 'out', icon: 'minus' as const, label: 'Dézoomer' },
      ]
      return { controls }
    },
    template: `
      <div style="position:relative;height:420px;border-radius:12px;background:var(--ds-bg-neutral);overflow:hidden">
        <MapOverlay position="top-start">
          <MapPanel title="Couverture 2024">
            <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">128 parcelles · 342,8 ha</p>
          </MapPanel>
          <MapPanel title="Filtres">
            <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Campagne 2024-2025</p>
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="top-end">
          <MapControls :controls="controls" tooltip-placement="left" aria-label="Contrôles" />
        </MapOverlay>
      </div>
    `,
  }),
}
