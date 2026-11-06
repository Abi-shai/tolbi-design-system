import type { Meta, StoryObj } from '@storybook/vue3'
import MapStatus from './MapStatus.vue'

const meta: Meta<typeof MapStatus> = {
  title: 'Données/Map/Status',
  component: MapStatus,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Ce qui manque à une carte, dit **sur la carte** (ADR-0122) — une pastille au-dessus de la frise ' +
          '(`MapOverlay position="bottom"`, après la frise), jamais à la place de la carte, qui reste là et manipulable.\n\n' +
          'Un `state`, et le composant le dessine : **l’état choisit le glyphe et l’encre** (ADR-0006), le produit écrit ' +
          'les mots. `loading` compte les images (`loaded` / `total`, « 33 sur 89 ») ; `fallback` dit le repli au ' +
          'satellite (1 produit sur 25 le dit) ; `partial` en avertissement ; `empty` pour un projet en calcul ; `failed` ' +
          'en erreur, avec son action (`actionLabel`, émet `action`). `null` : rien, la pastille part comme une surface.\n\n' +
          'Un lecteur entend **les mots, une fois** — pas chaque compte, qui parlerait par-dessus tout ; `failed` est dit ' +
          'tout de suite.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof MapStatus>

const ground = (inner: string) =>
  `<div style="background:var(--ds-map-land);padding:32px;border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:12px">${inner}</div>`

/** Les cinq formes, sur le sol de la carte. */
export const States: Story = {
  name: 'Les cinq états',
  render: () => ({
    components: { MapStatus },
    template: ground(`
      <MapStatus state="loading" label="Images des parcelles" :loaded="33" :total="89" />
      <MapStatus state="fallback" />
      <MapStatus state="partial" label="12 parcelles sur 89 sans image" action-label="Voir lesquelles" />
      <MapStatus state="empty" label="Pas encore de mesure : le premier calcul est en cours" />
      <MapStatus state="failed" label="Les mesures n’ont pas pu être lues" action-label="Réessayer" />
    `),
  }),
}
