import type { Meta, StoryObj } from '@storybook/vue3'
import ModulesList from './ModulesList.vue'

// Modules du design Figma (node 518:15253) — ordre et labels exacts
const FIGMA_MODULES = [
  { name: 'Carbone' as const, label: 'Carbone'  },
  { name: 'Survey'  as const, label: 'Survey'   },
  { name: 'Scan'    as const, label: 'Scan'      },
  { name: 'ID'      as const, label: 'ID'        },
  { name: 'Redd+'   as const, label: 'Redd +'   },
  { name: 'Call'    as const, label: 'Call'      },
  { name: 'Forest'  as const, label: 'Forest'   },
  { name: 'Yield'   as const, label: 'Yield'    },
  { name: 'Trace'   as const, label: 'Trace'    },
]

const meta: Meta<typeof ModulesList> = {
  title: 'Components/ModulesList',
  component: ModulesList,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
  },
  args: {
    modules: FIGMA_MODULES,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActiveModule: Story = {
  name: 'Module actif (Carbone)',
  args: {
    modules: FIGMA_MODULES.map(m => ({ ...m, active: m.name === 'Carbone' })),
  },
}

export const WithDisabledModules: Story = {
  name: 'Modules désactivés',
  args: {
    modules: FIGMA_MODULES.map(m => ({
      ...m,
      active:   m.name === 'Carbone',
      disabled: ['Redd+', 'Trace', 'Yield'].includes(m.name),
    })),
  },
}
