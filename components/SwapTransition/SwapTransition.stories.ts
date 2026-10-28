import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import SwapTransition from './SwapTransition.vue'
import { Button } from '../Button'
import { Skeleton } from '../Skeleton'

const meta: Meta<typeof SwapTransition> = {
  title: 'Mouvement/SwapTransition',
  component: SwapTransition,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Une chose qui en **remplace une autre dans la même case** : un squelette qui devient du contenu, ' +
          'un spinner qui devient un graphique (ADR-0026). C’est la transition la plus regardée d’un produit de ' +
          'données, puisqu’elle arrive à chaque chargement.\n\n' +
          '`mode="out-in"` n’est pas optionnel ici : les deux états n’ont presque jamais la même hauteur, donc ' +
          'les superposer ferait sauter le conteneur au milieu du fondu. Les séquencer coûte les deux durées ' +
          'bout à bout — c’est pourquoi elles sont `quick`.\n\n' +
          '`Button` en est **délibérément exclu** : échanger un spinner contre un libellé change sa largeur, et ' +
          'fondre à travers un redimensionnement se lit comme un tremblement. On corrige le redimensionnement ' +
          'd’abord (ADR-0027).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof SwapTransition>

/** Squelette → contenu, la case tenue par `out-in`. */
export const Default: Story = {
  name: 'Du squelette au contenu',
  render: () => ({
    components: { SwapTransition, Button, Skeleton },
    setup: () => ({ loading: ref(true) }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start;width:360px">
        <Button variant="secondary-gray" size="sm" :label="loading ? 'Charger' : 'Recharger'" @click="loading = !loading" />
        <div style="width:100%;padding:16px;border:1px solid var(--ds-border-subtle);border-radius:var(--ds-radius-surface);background:var(--ds-bg-default)">
          <SwapTransition>
            <div v-if="loading" key="skeleton" style="display:flex;flex-direction:column;gap:8px">
              <Skeleton variant="text" width="60%" height="14px" emphasis="strong" />
              <Skeleton variant="text" width="90%" height="14px" />
              <Skeleton variant="text" width="75%" height="14px" />
            </div>
            <div v-else key="content" style="display:flex;flex-direction:column;gap:4px">
              <p style="margin:0;font:var(--ds-font-label-lg-strong);color:var(--ds-text-strong)">Soubré — lot de 128 parcelles</p>
              <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">128 parcelles · 342,8 ha · cacao</p>
              <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Analysé le 27 octobre 2026</p>
            </div>
          </SwapTransition>
        </div>
      </div>
    `,
  }),
}
