import type { Meta, StoryObj } from '@storybook/vue3'
import Scrollbar from './Scrollbar.vue'

const meta: Meta<typeof Scrollbar> = {
  title: 'Primitives/Scrollbar',
  component: Scrollbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Conteneur scrollable à barre **superposée**. Le thumb est un élément en position ' +
          'absolue au-dessus du contenu : il ne prend aucune place dans la mise en page, ' +
          'contrairement à une barre native stylée qui ampute définitivement la boîte de contenu. ' +
          'Le scroll lui-même reste natif (molette, trackpad, tactile, clavier). ' +
          'Dimensionner avec `height` ou `max-height`, et ne pas surcharger son `display`.',
      },
    },
  },
  argTypes: {
    maxHeight: {
      control: 'text',
      description: 'Plafonne le viewport. Toute longueur CSS.',
      table: { category: 'Layout', type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    horizontal: {
      control: 'boolean',
      description: 'Scroll sur l\'axe x ; le thumb passe au bord bas.',
      table: { category: 'Layout', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)

export const Vertical: Story = {
  name: 'Vertical (default)',
  args: { maxHeight: '240px' },
  render: (args) => ({
    components: { Scrollbar },
    setup: () => ({ args, items: ITEMS }),
    template: `
      <Scrollbar v-bind="args" style="width: 240px; border: 1px solid #EAECF0; border-radius: 8px;">
        <div v-for="item in items" :key="item" style="padding: 10px 16px; font: 500 14px/20px Poppins, sans-serif; color: #344054; border-bottom: 1px solid #F2F4F7;">
          {{ item }}
        </div>
      </Scrollbar>
    `,
  }),
}

export const Horizontal: Story = {
  name: 'Horizontal',
  args: { horizontal: true },
  render: (args) => ({
    components: { Scrollbar },
    setup: () => ({ args, items: ITEMS }),
    template: `
      <Scrollbar v-bind="args" style="width: 320px; border: 1px solid #EAECF0; border-radius: 8px;">
        <div style="display: flex; gap: 8px; padding: 16px; width: max-content;">
          <div v-for="item in items" :key="item" style="padding: 10px 16px; font: 500 14px/20px Poppins, sans-serif; color: #344054; background: #F9FAFB; border-radius: 6px; white-space: nowrap;">
            {{ item }}
          </div>
        </div>
      </Scrollbar>
    `,
  }),
}
