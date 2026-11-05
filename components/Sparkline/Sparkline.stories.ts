import type { Meta, StoryObj } from '@storybook/vue3'
import Sparkline from './Sparkline.vue'

const meta: Meta<typeof Sparkline> = {
  title: 'Données/Sparkline',
  component: Sparkline,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Une **mini-courbe** (ADR-0100) : la tendance d’un chiffre, là où un graphique serait trop. Ni axe, ni ' +
          'grille, ni point — le chiffre à côté dit le nombre, la ligne dit dans quel sens il est allé.\n\n' +
          '`comparison` est une seconde série **sur la même échelle**, en pointillé et dans l’encre qui recule : ' +
          'ce contre quoi la première se lit (les points de contrôle). `label` est la phrase qu’entend un lecteur ' +
          'à la place de la ligne. Pas un moteur de graphique (ADR-0006) : ni infobulle, ni interaction.\n\n' +
          '**Pas `ChartFrame`, et les deux ne s’emboîtent pas.** `ChartFrame` est le cadre d’un vrai graphique — titre, ' +
          'légende, axes, grille, états — autour d’un tracé que dessine le moteur du produit : on y *lit des valeurs*. ' +
          '`Sparkline` dessine sa ligne et rien autour : le chiffre est déjà dit à côté. Le jour où la ligne a besoin ' +
          'd’un axe, d’une légende ou d’une infobulle, c’est un graphique : mettre le tracé du moteur dans un ' +
          '`ChartFrame` plutôt que faire grandir celle-ci.',
      },
    },
  },
  args: {
    values: [0.31, 0.32, 0.34, 0.33, 0.36, 0.38, 0.39, 0.41, 0.42, 0.44],
    comparison: [0.31, 0.31, 0.32, 0.32, 0.32, 0.33, 0.33, 0.33, 0.34, 0.34],
    label: '+12 % contre +4 % pour les points de contrôle',
  },
}

export default meta
type Story = StoryObj<typeof Sparkline>

export const Default: Story = {
  name: 'Avec sa comparaison',
  render: (args) => ({
    components: { Sparkline },
    setup: () => ({ args }),
    template: `<div style="width:220px"><Sparkline v-bind="args" /></div>`,
  }),
}

export const Alone: Story = {
  name: 'Seule',
  args: { comparison: [], label: 'En hausse de 12 % sur dix ans' },
  render: (args) => ({
    components: { Sparkline },
    setup: () => ({ args }),
    template: `<div style="width:220px"><Sparkline v-bind="args" /></div>`,
  }),
}

/** Pas encore de série — un calcul en cours : un trait plat en pointillé tient la place de la courbe (ADR-0105). */
export const Pending: Story = {
  name: 'Pas encore de données',
  args: { values: [], comparison: [], label: 'En calcul' },
  render: (args) => ({
    components: { Sparkline },
    setup: () => ({ args }),
    template: `<div style="width:220px"><Sparkline v-bind="args" /></div>`,
  }),
}
