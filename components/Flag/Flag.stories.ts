import type { Meta, StoryObj } from '@storybook/vue3'
import Flag from './Flag.vue'
import { flags } from './registry'

const meta: Meta<typeof Flag> = {
  title: 'Identité & média/Flag',
  component: Flag,
  tags: ['stable', 'primitive'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le drapeau d’un pays (ADR-0085) — une boîte 4:3, la forme des listes de pays (4 / 7), tirée des dessins 3:2 de ' +
          'country-flag-icons (MIT), simplifiés pour les petites tailles. Le jeu est **généré** depuis ' +
          '`scripts/flags.manifest.txt` (`npm run flags`), jamais écrit à la main. **Sa taille est sa largeur** : un drapeau ' +
          'prend la place d’une icône sur une ligne. Un filet `border-inset` garde le bord d’un drapeau blanc. Décoratif par ' +
          'défaut ; `label` quand il est seul.',
      },
    },
  },
  args: { code: 'SN', size: 20 },
  argTypes: {
    code: { control: 'select', options: Object.keys(flags) },
    size: { control: 'inline-radio', options: [16, 20, 24, 32] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Les quatre tailles, et deux drapeaux à bande blanche que le filet garde lisibles sur bg-default. */
export const Sizes: Story = {
  name: 'Tailles',
  render: () => ({
    components: { Flag },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-xl)">
        <div v-for="code in ['SN', 'CI', 'JP', 'FR']" :key="code" style="display:flex; align-items:center; gap:var(--ds-spacing-xl)">
          <Flag v-for="s in [16, 20, 24, 32]" :key="s" :code="code" :size="s" />
        </div>
      </div>
    `,
  }),
}

/** Tout le manifeste. */
export const All: Story = {
  name: 'Tout le jeu',
  render: () => ({
    components: { Flag },
    setup: () => ({ codes: Object.keys(flags) }),
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(5rem, 1fr)); gap:var(--ds-spacing-lg)">
        <div v-for="c in codes" :key="c" style="display:flex; align-items:center; gap:var(--ds-spacing-md); font:var(--ds-font-label-md); color:var(--ds-text-subtle)">
          <Flag :code="c" :size="24" /> {{ c }}
        </div>
      </div>
    `,
  }),
}
