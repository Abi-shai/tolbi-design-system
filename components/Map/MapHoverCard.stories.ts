import type { Meta, StoryObj } from '@storybook/vue3'
import MapHoverCard from './MapHoverCard.vue'

const meta: Meta<typeof MapHoverCard> = {
  title: 'Données/Map/HoverCard',
  component: MapHoverCard,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ce que le pointeur survole sur une carte (ADR-0168, façon Google Weather Lab) : le code et le statut, une ligne ' +
          'de faits, un chiffre. **Non modale et non interactive** — ni croix, ni focus, `pointer-events: none` — elle suit ' +
          'le survol, apparaît après `quick` en fondu, rien sur un écran tactile. Le clic garde sa règle : la fiche ' +
          '(`MapPanel lg closable`). Le moteur la place à côté de l’objet. Voir « Sélection d’un objet » dans Données/Map.',
      },
    },
  },
  args: { title: 'P-2041', status: 'Éligible', statusTone: 'success', meta: 'Koné Affoué · 18,5 ha', value: '412', unit: 'tCO2e' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Sans chiffre ni statut : le code et sa ligne. */
export const Minimal: Story = {
  name: 'Minimale',
  args: { status: undefined, value: undefined },
}
