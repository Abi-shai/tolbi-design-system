import type { Meta, StoryObj } from '@storybook/vue3'
import Tooltip from './Tooltip.vue'
import TooltipDocs from './Tooltip.mdx'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { page: TooltipDocs },
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
    arrow: {
      control: 'select',
      options: ['none', 'bottom-center', 'bottom-left', 'bottom-right', 'top-center', 'left', 'right'],
      table: { category: 'Apparence', defaultValue: { summary: "'none'" } },
    },
  },
  args: {
    title: 'This is a tooltip',
    arrow: 'none',
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

export const BottomCenter: Story = {
  name: 'Flèche — bottom center',
  args: { arrow: 'bottom-center' },
}

export const BottomLeft: Story = {
  name: 'Flèche — bottom left',
  args: { arrow: 'bottom-left' },
}

export const BottomRight: Story = {
  name: 'Flèche — bottom right',
  args: { arrow: 'bottom-right' },
}

export const TopCenter: Story = {
  name: 'Flèche — top center',
  args: { arrow: 'top-center' },
}

export const Left: Story = {
  name: 'Flèche — left',
  args: { arrow: 'left' },
}

export const Right: Story = {
  name: 'Flèche — right',
  args: { arrow: 'right' },
}

export const AllArrows: Story = {
  name: 'Toutes les directions',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Tooltip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:center;justify-content:center;padding:32px;">
        <Tooltip title="none"          arrow="none" />
        <Tooltip title="bottom-center" arrow="bottom-center" />
        <Tooltip title="bottom-left"   arrow="bottom-left" />
        <Tooltip title="bottom-right"  arrow="bottom-right" />
        <Tooltip title="top-center"    arrow="top-center" />
        <Tooltip title="left"          arrow="left" />
        <Tooltip title="right"         arrow="right" />
      </div>
    `,
  }),
}

export const AllArrowsRich: Story = {
  name: 'Toutes les directions — avec texte secondaire',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Tooltip },
    setup: () => ({
      supporting: 'Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text.',
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;align-items:flex-start;padding:32px;">
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="none" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="bottom-center" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="bottom-left" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="bottom-right" />
        <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="top-center" />
        <div style="display:flex;gap:32px;">
          <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="left" />
          <Tooltip title="This is a tooltip" :supporting-text="supporting" arrow="right" />
        </div>
      </div>
    `,
  }),
}
