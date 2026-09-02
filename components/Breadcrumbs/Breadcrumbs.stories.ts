import type { Meta, StoryObj } from '@storybook/vue3'
import Breadcrumbs from './Breadcrumbs.vue'
import type { BreadcrumbsItem } from './Breadcrumbs.vue'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Navigation en fil d\'Ariane. Le premier élément est toujours une icône maison. Le dernier élément est mis en évidence avec la couleur brand.',
      },
    },
  },
  argTypes: {
    items: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const defaultItems: BreadcrumbsItem[] = [
  { label: 'Settings' },
  { label: '...' },
  { label: 'Team' },
]

export const Default: Story = {
  name: 'Default',
  args: { items: defaultItems },
}

export const WithLinks: Story = {
  name: 'With links',
  args: {
    items: [
      { label: 'Settings', href: '#' },
      { label: 'Team', href: '#' },
      { label: 'Members' },
    ],
  },
}

export const TwoLevels: Story = {
  name: 'Two levels',
  args: {
    items: [
      { label: 'Projects' },
      { label: 'Tolbi App' },
    ],
  },
}

export const SingleLevel: Story = {
  name: 'Single level',
  args: {
    items: [
      { label: 'Dashboard' },
    ],
  },
}

export const DeepNested: Story = {
  name: 'Deep nested',
  args: {
    items: [
      { label: 'Settings', href: '#' },
      { label: 'Organisation', href: '#' },
      { label: 'Équipe', href: '#' },
      { label: 'Membres' },
    ],
  },
}
