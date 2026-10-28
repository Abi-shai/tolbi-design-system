import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Carousel from './Carousel.vue'
import { Button } from '../Button'

const meta: Meta<typeof Carousel> = {
  title: 'Superposition/Carousel',
  component: Carousel,
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Une visite en quelques diapositives, dans le `Dialog` du paquet (ADR-0088, piste A) : la fermeture seule en tête (le ' +
          'nom de la fenêtre est lu, pas montré), l’image 16:9 en retrait, le titre et la phrase à gauche, les points au début du ' +
          'pied, « Passer » puis « Précédent », « Suivant », et sur la dernière l’action où la visite mène. Rien ne défile seul ; ' +
          'un fondu entre les diapositives ; la fenêtre garde la hauteur de la plus haute ; « Étape 2 sur 3 » est annoncé.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* Pictures for the story only: a field seen from above, three greens. */
const picture = (a: string, b: string) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="${a}"/><path d="M0 60 L60 30 L160 52 L160 90 L0 90Z" fill="${b}"/><path d="M40 20 L90 10 L110 40 L60 50Z" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 3"/></svg>`)

const SLIDES = [
  { title: 'Tracez vos parcelles', text: 'Posez chaque sommet sur l’image satellite ; la surface se calcule à mesure.', image: picture('#5b7f4a', '#7a9a52') },
  { title: 'Liez les champs aux produits', text: 'Chaque produit de la déclaration dit d’où il vient.', image: picture('#6d8a4f', '#9aa95d') },
  { title: 'Envoyez la déclaration', text: 'Relisez le résumé, puis déposez-la dans le système de l’UE.', image: picture('#4f7a5a', '#86a46a') },
]

export const Default: Story = {
  name: 'La visite de la DDR',
  render: () => ({
    components: { Carousel, Button },
    setup: () => ({ open: ref(false), step: ref(1), last: ref('—'), SLIDES }),
    template: `
      <div style="min-height:100vh; padding:var(--ds-spacing-2xl); background:var(--ds-bg-neutral); display:flex; flex-direction:column; align-items:flex-start; gap:var(--ds-spacing-lg); font:var(--ds-font-body-md); color:var(--ds-text-subtle)">
        <Button label="Découvrir la DDR" @click="open = true" />
        <span>Dernière issue : {{ last }}</span>
        <Carousel
          v-model:open="open"
          v-model:step="step"
          title="Découvrir la déclaration de diligence raisonnée"
          :slides="SLIDES"
          done-label="Tracer ma première parcelle"
          @skip="last = 'passée'"
          @done="last = 'terminée'"
        />
      </div>
    `,
  }),
}
