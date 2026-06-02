import type { Meta, StoryObj } from '@storybook/vue3'
import ModuleIcon from './ModuleIcon.vue'
import ModuleIconDocs from './ModuleIcon.mdx'

const ALL_MODULES = [
  'Carbone', 'Source', 'Call', 'Scan', 'Data',
  'ID', 'Redd+', 'Survey', 'Yield', 'Forest',
  'Trace', 'Eudr',
] as const

const meta: Meta<typeof ModuleIcon> = {
  title: 'Components/ModuleIcon',
  component: ModuleIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { page: ModuleIconDocs },
  },
  argTypes: {
    module: {
      control: 'select',
      options: ALL_MODULES,
      table: {
        category: 'Contenu',
        defaultValue: { summary: "'Carbone'" },
      },
    },
    size: {
      control: 'number',
      table: {
        category: 'Apparence',
        defaultValue: { summary: '48' },
      },
    },
  },
  args: {
    module: 'Carbone',
    size: 48,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllModules: Story = {
  name: 'All modules',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ModuleIcon },
    setup: () => ({ modules: ALL_MODULES }),
    template: `
      <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center;">
        <div
          v-for="mod in modules"
          :key="mod"
          style="display:flex; flex-direction:column; align-items:center; gap:8px;"
        >
          <ModuleIcon :module="mod" :size="48" />
          <span style="font-size:11px; color:#666;">{{ mod }}</span>
        </div>
      </div>
    `,
  }),
}

export const Large: Story = {
  args: { size: 64 },
}

export const Small: Story = {
  args: { size: 32 },
}
