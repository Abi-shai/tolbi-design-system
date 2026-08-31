import type { Meta, StoryObj } from '@storybook/vue3'
import StatTile from './StatTile.vue'

const meta: Meta<typeof StatTile> = {
  title: 'Données/StatTile',
  tags: ['wip'],
  component: StatTile,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tuile de statistique. Compose `Card` et `MetricValue` plutôt que de redessiner une surface ' +
          '(ADR-0001) : **aucune prop ici ne peut changer le rayon**, puisque « six tuiles, quatre rayons » ' +
          'est le défaut que ce composant supprime.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    value: { control: 'text', description: 'Affiche `—` si absente.', table: { category: 'Contenu', type: { summary: 'string' } } },
    unit:  { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    delta: { control: 'text', table: { category: 'Contenu', type: { summary: 'string' } } },
    trend: { control: 'inline-radio', options: ['up', 'down', 'flat'], table: { category: 'Contenu', defaultValue: { summary: "'flat'" } } },
    tag:   { control: 'text', description: 'Qualificatif court à côté de l\'étiquette — `Mesuré`, `Estimé`.', table: { category: 'Contenu', type: { summary: 'string' } } },
    tagColor: { control: 'text', table: { category: 'Apparence', type: { summary: 'BadgeColor' }, defaultValue: { summary: "'gray'" } } },
    loading: { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
  },
  args: { label: 'Rendement moyen', value: '4,82', unit: 't/ha', delta: '+12 %', trend: 'up', tag: 'Mesuré', loading: false },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { StatTile },
    setup: () => ({ args }),
    template: `<div style="max-width:20rem"><StatTile v-bind="args" /></div>`,
  }),
}

export const Row: Story = {
  name: 'Rangée de tuiles',
  parameters: { docs: { description: { story: 'Toutes les tuiles partagent le rayon de `Card` — c\'est le point.' } } },
  render: () => ({
    components: { StatTile },
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem">
        <StatTile label="Surface suivie" value="1 248" unit="ha" tag="Déclaré" />
        <StatTile label="Rendement moyen" value="4,82" unit="t/ha" delta="+12 %" trend="up" tag="Mesuré" tag-color="success" />
        <StatTile label="Écart au modèle" value="3,4" unit="%" delta="−0,8 pt" trend="down" tag="Estimé" tag-color="warning" />
        <StatTile label="Parcelles actives" value="86" />
      </div>
    `,
  }),
}

export const Loading: Story = {
  name: 'Chargement',
  args: { loading: true },
  render: args => ({
    components: { StatTile },
    setup: () => ({ args }),
    template: `<div style="max-width:20rem"><StatTile v-bind="args" /></div>`,
  }),
}

export const NoValue: Story = {
  name: 'Sans valeur',
  args: { value: undefined, delta: undefined, tag: undefined },
  render: args => ({
    components: { StatTile },
    setup: () => ({ args }),
    template: `<div style="max-width:20rem"><StatTile v-bind="args" /></div>`,
  }),
}
