import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from './Logo.vue'

const meta: Meta<typeof Logo> = {
  title: 'Identité & média/Logo',
  component: Logo,
  tags: ['wip', 'primitive'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'nav'],
      table: {
        category: 'Apparence',
        defaultValue: { summary: "'default'" },
      },
    },
    alt: {
      control: 'text',
      table: {
        category: 'Accessibilité',
        defaultValue: { summary: "'Tolbi'" },
      },
    },
  },
  args: {
    alt:     'Tolbi',
    variant: 'default',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default — icon + wordmark',
}

export const Nav: Story = {
  name: 'Nav — wordmark compact (fond sombre)',
  args: { variant: 'nav' },
  parameters: {
    backgrounds: { default: 'Brand' },
  },
}

export const BothVariants: Story = {
  name: 'Les deux variantes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Logo },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <span style="font-size:12px;color:#667085;font-family:Poppins,sans-serif;">default — fond clair</span>
          <Logo variant="default" />
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;background:#066938;padding:16px;border-radius:8px;">
          <span style="font-size:12px;color:rgba(255,255,255,0.6);font-family:Poppins,sans-serif;">nav — fond sombre</span>
          <Logo variant="nav" />
        </div>
      </div>
    `,
  }),
}
