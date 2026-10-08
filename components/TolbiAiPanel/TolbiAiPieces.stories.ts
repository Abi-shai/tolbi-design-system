import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TolbiAiSuggestion from './TolbiAiSuggestion.vue'
import TolbiAiSource from './TolbiAiSource.vue'
import TolbiAiQuestion from './TolbiAiQuestion.vue'
import TolbiAiAnswer from './TolbiAiAnswer.vue'
import TolbiAiWelcome from './TolbiAiWelcome.vue'

/*
  The panel's pieces, each titled under it (ADR-0007): they only exist inside
  `TolbiAiPanel`. Shown on a 360px column — the panel's 400 less its padding.
*/
const meta: Meta = {
  title: 'Structure/TolbiAiPanel/Pièces',
  tags: ['wip'],
  parameters: { layout: 'padded' },
  decorators: [() => ({ template: '<div style="width:360px; display:flex; flex-direction:column; gap:var(--ds-spacing-lg);"><story /></div>' })],
}

export default meta
type Story = StoryObj<typeof meta>

/** Une par ligne, alignée à gauche, et elle passe à la ligne. */
export const Suggestion: Story = {
  name: 'Suggestion',
  render: () => ({
    components: { TolbiAiSuggestion },
    template: `
      <TolbiAiSuggestion label="Expliquer les résultats de ce projet" />
      <TolbiAiSuggestion label="Quelles stratégies recommandez-vous pour améliorer les rendements ?" />
    `,
  }),
}

/** Le type de donnée, ce que c'est, sa date. Avec `href`, un lien vers la source. */
export const Source: Story = {
  name: 'Source',
  render: () => ({
    components: { TolbiAiSource },
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:var(--ds-spacing-sm);">
        <TolbiAiSource icon="satellite" label="Rendement estimé" date="5 nov. 2025" />
        <TolbiAiSource icon="leaf" label="Phénologie" date="5 nov. 2025" />
        <TolbiAiSource icon="land-plot" label="5 parcelles déclarées" href="#" />
      </div>
    `,
  }),
}

export const Question: Story = {
  name: 'Question',
  render: () => ({
    components: { TolbiAiQuestion },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg);">
        <TolbiAiQuestion text="Expliquer les résultats de ce projet" />
        <TolbiAiQuestion text="Pourquoi la parcelle de Modou Sène a produit moins que les autres alors que la pluie a été la même partout ?" />
      </div>
    `,
  }),
}

export const Answer: Story = {
  name: 'Réponse',
  render: () => ({
    components: { TolbiAiAnswer },
    setup: () => ({ feedback: ref(null) }),
    template: `
      <TolbiAiAnswer
        v-model:feedback="feedback"
        :sources="[{ icon: 'satellite', label: 'Rendement estimé', date: '5 nov. 2025' }, { icon: 'leaf', label: 'Phénologie', date: '5 nov. 2025' }]"
      >
        <p>Le projet atteint un rendement estimé de <strong>1,9 t/ha</strong> sur 152 ha.</p>
        <ul><li><strong>+15 %</strong> par rapport à la campagne précédente</li><li>De <strong>1,5</strong> à <strong>2,1 t/ha</strong> selon les parcelles</li></ul>
      </TolbiAiAnswer>
    `,
  }),
}

export const Welcome: Story = {
  name: 'Accueil',
  render: () => ({
    components: { TolbiAiWelcome },
    template: `<TolbiAiWelcome :suggestions="['Expliquer les résultats de ce projet', 'Donner une explication agronomique de ces résultats']" />`,
  }),
}
