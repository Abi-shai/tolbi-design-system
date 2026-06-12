import type { Meta, StoryObj } from '@storybook/vue3'
import MotionDurationScale from './components/MotionDurationScale.vue'
import MotionEasingScale from './components/MotionEasingScale.vue'
import MotionEnterExit from './components/MotionEnterExit.vue'

const meta: Meta = {
  title: 'Tokens/Motion',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Les tokens de mouvement de Tolbi. Dérivés de la voix de marque — ancré, décisif, sans fioriture.
Voir **ADR-0002** pour les principes complets et les contraintes absolues (pas de shake, pas de bounce, pas de faux enthousiasme).
        `.trim(),
      },
    },
  },
}

export default meta
type Story = StoryObj

export const Duration: Story = {
  name: 'Durées',
  parameters: {
    docs: {
      description: {
        story: 'Six durées nommées par intention sémantique, pas par vitesse. Cliquez **Jouer** pour voir chaque barre s\'animer simultanément avec le même easing et des durées différentes.',
      },
    },
  },
  render: () => ({
    components: { MotionDurationScale },
    template: '<MotionDurationScale />',
  }),
}

export const Easing: Story = {
  name: 'Easing',
  parameters: {
    docs: {
      description: {
        story: 'Quatre courbes d\'accélération. Cliquez **Jouer** : même durée (500ms), easings différents. Observez où chaque balle accélère ou ralentit — c\'est là que la personnalité du mouvement se joue.',
      },
    },
  },
  render: () => ({
    components: { MotionEasingScale },
    template: '<MotionEasingScale />',
  }),
}

export const EnterExit: Story = {
  name: 'Entrée / Sortie',
  parameters: {
    docs: {
      description: {
        story: 'L\'asymétrie entrée/sortie est le principe de motion le plus visible de la marque. L\'entrée (200ms `easing-out`) décélère pour faire de la place. La sortie (150ms `easing-in`) accélère pour s\'écarter sans tarder.',
      },
    },
  },
  render: () => ({
    components: { MotionEnterExit },
    template: '<MotionEnterExit />',
  }),
}
