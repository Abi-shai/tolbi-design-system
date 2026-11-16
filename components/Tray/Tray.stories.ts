import type { Meta, StoryObj } from '@storybook/vue3'
import Tray from './Tray.vue'

const meta: Meta<typeof Tray> = {
  title: 'Structure/Tray',
  component: Tray,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le plateau (ADR-0198) : le fond gris qui **regroupe un bloc** — une seule surface blanche posée dessus, le ' +
          'contenu du bloc posé sur elle. C’était le cadre de `ProjectList` (ADR-0166) ; c’est un motif de regroupement, ' +
          'réservé à certains blocs pour distinguer un bloc d’un autre, et les deux listes de l’accueil le partagent ' +
          '(`ProjectList`, `ArticleList`). `bg-neutral-subtle`, `spacing-md` autour, `radius-surface-lg` ; dedans ' +
          '`bg-default`, `spacing-md`, `radius-surface`. Ni titre ni état : le titre du bloc est à la page.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Tray },
    template: `
      <Tray>
        <p style="margin:0;padding:var(--ds-spacing-md);font:var(--ds-font-body-md);color:var(--ds-text-default)">
          Ce que le bloc porte, posé sur la surface blanche.
        </p>
      </Tray>`,
  }),
}
