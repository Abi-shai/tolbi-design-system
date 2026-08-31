import type { Meta, StoryObj } from '@storybook/vue3'
import Skeleton from './Skeleton.vue'

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback & chargement/Skeleton',
  tags: ['wip', 'primitive'],
  component: Skeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Réserve de place pendant le chargement. Toujours `aria-hidden` : c\'est le conteneur qui ' +
          'annonce l\'état, pas chaque placeholder. `Table` le consomme pour ses lignes de chargement (ADR-0001).',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['text', 'rect', 'circle'],
      table: { category: 'Apparence', type: { summary: "'text' | 'rect' | 'circle'" }, defaultValue: { summary: "'text'" } },
    },
    width:  { control: 'text', table: { category: 'Apparence', type: { summary: 'number | string' } } },
    height: { control: 'text', table: { category: 'Apparence', type: { summary: 'number | string' } } },
    lines: {
      control: { type: 'range', min: 1, max: 6, step: 1 },
      description: '`text` uniquement — plusieurs lignes, la dernière raccourcie comme de la vraie prose.',
      table: { category: 'Contenu', type: { summary: 'number' }, defaultValue: { summary: '1' } },
    },
  },
  args: { variant: 'text', lines: 1 },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  name: 'Variantes',
  render: () => ({
    components: { Skeleton },
    template: `
      <div style="display:flex; flex-direction:column; gap:1.5rem; max-width:24rem">
        <Skeleton variant="text" />
        <Skeleton variant="rect" />
        <Skeleton variant="circle" />
      </div>
    `,
  }),
}

export const Paragraph: Story = {
  name: 'Paragraphe',
  args: { variant: 'text', lines: 4 },
  parameters: {
    docs: { description: { story: 'La dernière ligne est raccourcie à 60 % pour éviter le bloc rectangulaire.' } },
  },
  render: args => ({
    components: { Skeleton },
    setup: () => ({ args }),
    template: `<div style="max-width:24rem"><Skeleton v-bind="args" /></div>`,
  }),
}

export const CardPlaceholder: Story = {
  name: 'Dans une carte',
  render: () => ({
    components: { Skeleton },
    template: `
      <div style="display:flex; gap:1rem; align-items:flex-start; max-width:24rem; padding:1.25rem; border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-xl)">
        <Skeleton variant="circle" width="40px" height="40px" />
        <div style="flex:1; display:flex; flex-direction:column; gap:0.5rem">
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" :lines="2" />
        </div>
      </div>
    `,
  }),
}
