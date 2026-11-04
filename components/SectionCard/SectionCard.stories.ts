import type { Meta, StoryObj } from '@storybook/vue3'
import SectionCard from './SectionCard.vue'
import { MetricValue } from '../MetricValue'
import { ShareBar } from '../ShareBar'
import { StatTile } from '../StatTile'
import { Badge } from '../Badge'
import { ChartFrame } from '../ChartFrame'
import { ChartLegend } from '../ChartLegend'

const meta: Meta<typeof SectionCard> = {
  title: 'Structure/SectionCard',
  component: SectionCard,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un bloc titré : un titre, une phrase, puis son contenu, sur le fond `Card sunk` (ADR-0097). C’était ' +
          '`FormSection` (ADR-0094) ; le panneau ARR a dessiné le même objet autour de chiffres et d’une courbe, ' +
          'donc c’est un seul composant, et `FormSection` en reste l’alias. Un titre (`h3`, `headingLevel`), pas ' +
          'un `<fieldset>`. `#actions` sur la ligne du titre : un `Badge`, un lien. 16 entre les enfants, 20 sous ' +
          'l’en-tête et en marge, aucune marge extérieure.',
      },
    },
  },
  args: { title: 'Les chiffres clés', headingLevel: 3 },
  argTypes: { headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] } },
}

export default meta
type Story = StoryObj<typeof SectionCard>

/** Le panneau « Vue d’ensemble » de la Dynamic baseline (ARR) : trois blocs, trois contenus, un seul composant. */
export const Overview: Story = {
  name: 'Vue d’ensemble (ARR)',
  render: () => ({
    components: { SectionCard, MetricValue, ShareBar, StatTile, Badge, ChartFrame, ChartLegend },
    setup: () => ({
      shares: [{ label: 'Grâce au projet', share: 86 }, { label: 'Sans lui', share: 14, rest: true }],
      lines: [
        { key: 'p', label: 'Points du projet', shape: 'line', color: 'var(--ds-chart-categorical-1)' },
        { key: 'c', label: 'Points de contrôle', shape: 'dashed', color: 'var(--ds-chart-categorical-5)' },
      ],
    }),
    template: `
      <div style="width:368px;display:flex;flex-direction:column;gap:var(--ds-spacing-xl)">
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
        <SectionCard title="Indice de stock">
          <template #actions><Badge label="7× plus vite" tone="success" icon="trending-up" size="sm" /></template>
          <ChartFrame :height="96" :grid="false" :x-ticks="['2016', '2021', '2026']">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block">
              <polyline points="0,92 30,88 60,72 100,62 140,52 180,44 220,32 260,30 300,22" fill="none" stroke="var(--ds-chart-categorical-1)" stroke-width="2" vector-effect="non-scaling-stroke" />
              <polyline points="0,92 60,90 120,88 180,86 240,84 300,80" fill="none" stroke="var(--ds-chart-categorical-5)" stroke-width="2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke" />
            </svg>
          </ChartFrame>
          <ChartLegend :items="lines" />
        </SectionCard>
      </div>
    `,
  }),
}

/** Sans phrase, avec une action en tête. */
export const WithActions: Story = {
  name: 'Avec une action',
  render: (args) => ({
    components: { SectionCard, Badge },
    setup: () => ({ args }),
    template: `
      <div style="width:368px">
        <SectionCard v-bind="args" title="Indice de stock">
          <template #actions><Badge label="7× plus vite" tone="success" icon="trending-up" size="sm" /></template>
          <p style="margin:0;font:var(--ds-font-body-md);color:var(--ds-text-default)">Le contenu du bloc.</p>
        </SectionCard>
      </div>
    `,
  }),
}
