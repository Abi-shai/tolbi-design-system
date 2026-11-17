import type { Meta, StoryObj } from '@storybook/vue3'
import Tray from './Tray.vue'
import { Button } from '../Button'

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

/**
 * Avec son titre (ADR-0205, piste T1) : le titre dans le gris, au-dessus de la surface blanche, « Voir tout » au bout de
 * sa ligne — le gris porte le titre, le blanc le contenu. Le plateau devient une région nommée par le titre.
 */
export const Titled: Story = {
  name: 'Avec titre',
  render: () => ({
    components: { Tray, Button },
    template: `
      <Tray title="Derniers projets">
        <template #action><Button variant="link" size="sm" label="Voir tout" icon-trailing="arrow-right" /></template>
        <p style="margin:0;padding:var(--ds-spacing-md);font:var(--ds-font-body-md);color:var(--ds-text-default)">
          Ce que le bloc porte, posé sur la surface blanche.
        </p>
      </Tray>`,
  }),
}
