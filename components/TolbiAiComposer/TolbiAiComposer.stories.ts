import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TolbiAiComposer from './TolbiAiComposer.vue'
import { TolbiAiThinkingLine } from '../TolbiAiThinkingLine'

const meta: Meta<typeof TolbiAiComposer> = {
  title: 'Saisie/TolbiAiComposer',
  component: TolbiAiComposer,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La saisie de Tolbi AI — la seule. La pastille dit le périmètre (« Tout votre projet »), ' +
          'la zone de texte grandit avec la question, une seule action à droite : Envoyer quand il y ' +
          'a du texte, « Arrêter » pendant la réponse. L\'échec se dit au-dessus de la saisie et la ' +
          'question y reste. Entrée envoie, Maj + Entrée va à la ligne (ADR-0059).',
      },
    },
  },
  argTypes: {
    modelValue: { control: 'text', table: { category: 'Contenu' } },
    status: {
      control: 'inline-radio',
      options: ['ready', 'pending', 'failed'],
      table: {
        category: 'État',
        type: { summary: "'ready' | 'pending' | 'failed'" },
        defaultValue: { summary: "'ready'" },
      },
    },
    scope: { control: 'text', table: { category: 'Contenu', type: { summary: 'string | null' } } },
    disclaimer: { control: 'text', table: { category: 'Contenu', type: { summary: 'string | null' } } },
  },
  args: { modelValue: '', status: 'ready' },
  decorators: [() => ({ template: '<div style="width:368px"><story /></div>' })],
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { name: 'Vide' }

export const Filled: Story = {
  name: 'Rempli',
  args: { modelValue: 'Pourquoi la parcelle de Modou Sène a produit moins que les autres ?' },
}

export const Pending: Story = {
  name: 'Réponse en cours',
  args: { status: 'pending' },
}

export const Failed: Story = {
  name: 'Réponse impossible',
  args: { status: 'failed', modelValue: 'Quelle parcelle a le moins produit cette campagne ?' },
}

/**
 * Le parcours, joué par un faux produit : Entrée envoie, la question part dans
 * le fil, la ligne d'attente la suit, puis la réponse arrive — ou échoue, et la
 * question revient dans la saisie.
 */
export const Playground: Story = {
  name: 'Parcours',
  args: { failNext: false } as never,
  argTypes: {
    failNext: {
      control: 'boolean',
      name: 'La prochaine réponse échoue',
      table: { category: 'Démo' },
    },
  } as never,
  render: (args) => ({
    components: { TolbiAiComposer, TolbiAiThinkingLine },
    setup() {
      const question = ref('')
      const status = ref<'ready' | 'pending' | 'failed'>('ready')
      const thread = ref<{ role: 'user' | 'assistant'; text: string }[]>([])
      let timer: ReturnType<typeof setTimeout> | undefined
      const send = (q: string) => {
        thread.value.push({ role: 'user', text: q })
        question.value = ''
        status.value = 'pending'
        timer = setTimeout(() => {
          if ((args as { failNext?: boolean }).failNext) {
            thread.value.pop()
            question.value = q
            status.value = 'failed'
          } else {
            thread.value.push({ role: 'assistant', text: 'Sur la campagne, la parcelle de Modou Sène atteint 1,5 t/ha.' })
            status.value = 'ready'
          }
        }, 2400)
      }
      const stop = () => {
        clearTimeout(timer)
        status.value = 'ready'
      }
      const retry = () => send(question.value)
      return { question, status, thread, send, stop, retry }
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-xl);">
        <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-lg); min-height:120px;">
          <p
            v-for="(m, i) in thread"
            :key="i"
            :style="m.role === 'user'
              ? 'align-self:flex-end; margin:0; max-width:80%; padding:var(--ds-spacing-md) var(--ds-spacing-lg); border-radius:var(--ds-radius-control); background:var(--ds-bg-neutral); font:var(--ds-font-body-md); color:var(--ds-text-default);'
              : 'margin:0; font:var(--ds-font-body-md); color:var(--ds-text-default);'"
          >{{ m.text }}</p>
          <TolbiAiThinkingLine v-if="status === 'pending'" />
        </div>
        <TolbiAiComposer v-model="question" :status="status" @send="send" @stop="stop" @retry="retry" />
      </div>
    `,
  }),
}
