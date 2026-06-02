import type { Meta, StoryObj } from '@storybook/vue3'
import HelpIcon from './HelpIcon.vue'
import HelpIconDocs from './HelpIcon.mdx'

const meta: Meta<typeof HelpIcon> = {
  title: 'Components/HelpIcon',
  component: HelpIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { page: HelpIconDocs },
  },
  argTypes: {
    title: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    supportingText: {
      control: 'text',
      table: { category: 'Contenu' },
    },
    placement: {
      control: 'select',
      options: ['top', 'top-arrow', 'top-left', 'top-right', 'bottom', 'left', 'right'],
      table: { category: 'Apparence', defaultValue: { summary: "'top'" } },
    },
  },
  args: {
    title: 'This is a tooltip',
    placement: 'top',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSupportingText: Story = {
  name: 'Avec texte secondaire',
  args: {
    supportingText: 'Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.',
  },
}

export const AllPlacements: Story = {
  name: 'Toutes les positions',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { HelpIcon },
    template: `
      <div style="display:flex;gap:48px;align-items:center;justify-content:center;padding:80px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="top" title="Top (sans flèche)" />
          <span style="font-size:11px;color:#666">top</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="top-arrow" title="Top (avec flèche)" />
          <span style="font-size:11px;color:#666">top-arrow</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="top-left" title="Top left" />
          <span style="font-size:11px;color:#666">top-left</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="top-right" title="Top right" />
          <span style="font-size:11px;color:#666">top-right</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="bottom" title="Bottom" />
          <span style="font-size:11px;color:#666">bottom</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="left" title="Left" />
          <span style="font-size:11px;color:#666">left</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <HelpIcon placement="right" title="Right" />
          <span style="font-size:11px;color:#666">right</span>
        </div>
      </div>
    `,
  }),
}
