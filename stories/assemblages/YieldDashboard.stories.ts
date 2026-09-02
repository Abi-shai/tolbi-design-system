import type { Meta, StoryObj } from '@storybook/vue3'
import YieldDashboard from './YieldDashboard.vue'

const meta: Meta<typeof YieldDashboard> = {
  title: 'Assemblages/Yield — Tableau de bord',
  component: YieldDashboard,
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Reproduction de l\'écran produit `/yield/332`, assemblée **uniquement** avec ce design ' +
          'system : vrais composants, vrais jetons, aucune couleur ni graisse littérale.\n\n' +
          'Ce n\'est pas une page à livrer, c\'est un banc d\'essai. Un composant se juge seul dans ' +
          'sa story ; un système se juge assemblé. Les régions que le design system ne couvre pas ' +
          'encore sont cerclées et étiquetées — `showGaps` les masque pour juger le rendu, les ' +
          'affiche pour voir la frontière.',
      },
    },
  },
  argTypes: {
    showGaps: {
      control: 'boolean',
      description: 'Cercle et étiquette chaque région non couverte par le design system.',
      table: { category: 'Banc d\'essai', type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
  },
  args: { showGaps: true },
}

export default meta
type Story = StoryObj<typeof meta>

export const WithGaps: Story = {
  name: 'Frontière du design system',
  parameters: {
    docs: {
      description: {
        story:
          'Chaque zone cerclée est une pièce que le produit dessine à la main faute de composant. ' +
          'Six régions sur cet écran — dont une **quasi-collision** : la tuile de relevé, où ' +
          '`StatTile` existe mais ne correspond pas (l\'unité vit dans l\'en-tête et le corps est ' +
          'un couple date/valeur, pas étiquette/valeur).',
      },
    },
  },
}

export const AsBuilt: Story = {
  name: 'Rendu sans annotations',
  args: { showGaps: false },
  parameters: {
    docs: {
      description: {
        story: 'Le même écran sans marquage — pour juger comment le système tient ensemble.',
      },
    },
  },
}
