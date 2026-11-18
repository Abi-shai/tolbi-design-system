import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent } from '@storybook/test'
import { ref } from 'vue'
import Dropdown from './Dropdown.vue'
import DropdownCredits from './DropdownCredits.vue'
import DropdownItem from './DropdownItem.vue'
import DropdownDivider from './DropdownDivider.vue'

const meta: Meta<typeof DropdownCredits> = {
  title: 'Superposition/Dropdown/Credits',
  component: DropdownCredits,
  /* wip: first release, one consumer (MapTopBar's module menu). */
  tags: ['wip'],
  parameters: {
    docs: {
      description: {
        component:
          'Les crédits en tête d’un menu (ADR-0221) : un bloc qui mène aux crédits, pour le `#header` de `Dropdown`. ' +
          'Les pièces, le solde en `heading-sm`, « crédits {module} disponibles » en `body-sm`, un chevron. Survol et ' +
          'focus : `bg-neutral`. Dans un menu, c’est un élément de menu — les flèches l’atteignent. `null` : le solde ' +
          'en route, jamais `0`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** En tête du menu du module : le bloc, puis les lignes. ↓ depuis le déclencheur l’atteint en premier. */
export const InAMenu: Story = {
  name: 'En tête d’un menu',
  render: () => ({
    components: { Dropdown, DropdownCredits, DropdownItem, DropdownDivider },
    setup: () => ({ open: ref(true) }),
    template: `
      <div style="height:360px">
        <Dropdown v-model:open="open" align="start" width="18rem" button-label="Inset">
          <template #header><DropdownCredits :balance="1250" module="Inset" /></template>
          <DropdownItem icon="house" label="Aller à l’accueil" />
          <DropdownItem icon="folders" label="Retour aux projets Inset" />
          <DropdownDivider />
          <DropdownItem icon="log-out" label="Se déconnecter" tone="danger" />
        </Dropdown>
      </div>`,
  }),
  play: async () => {
    const page = within(document.body)
    const credits = await page.findByRole('menuitem', { name: /1\s250 crédits Inset disponibles/ })
    credits.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(page.getByRole('menuitem', { name: 'Aller à l’accueil' })).toHaveFocus()
  },
}

/** Le solde en route (`null`) : un repère de la hauteur du chiffre ; un lien (`href`). */
export const States: Story = {
  name: 'États',
  render: () => ({
    components: { DropdownCredits },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-md); width:17rem">
        <DropdownCredits :balance="1250" module="Inset" href="#credits" />
        <DropdownCredits :balance="null" module="Yield" />
        <DropdownCredits :balance="0" label="crédits disponibles sur l’organisation" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link')).toHaveAttribute('href', '#credits')
    await expect(canvas.getAllByRole('button')[0]).toHaveAttribute('aria-busy', 'true')
  },
}
