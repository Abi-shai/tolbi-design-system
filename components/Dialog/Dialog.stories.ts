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
          'séparé du corps par un filet, puis un pied avec les actions à droite, sans filet. **Signée** (ADR-0076, ' +
          'forme B de la section 19) : un carreau à la teinte du ton et le glyphe de l’action devant le titre — le ' +
          'ton ne se dit jamais seul. Sur la page, c’est le `<dialog>` natif ouvert en modal — il passe au-dessus ' +
          'de tout, page inerte derrière. **Dans une région** (`within`, un panneau) : la question se pose dans la ' +
          'région, sous son propre voile, et monte de son bas. Elle arrive comme tout ce qui flotte (échelle et ' +
          'fondu, ADR-0021) sur `considered`, et repart plus vite. Le focus entre, tourne à l’intérieur (Tab, ' +
          'Maj+Tab) et revient à ce qui l’a ouverte ; Échap et le voile annulent. `ConfirmDialog` est sa forme de ' +
          'confirmation, en trois niveaux : confirmer, montrer ce qui part, taper le nom.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const PAGE = 'min-height:100vh; box-sizing:border-box; padding:var(--ds-spacing-2xl); display:flex; flex-direction:column; align-items:flex-start; gap:var(--ds-spacing-lg); background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-subtle);'

const LIST = [
  { icon: 'map', label: '24 parcelles et leurs contours' },
  { icon: 'chart-column', label: '3 analyses de rendement' },
  { icon: 'message-square', label: '9 conversations avec Tolbi AI' },
]

/* One ConfirmDialog per story, opened by a button that names it. */
const confirmStory = (trigger: string, variant: string, props: Record<string, unknown>) => ({
  render: () => ({
    components: { ConfirmDialog, Button },
    setup: () => ({ open: ref(false), last: ref('—'), PAGE, props, trigger, variant }),
    template: `
      <div :style="PAGE">
        <Button :label="trigger" :variant="variant" @click="open = true" />
        <span>Dernière réponse : {{ last }}</span>
        <ConfirmDialog v-model:open="open" v-bind="props" @confirm="last = 'confirmée'" @cancel="last = 'annulée'" />
      </div>
    `,
  }),
})

/** Niveau 1 — confirmer : la question, une phrase, l’action qui se nomme. Le focus part sur « Annuler ». */
export const Confirm: Story = {
  name: '1 · Confirmer',
  ...confirmStory('Retirer Awa Diop', 'danger-secondary', {
    title: 'Retirer Awa Diop du projet ?',
    message: 'Awa Diop n’aura plus accès au projet Rendement Arachide Nord. Vous pourrez l’inviter à nouveau.',
    confirmLabel: 'Retirer',
    icon: 'user-minus',
  }),
}

/** Niveau 2 — montrer ce qui part : une ligne par chose emportée, avec son glyphe et son nombre. */
export const WhatGoes: Story = {
  name: '2 · Ce qui part',
  ...confirmStory('Supprimer le projet', 'danger-secondary', {
    title: 'Supprimer le projet ?',
    message: 'Le projet Rendement Arachide Nord sera supprimé définitivement, avec :',
    confirmLabel: 'Supprimer le projet',
    icon: 'trash-2',
    consequences: LIST,
  }),
}

/**
 * Niveau 3 — taper le nom : « Supprimer le projet » reste éteint tant que le nom n’est pas tapé, exactement.
 * Le focus part dans le champ ; Entrée confirme une fois le nom tapé.
 */
export const TypeTheName: Story = {
  name: '3 · Taper le nom',
  ...confirmStory('Supprimer le projet', 'danger-secondary', {
    title: 'Supprimer le projet ?',
    message: 'Le projet Rendement Arachide Nord sera supprimé définitivement, avec :',
    confirmLabel: 'Supprimer le projet',
    icon: 'trash-2',
    consequences: LIST,
    requireText: 'Rendement Arachide Nord',
  }),
}

/** Une confirmation qui n’est pas une suppression : le ton neutre, le bouton principal, qui a le focus. */
export const Neutral: Story = {
  name: '4 · Ton neutre',
  ...confirmStory('Lancer l’analyse', 'primary', {
    title: 'Lancer l’analyse de rendement ?',
    message: 'L’analyse utilisera 50 crédits Yield. Il vous en restera 200.',
    confirmLabel: 'Lancer l’analyse',
    tone: 'neutral',
    icon: 'coins',
  }),
}

/** La boîte générique : un titre, une phrase ou le slot par défaut, et les actions du produit — signée si elle a un glyphe. */
export const Default: Story = {
  name: 'Dialogue',
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref(false), PAGE }),
    template: `
      <div :style="PAGE">
        <Button label="Ouvrir" variant="secondary-gray" @click="open = true" />
        <Dialog v-model:open="open" title="Partager le projet" icon="users" description="Les membres de la coopérative verront le projet et ses conversations avec Tolbi AI.">
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
          icon="trash-2"
          @confirm="last = 'confirmée'"
          @cancel="last = 'annulée'"
        />
      </div>
    `,
  }),
}
