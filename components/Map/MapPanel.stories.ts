import type { Meta, StoryObj } from '@storybook/vue3'
import MapPanel from './MapPanel.vue'
import { ChartLegend } from '../ChartLegend'
import { Button } from '../Button'
import { ref } from 'vue'
import MapOverlay from './MapOverlay.vue'
import { Tabs } from '../Tabs'
import { SectionCard } from '../SectionCard'
import { MetricValue } from '../MetricValue'
import { ShareBar } from '../ShareBar'
import { StatTile } from '../StatTile'

const meta: Meta<typeof MapPanel> = {
  title: 'Données/Map/Panel',
  component: MapPanel,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La **surface** d’un encart de carte (ADR-0087) : `bg-default`, `border-subtle`, ' +
          '`elevation-raised`, `radius-surface-sm`, 12 px dedans. Elle ne décide pas de sa place — c’est ' +
          '`MapOverlay` qui la pose.\n\n' +
          'Elle est plafonnée à **20rem, et ce plafond est pour du texte** : `min-width: min-content` laisse ' +
          'une rangée de boutons l’élargir, parce qu’un plafond qui coupe un contrôle en deux n’est pas un ' +
          'plafond, c’est un bug.\n\n' +
          '`collapsible` la replie en un `Button` portant son titre, à sa place, et **le focus suit** : qui ' +
          'vient de replier le panneau se retrouve sur le bouton qui le rouvre.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapPanel>

const SERIES = [
  { key: 'cacao', label: 'Cacao', value: '128 ha', color: 'var(--ds-chart-categorical-1)' },
  { key: 'hevea', label: 'Hévéa', value: '74 ha', color: 'var(--ds-chart-categorical-2)' },
  { key: 'palmier', label: 'Palmier à huile', value: '41 ha', color: 'var(--ds-chart-categorical-3)' },
]

/** Un titre et ce qu’il tient. */
export const Default: Story = {
  name: 'Titré',
  render: () => ({
    components: { MapPanel, ChartLegend },
    setup: () => ({ SERIES }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel title="Couverture 2024">
          <ChartLegend orientation="vertical" :items="SERIES" />
        </MapPanel>
      </div>
    `,
  }),
}

/** Repliable : le chevron plie le panneau en un bouton, à sa place. */
export const Collapsible: Story = {
  name: 'Repliable',
  render: () => ({
    components: { MapPanel, ChartLegend },
    setup: () => ({ SERIES }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px;min-height:200px">
        <MapPanel title="Couverture 2024" collapsible>
          <ChartLegend orientation="vertical" :items="SERIES" />
        </MapPanel>
      </div>
    `,
  }),
}

/** Le plafond de 20rem tient le texte ; une rangée de boutons l’élargit. */
export const Ceiling: Story = {
  name: 'Le plafond est pour le texte',
  render: () => ({
    components: { MapPanel, Button },
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start;background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel title="Du texte">
          <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">
            Une phrase assez longue pour atteindre le plafond de vingt rem et se replier dessous, comme elle le doit.
          </p>
        </MapPanel>
        <MapPanel title="Des contrôles">
          <div style="display:flex;gap:8px">
            <Button variant="secondary-gray" size="sm" label="Exporter la sélection" />
            <Button variant="primary" size="sm" label="Tracer" />
          </div>
        </MapPanel>
      </div>
    `,
  }),
}

/**
 * ADR-0099 — `size="lg"` : le panneau d’où l’on lit un écran (ARR). **25rem déclarés**, aussi haut que l’encart le
 * permet, une tête (`#header`, les `Tabs`) et un pied (`#footer`) qui restent, le corps qui défile entre eux.
 * **Le repli (piste A)** : le bouton est en tête, au début ; replié, le panneau devient une commande de carte à son
 * coin — `Button` icône seule, `secondary-gray`, comme `MapControls` — et la carte est entière. Le panneau rentre
 * vers son coin, la commande y arrive ; le focus suit ; la carte ne se recadre pas.
 */
export const ReadingPanel: Story = {
  name: 'Panneau de lecture (lg)',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { MapPanel, MapOverlay, Tabs, SectionCard, MetricValue, ShareBar, StatTile, Button },
    setup: () => ({
      collapsed: ref(false),
      tab: ref('vue'),
      tabs: [{ value: 'vue', label: 'Vue d’ensemble' }, { value: 'rapport', label: 'Rapport' }],
      shares: [{ label: 'Grâce au projet', share: 86 }, { label: 'Sans lui', share: 14, rest: true }],
    }),
    template: `
      <div style="position:relative;height:100vh;min-height:640px;background:var(--ds-bg-neutral);overflow:hidden">
        <MapOverlay position="top-start">
          <MapPanel v-model:collapsed="collapsed" size="lg" title="Dynamic baseline" collapsible collapse-label="Replier le panneau" expand-label="Déplier le panneau">
            <template #header><Tabs v-model="tab" :tabs="tabs" size="sm" /></template>
            <SectionCard title="Part créditable">
              <div>
                <MetricValue value="86" unit="%" size="lg" />
                <p style="margin:var(--ds-spacing-xs) 0 0;font:var(--ds-font-body-sm);color:var(--ds-text-default)">du carbone gagné depuis 2016 revient au projet</p>
              </div>
              <ShareBar :items="shares" :show-share="false" />
            </SectionCard>
            <SectionCard title="Les chiffres clés">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--ds-spacing-md)">
                <StatTile label="Crédits estimés" value="65 762" caption="tCO2e" />
                <StatTile label="|Z|, projet face aux points de contrôle" value="15,8" caption="seuil 1,96" />
                <StatTile label="Écart des points de contrôle" value="0,029" caption="seuil 0,25" />
                <StatTile label="Jeux complets" value="39" caption="sur 40 · couverture satellite 98 %" />
              </div>
            </SectionCard>
            <template #footer><Button variant="secondary-gray" icon-leading="chart-column" label="Voir toutes les données" block /></template>
          </MapPanel>
        </MapOverlay>
      </div>
    `,
  }),
}

/**
 * **En attente** (ADR-0122) : le panneau est à sa place et à sa taille, sa tête et son pied restent ; son corps est
 * `#loading` — par défaut un chiffre, des lignes et un bloc, la forme d’un panneau de lecture. Sans `title` ni
 * `#header`, la ligne de titre est elle aussi un repère.
 */
export const Loading: Story = {
  name: 'En attente',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { MapPanel, MapOverlay, Tabs, Button },
    setup: () => ({ tab: ref('data'), tabs: [{ value: 'data', label: 'Données' }, { value: 'plots', label: 'Parcelles' }] }),
    template: `
      <div style="position:relative;height:100vh;min-height:640px;background:var(--ds-bg-neutral);overflow:hidden">
        <MapOverlay position="start">
          <MapPanel size="lg" title="Suivi" loading>
            <template #header><Tabs v-model="tab" :tabs="tabs" size="sm" /></template>
            <template #footer><Button label="Voir toutes les données" variant="secondary-gray" size="sm" /></template>
          </MapPanel>
        </MapOverlay>
        <MapOverlay position="top-end">
          <MapPanel loading>…</MapPanel>
        </MapOverlay>
      </div>
    `,
  }),
}
