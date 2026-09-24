import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from './Logo.vue'
import ModuleIcon from '../ModuleIcon/ModuleIcon.vue'
import { ARTWORK_SIZES } from '../artwork-size'

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
    size: {
      control: 'inline-radio',
      options: ARTWORK_SIZES,
      table: {
        category: 'Apparence',
        defaultValue: { summary: '32' },
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
    size:    32,
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

export const Scale: Story = {
  name: "L'échelle",
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Logo },
    setup: () => ({ sizes: ARTWORK_SIZES }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;align-items:flex-start;">
        <div v-for="s in sizes" :key="s" style="display:flex;align-items:center;gap:16px;">
          <span style="font-family:monospace;font-size:0.7rem;color:var(--ds-text-subtle);width:3ch;">{{ s }}</span>
          <Logo :size="s" />
        </div>
      </div>
    `,
  }),
}

/**
 * La raison d'être de l'échelle partagée : à un cran donné, la marque de la
 * brand et celle d'un module font **la même hauteur**. Avant, `Logo` disait
 * `sm | md` et `ModuleIcon` un nombre libre — la phrase n'était pas exprimable.
 */
export const SharedLadder: Story = {
  name: "L'échelle partagée — Logo ⇄ ModuleIcon",
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Logo, ModuleIcon },
    setup: () => ({ sizes: ARTWORK_SIZES }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;align-items:flex-start;">
        <div v-for="s in sizes" :key="s" style="display:flex;align-items:center;gap:16px;">
          <span style="font-family:monospace;font-size:0.7rem;color:var(--ds-text-subtle);width:3ch;">{{ s }}</span>
          <Logo :size="s" />
          <ModuleIcon module="Yield" variant="illustration" :size="s" :aria-label="null" />
          <ModuleIcon module="Carbone" variant="illustration" :size="s" :aria-label="null" />
        </div>
      </div>
    `,
  }),
}
