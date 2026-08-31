import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ResizableSplit from './ResizableSplit.vue'

const PANE = `
  height: 100%;
  padding: 1rem;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: var(--ds-font-size-body-sm);
  color: var(--ds-text-default);
  background: var(--ds-bg-neutral-subtle);
`

const meta: Meta<typeof ResizableSplit> = {
  title: 'Structure/ResizableSplit',
  tags: ['wip'],
  component: ResizableSplit,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Deux panneaux et une poignée. La poignée porte `role="separator"` avec ses valeurs ARIA et ' +
          'répond aux flèches, à Home et à End : un séparateur qui n\'obéit qu\'à la souris est ' +
          'inutilisable au clavier.',
      },
    },
  },
  argTypes: {
    modelValue: { control: { type: 'range', min: 10, max: 90, step: 1 }, description: 'Largeur du premier panneau, en pourcentage.', table: { category: 'Contenu', type: { summary: 'number' }, defaultValue: { summary: '50' } } },
    min:  { control: 'number', table: { category: 'Contrainte', type: { summary: 'number' }, defaultValue: { summary: '20' } } },
    max:  { control: 'number', table: { category: 'Contrainte', type: { summary: 'number' }, defaultValue: { summary: '80' } } },
    step: { control: 'number', description: 'Points de pourcentage par appui sur une flèche.', table: { category: 'Comportement', type: { summary: 'number' }, defaultValue: { summary: '2' } } },
    vertical: { control: 'boolean', table: { category: 'Apparence', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    ariaLabel: { control: 'text', table: { category: 'Accessibilité', type: { summary: 'string' } } },
  },
  args: { modelValue: 50, min: 20, max: 80, step: 2, vertical: false },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { ResizableSplit },
    setup: () => ({ args, ratio: ref(args.modelValue ?? 50), PANE }),
    template: `
      <div style="height:260px; border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-xl); overflow:hidden">
        <ResizableSplit v-bind="args" v-model="ratio" style="height:100%">
          <template #start><div :style="PANE">Carte · {{ Math.round(ratio) }} %</div></template>
          <template #end><div :style="PANE">Liste des parcelles</div></template>
        </ResizableSplit>
      </div>
    `,
  }),
}

export const Vertical: Story = {
  name: 'Vertical',
  args: { vertical: true },
  render: args => ({
    components: { ResizableSplit },
    setup: () => ({ args, ratio: ref(40), PANE }),
    template: `
      <div style="height:320px; border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-xl); overflow:hidden">
        <ResizableSplit v-bind="args" v-model="ratio" style="height:100%">
          <template #start><div :style="PANE">Graphique · {{ Math.round(ratio) }} %</div></template>
          <template #end><div :style="PANE">Tableau de relevés</div></template>
        </ResizableSplit>
      </div>
    `,
  }),
}

export const Constrained: Story = {
  name: 'Bornes serrées',
  args: { min: 35, max: 65 },
  parameters: { docs: { description: { story: 'La poignée refuse de sortir des bornes, à la souris comme au clavier.' } } },
  render: args => ({
    components: { ResizableSplit },
    setup: () => ({ args, ratio: ref(50), PANE }),
    template: `
      <div style="height:220px; border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-xl); overflow:hidden">
        <ResizableSplit v-bind="args" v-model="ratio" style="height:100%">
          <template #start><div :style="PANE">min 35 %</div></template>
          <template #end><div :style="PANE">max 65 %</div></template>
        </ResizableSplit>
      </div>
    `,
  }),
}
