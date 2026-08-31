import type { Meta, StoryObj } from '@storybook/vue3'
import Card from './Card.vue'

const meta: Meta<typeof Card> = {
  title: 'Structure/Card',
  tags: ['wip', 'primitive'],
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La surface sur laquelle toute tuile ou tout panneau se pose. **Le rayon n\'est pas une prop** : ' +
          'la divergence des rayons est précisément le défaut que ce composant supprime — ' +
          'l\'inventaire produit comptait « six tuiles, quatre rayons ».',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['outlined', 'elevated', 'sunk'],
      description: '`outlined` bordure simple · `elevated` bordure + ombre · `sunk` fond d\'appui sans bordure.',
      table: { category: 'Apparence', type: { summary: "'outlined' | 'elevated' | 'sunk'" }, defaultValue: { summary: "'outlined'" } },
    },
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Appliqué identiquement à l\'en-tête, au corps et au pied.',
      table: { category: 'Apparence', type: { summary: "'none' | 'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
  },
  args: { variant: 'outlined', padding: 'md' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { Card },
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" style="max-width: 22rem">
        <p style="margin:0; font-family:var(--ds-typography-font-family-poppins); font-size:var(--ds-font-size-body-md); line-height:var(--ds-line-height-body-md); color:var(--ds-text-default)">
          Les valeurs affichées proviennent du dernier passage satellite disponible sur la zone.
        </p>
      </Card>
    `,
  }),
}

export const WithHeaderAndFooter: Story = {
  name: 'En-tête et pied',
  parameters: {
    docs: { description: { story: 'Les séparateurs n\'apparaissent que s\'il y a quelque chose à séparer.' } },
  },
  render: args => ({
    components: { Card },
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" style="max-width: 22rem; font-family:var(--ds-typography-font-family-poppins)">
        <template #header>
          <span style="font-size:var(--ds-font-size-heading-md); font-weight:var(--ds-font-weight-heading-md); color:var(--ds-text-strong)">Campagne 2026</span>
        </template>
        <p style="margin:0; font-size:var(--ds-font-size-body-md); color:var(--ds-text-default)">Douze parcelles suivies, dernière mesure le 12 août.</p>
        <template #footer>
          <span style="font-size:var(--ds-font-size-body-sm); color:var(--ds-text-subtle)">Mis à jour il y a 3 h</span>
        </template>
      </Card>
    `,
  }),
}

export const AllVariants: Story = {
  name: 'Toutes les variantes',
  render: () => ({
    components: { Card },
    setup: () => ({ variants: ['outlined', 'elevated', 'sunk'] as const }),
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
        <Card v-for="v in variants" :key="v" :variant="v">
          <span style="font-family:monospace; font-size:0.8rem; color:var(--ds-text-default)">{{ v }}</span>
        </Card>
      </div>
    `,
  }),
}
