import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Dialog from './Dialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { Button } from '../Button'

const meta: Meta<typeof Dialog> = {
  title: 'Superposition/Dialog',
  component: Dialog,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Une modale (ADR-0075), au format des modales du produit : un en-tête avec le titre et la fermeture, ' +
          'séparé du corps par un filet, puis un pied avec les actions à droite, sans filet. Sur la page, c’est le ' +
          '`<dialog>` natif ouvert en modal — il passe au-dessus de tout, page inerte derrière. **Dans une région** ' +
          '(`within`, un panneau) : la question se pose dans la région, sous son propre voile, et monte de son bas — ' +
          '`min(100 % − 24 px, 32rem)` —, la région inerte derrière, le reste de la page tel quel. Elle arrive comme ' +
          'tout ce qui flotte (échelle et fondu, ADR-0021) sur `considered`, la durée des surfaces lourdes, et repart ' +
          'plus vite. Le focus entre, tourne à l’intérieur (Tab, Maj+Tab) et revient à ce qui l’a ouverte ; Échap ' +
          'et le voile annulent. `ConfirmDialog` est sa forme de confirmation : un titre, une phrase, l’action et la sortie.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const PAGE = 'min-height:100vh; box-sizing:border-box; padding:var(--ds-spacing-2xl); display:flex; flex-direction:column; align-items:flex-start; gap:var(--ds-spacing-lg); background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-subtle);'

/** La confirmation destructive : le focus part sur « Annuler », seule « Supprimer » confirme. */
export const Confirmation: Story = {
  name: 'Confirmation',
  render: () => ({
    components: { ConfirmDialog, Button },
    setup: () => ({ open: ref(false), last: ref('—'), PAGE }),
    template: `
      <div :style="PAGE">
        <Button label="Supprimer la conversation" variant="danger-secondary" @click="open = true" />
        <span>Dernière réponse : {{ last }}</span>
        <ConfirmDialog
          v-model:open="open"
          title="Supprimer la conversation ?"
          message="La conversation « Comparer avec la campagne 2024 » sera supprimée définitivement."
          confirm-label="Supprimer"
          cancel-label="Annuler"
          tone="danger"
          @confirm="last = 'confirmée'"
          @cancel="last = 'annulée'"
        />
      </div>
    `,
  }),
}

/** La boîte générique : un titre, une phrase ou le slot par défaut, et les actions du produit. */
export const Default: Story = {
  name: 'Dialogue',
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false), PAGE }),
    template: `
      <div :style="PAGE">
        <Button label="Ouvrir" variant="secondary-gray" @click="open = true" />
        <Dialog v-model:open="open" title="Partager le projet" description="Les membres de la coopérative verront le projet et ses conversations avec Tolbi AI.">
          <template #actions>
            <Button label="Annuler" variant="secondary-gray" @click="open = false" />
            <Button label="Partager" variant="primary" @click="open = false" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}

const ROW = 'height:100vh; box-sizing:border-box; padding:var(--ds-spacing-lg); display:flex; gap:var(--ds-spacing-lg); background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-subtle);'
const SIDE = 'flex:1; min-width:0; box-sizing:border-box; padding:var(--ds-spacing-2xl); display:flex; flex-direction:column; align-items:flex-start; gap:var(--ds-spacing-lg); border-radius:var(--ds-radius-surface); background:var(--ds-bg-default);'
const REGION = 'position:relative; flex:none; width:400px; display:flex; flex-direction:column; border-radius:var(--ds-radius-surface) var(--ds-radius-surface) 0 0; background:var(--ds-bg-default);'
const REGION_HEAD = 'padding:var(--ds-spacing-lg) var(--ds-spacing-xl); border-bottom:var(--ds-border-width-default) solid var(--ds-border-subtle); font:var(--ds-font-label-lg-strong); color:var(--ds-text-strong);'
const REGION_BODY = 'flex:1; padding:var(--ds-spacing-2xl); display:flex; flex-direction:column; align-items:flex-start; gap:var(--ds-spacing-lg);'

/**
 * Dans une région (Figma section 18, piste C1) : la question appartient au panneau. Elle s’y pose, sous le
 * voile du panneau seul, et monte de son bas ; la page à côté reste claire et utilisable.
 */
export const Within: Story = {
  name: 'Dans une région',
  render: () => ({
    components: { ConfirmDialog, Button },
    setup: () => ({ open: ref(false), last: ref('—'), region: ref<HTMLElement>(), ROW, SIDE, REGION, REGION_HEAD, REGION_BODY }),
    template: `
      <div :style="ROW">
        <div :style="SIDE">
          <span>La page reste utilisable pendant la question : elle n’appartient qu’au panneau.</span>
          <Button label="Un bouton de la page" variant="secondary-gray" />
        </div>
        <div ref="region" :style="REGION">
          <div :style="REGION_HEAD">Le panneau</div>
          <div :style="REGION_BODY">
            <Button label="Supprimer la conversation" variant="danger-secondary" @click="open = true" />
            <span>Dernière réponse : {{ last }}</span>
          </div>
        </div>
        <ConfirmDialog
          v-model:open="open"
          :within="region"
          title="Supprimer la conversation ?"
          message="La conversation « Comparer avec la campagne 2024 » sera supprimée définitivement."
          confirm-label="Supprimer"
          cancel-label="Annuler"
          tone="danger"
          @confirm="last = 'confirmée'"
          @cancel="last = 'annulée'"
        />
      </div>
    `,
  }),
}
