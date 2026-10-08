import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TolbiAiSuggestion from './TolbiAiSuggestion.vue'
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
      >
        <p>Le projet atteint un rendement estimé de <strong>1,9 t/ha</strong> sur 152 ha.</p>
        <ul><li><strong>+15 %</strong> par rapport à la campagne précédente</li><li>De <strong>1,5</strong> à <strong>2,1 t/ha</strong> selon les parcelles</li></ul>
      </TolbiAiAnswer>
    `,
  }),
}

/**
 * Tout ce qu'un markdown peut écrire, dans les encres et le rythme de la
 * réponse : titres (de tout niveau, à l'emphase du texte), liens, code en ligne
 * et en bloc, citation, tableau, filet, liste imbriquée. Le produit rend son
 * markdown dans le slot ; rien n'y retombe sur les styles du navigateur.
 */
export const AnswerMarkdown: Story = {
  name: 'Réponse — tout le markdown',
  render: () => ({
    components: { TolbiAiAnswer },
    setup: () => ({ feedback: ref(null) }),
    template: `
      <div style="width:352px;">
        <TolbiAiAnswer v-model:feedback="feedback">
          <h1>Rendement de la campagne</h1>
          <p>Le projet atteint <strong>1,9 t/ha</strong> sur 152 ha — <em>estimation au 5 novembre</em>. Voir la <a href="#methode">méthode de calcul</a>.</p>
          <h3>Par parcelle</h3>
          <table>
            <thead><tr><th>Parcelle</th><th>Surface</th><th>Rendement</th></tr></thead>
            <tbody>
              <tr><td>Mariama Baldé</td><td>9 ha</td><td>2,1 t/ha</td></tr>
              <tr><td>Modou Sène</td><td>12 ha</td><td>1,5 t/ha</td></tr>
            </tbody>
          </table>
          <blockquote>Les trois parcelles du nord ferment la marche, faute de pluie fin août.</blockquote>
          <ul>
            <li>Indice <code>NDVI</code> moyen : <strong>0,62</strong>
              <ul><li>au-dessus de 0,7 sur 4 parcelles</li></ul>
            </li>
            <li>Sénescence : <strong>79,6 %</strong> des surfaces</li>
          </ul>
          <hr />
          <p>Export brut :</p>
          <pre><code>parcelle,surface_ha,rendement_t_ha
mariama-balde,9,2.1
modou-sene,12,1.5</code></pre>
        </TolbiAiAnswer>
      </div>
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
