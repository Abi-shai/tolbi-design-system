import type { Meta, StoryObj } from '@storybook/vue3'
import CreditCoins from './CreditCoins.vue'

const meta: Meta<typeof CreditCoins> = {
  title: 'Identité & média/CreditCoins',
  component: CreditCoins,
  tags: ['wip', 'primitive'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Les pièces des crédits (ADR-0208) — le dessin du propriétaire (Figma `3734:2260`), sorti de `CreditCost` ' +
          '(qui le rend) pour servir ailleurs : la plaque « Gérer les crédits » des actions rapides. `size` est sa ' +
          'hauteur (ADR-0043), la largeur suit le dessin (64:56). Toujours décoratif : les mots à côté disent ce que ' +
          'sont les pièces.',
      },
    },
  },
  argTypes: { size: { control: 'number' } },
  args: { size: 56 },
}

export default meta
type Story = StoryObj<typeof meta>

/** À sa hauteur native, 56 — celle de `CreditCost`. */
export const Default: Story = {}

/** À 32, sur la plaque 3rem d’une ligne d’action. */
export const OnPlate: Story = {
  name: 'Sur une plaque',
  render: () => ({
    components: { CreditCoins },
    template: `
      <span style="display:flex; align-items:center; justify-content:center; width:3rem; height:3rem; border-radius:var(--ds-radius-surface); background:var(--ds-bg-neutral-subtle)">
        <CreditCoins :size="32" />
      </span>`,
  }),
}
