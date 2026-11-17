import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent, fn } from '@storybook/test'
import ActionList from './ActionList.vue'
import ActionListItem from './ActionListItem.vue'
import { AvatarGroup } from '../AvatarGroup'
import { CreditCoins } from '../CreditCoins'
import { ModuleIconStack } from '../ModuleIconStack'

const meta: Meta<typeof ActionList> = {
  title: 'Navigation/ActionList',
  component: ActionList,
  /* wip: first release — the home page's right column is its one consumer. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Les actions rapides de l’accueil (ADR-0208) : un `Tray` titré, et sur sa surface blanche une pile de ' +
          '`ActionListItem`, `spacing-xs` entre elles. Chaque ligne est un vrai lien (`href`) ou un bouton : une plaque ' +
          '3rem au gris du plateau qui porte une illustration libre (`#media`, décorative), le titre à l’infinitif sur ' +
          'une ligne et un `Badge` facultatif à côté, une ligne dessous, un chevron qui garde sa place. Le titre est le ' +
          'nom du contrôle ; le badge et la ligne sont lus après. Survol et focus : ceux d’un plateau (ADR-0199/0207).',
      },
    },
  },
  args: { title: 'Actions rapides' },
}

export default meta
type Story = StoryObj<typeof meta>

const COLUMN = 'width: 21.5rem'

/**
 * Le bloc de la colonne de droite, tel que le produit le passe : les membres (deux silhouettes), les crédits (les
 * pièces de `CreditCost`), les guides (les logos des modules de l’utilisateur, deux au plus).
 */
export const Default: Story = {
  name: 'Actions rapides',
  args: { onSelect: fn() } as never,
  render: args => ({
    components: { ActionList, ActionListItem, AvatarGroup, CreditCoins, ModuleIconStack },
    setup: () => ({ args, COLUMN }),
    template: `
      <div :style="COLUMN">
        <ActionList :title="args.title">
          <ActionListItem title="Inviter des membres" description="1 membre" href="#membres" @select="args.onSelect">
            <template #media><AvatarGroup :items="[{}, {}]" size="xs" /></template>
          </ActionListItem>
          <ActionListItem title="Gérer les crédits" description="Solde et tarifs" href="#credits">
            <template #media><CreditCoins :size="32" /></template>
          </ActionListItem>
          <ActionListItem title="Se former" description="Guides de tes modules" href="#aide" badge="Recommandé" badge-tone="brand">
            <template #media><ModuleIconStack :modules="['Yield', 'Scan']" /></template>
          </ActionListItem>
        </ActionList>
      </div>`,
  }),
  /* Guarded: three links named by their titles alone, described by the badge and the line; a modified click is the browser's. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('region', { name: 'Actions rapides' })).toBeTruthy()
    const links = canvas.getAllByRole('link')
    await expect(links).toHaveLength(3)
    await expect(links[0]).toHaveAccessibleName('Inviter des membres')
    await expect(links[0]).toHaveAccessibleDescription('1 membre')
    await expect(links[2]).toHaveAccessibleName('Se former')
    await expect(links[2]).toHaveAccessibleDescription('Recommandé Guides de tes modules')
    const onSelect = (args as unknown as { onSelect: ReturnType<typeof fn> }).onSelect
    const first = links[0]
    for (const mod of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
      first.addEventListener('click', e => e.preventDefault(), { once: true })
      first.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, [mod]: true }))
    }
    await expect(onSelect).not.toHaveBeenCalled()
    first.addEventListener('click', e => e.preventDefault(), { once: true })
    await userEvent.click(first)
    await expect(onSelect).toHaveBeenCalledTimes(1)
  },
}

/**
 * Un titre long : il se coupe d’abord, le badge reste entier juste après lui, le chevron ne bouge pas.
 */
export const LongTitle: Story = {
  name: 'Titre long',
  render: args => ({
    components: { ActionList, ActionListItem, ModuleIconStack },
    setup: () => ({ args, COLUMN }),
    template: `
      <div :style="COLUMN">
        <ActionList :title="args.title">
          <ActionListItem title="Se former aux modules de ton équipe" description="Guides, vidéos et webinaires de tes modules" href="#aide" badge="Recommandé" badge-tone="brand">
            <template #media><ModuleIconStack :modules="['Yield', 'Scan']" /></template>
          </ActionListItem>
        </ActionList>
      </div>`,
  }),
}

/**
 * Quand la place manque vraiment : le titre se coupe jusqu’à 3rem ; si le badge ne tient plus entier à côté, il
 * passe hors de vue — jamais coupé, jamais sur le chevron — et reste lu. Sans `href`, la ligne est un bouton.
 */
export const Narrow: Story = {
  name: 'Colonne étroite',
  render: args => ({
    components: { ActionList, ActionListItem, AvatarGroup, CreditCoins, ModuleIconStack },
    setup: () => ({ args }),
    template: `
      <div style="width: 18rem">
        <ActionList :title="args.title">
          <ActionListItem title="Inviter des membres de l’équipe" description="12 membres, 3 invitations en attente">
            <template #media><AvatarGroup :items="[{}, {}]" size="xs" /></template>
          </ActionListItem>
          <ActionListItem title="Se former aux modules" description="Guides de tes modules" badge="Recommandé" badge-tone="brand">
            <template #media><ModuleIconStack :modules="['Yield', 'Scan', 'Source']" /></template>
          </ActionListItem>
        </ActionList>
      </div>`,
  }),
}
