import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import AvatarGroup from './AvatarGroup.vue'

const AGENTS = [
  { initials: 'AB', alt: 'Aminata Bâ' },
  { initials: 'KD', alt: 'Kofi Diallo' },
  { initials: 'MS', alt: 'Mariam Sow' },
  { initials: 'OD', alt: 'Ousmane Diop' },
  { initials: 'FT', alt: 'Fatou Traoré' },
  { initials: 'IB', alt: 'Ibrahim Bâ' },
]

const meta: Meta<typeof AvatarGroup> = {
  title: 'Identité & média/AvatarGroup',
  tags: ['wip'],
  component: AvatarGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pile d\'avatars avec débordement compté. Deux états dans un même composant, comme le motif ' +
          'qu\'il remplace : la pile remplie, et l\'invite à assigner quand la liste est vide.',
      },
    },
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Contenu', type: { summary: 'AvatarGroupItem[]' } } },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg'],
      table: { category: 'Apparence', type: { summary: 'AvatarSize' }, defaultValue: { summary: "'sm'" } },
    },
    max: {
      control: { type: 'range', min: 1, max: 6, step: 1 },
      description: 'Au-delà, le reste se replie en compteur `+n`.',
      table: { category: 'Contenu', type: { summary: 'number' }, defaultValue: { summary: '4' } },
    },
    emptyLabel: { control: 'text', description: 'Affiché à la place de la pile quand `items` est vide.', table: { category: 'Contenu', type: { summary: 'string' } } },
  },
  args: { items: AGENTS, size: 'sm', max: 4, emptyLabel: 'Assigner un agent', onEmptyClick: fn() },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  name: 'État vide',
  args: { items: [] },
}

export const Sizes: Story = {
  name: 'Tailles',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { AvatarGroup },
    setup: () => ({ items: AGENTS, sizes: ['xs', 'sm', 'md', 'lg'] as const }),
    template: `
      <div style="display:flex; flex-direction:column; gap:1.5rem">
        <div v-for="s in sizes" :key="s" style="display:flex; align-items:center; gap:1rem">
          <span style="font-family:monospace; font-size:0.7rem; width:2rem; color:var(--ds-text-subtle)">{{ s }}</span>
          <AvatarGroup :items="items" :size="s" />
        </div>
      </div>
    `,
  }),
}

export const NoOverflow: Story = {
  name: 'Sans débordement',
  args: { items: AGENTS.slice(0, 3) },
}
