import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import ToastRegion from './ToastRegion.vue'
import Toast from './Toast.vue'
import { Button } from '../Button'
import type { ToastTone } from './Toast.vue'

const meta: Meta<typeof ToastRegion> = {
  title: 'Superposition/Toast/Region',
  tags: ['wip'],
  component: ToastRegion,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Là où vivent les toasts : un coin fixe de l’écran, une pile, et **le mouvement**. Un toast **monte ' +
          'du bord avec la pile** — même durée, même courbe que ceux qu’il pousse (`enter`, `easing-in-out`), ' +
          'si bien qu’ils restent à 8 px l’un de l’autre — en apparaissant. Il repart **sur place**, plus vite ' +
          'qu’il n’est venu (`exit`, fondu et 96 %), et la pile **attend qu’il ait disparu** pour refermer le ' +
          'vide. Le produit rend ses toasts dans la région et retire celui qui émet `dismiss` ; la région fait ' +
          'le reste (ADR-0052).',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['bottom-right', 'bottom-center', 'top-center'],
      table: { category: 'Apparence', defaultValue: { summary: "'bottom-right'" } },
    },
    // Not a prop of the region: passed to every toast of the story.
    duration: {
      control: 'number',
      description: 'Passée à chaque toast de l’histoire — `null` les retient (pour filmer le mouvement).',
      table: { category: 'Histoire' },
    },
  } as Meta<typeof ToastRegion>['argTypes'],
  args: { placement: 'bottom-right' },
}

export default meta
type Story = StoryObj<typeof meta>

interface Item {
  id:       number
  tone:     ToastTone
  message:  string
  detail?:  string
  pending?: boolean
  action?:  string
}

/**
 * Les boutons poussent des toasts ; la croix, le temps ou « Annuler » les
 * retirent. « Tâche en cours » se résout en succès au bout de 2,5 s : le
 * spinner laisse place à la coche, et le temps du toast commence alors.
 */
export const Stack: Story = {
  name: 'La pile — entrée, sortie, place',
  render: (args) => ({
    components: { ToastRegion, Toast, Button },
    setup() {
      const items = ref<Item[]>([])
      let next = 1
      const push = (item: Omit<Item, 'id'>) => {
        const id = next++
        items.value.push({ id, ...item })
        return id
      }
      const remove = (id: number) => { items.value = items.value.filter(i => i.id !== id) }
      const success = () => push({ tone: 'success', message: '48 cartes générées pour l’agence de Kaolack' })
      const error = () => push({ tone: 'error', message: 'Import interrompu', detail: '3 lignes n’ont pas pu être appariées.', action: 'Réessayer' })
      const undo = () => push({ tone: 'success', message: '3 producteurs archivés', action: 'Annuler' })
      const pending = () => {
        const id = push({ tone: 'neutral', message: 'Génération du lot…', pending: true })
        setTimeout(() => {
          const item = items.value.find(i => i.id === id)
          if (item) Object.assign(item, { pending: false, tone: 'success', message: 'Lot généré — 48 cartes' })
        }, 2500)
      }
      const clear = () => { items.value = [] }
      return { args, items, remove, success, error, undo, pending, clear }
    },
    template: `
      <div style="min-height: 100vh; box-sizing: border-box; padding: var(--ds-spacing-3xl); background: var(--ds-bg-neutral);
                  display: flex; gap: var(--ds-spacing-md); align-items: flex-start; flex-wrap: wrap;">
        <Button label="Succès" variant="secondary-gray" data-push="success" @click="success" />
        <Button label="Erreur + Réessayer" variant="secondary-gray" data-push="error" @click="error" />
        <Button label="Annulation" variant="secondary-gray" data-push="undo" @click="undo" />
        <Button label="Tâche en cours" variant="secondary-gray" data-push="pending" @click="pending" />
        <Button label="Tout fermer" variant="tertiary" data-push="clear" @click="clear" />
      </div>
      <ToastRegion :placement="args.placement">
        <Toast
          v-for="t in items"
          :key="t.id"
          :tone="t.tone"
          :message="t.message"
          :detail="t.detail"
          :pending="t.pending"
          :dismissible="!t.pending"
          :duration="args.duration"
          @dismiss="remove(t.id)"
        >
          <template v-if="t.action" #actions>
            <Button :label="t.action" variant="link" size="sm" @click="remove(t.id)" />
          </template>
        </Toast>
      </ToastRegion>
    `,
  }),
}
