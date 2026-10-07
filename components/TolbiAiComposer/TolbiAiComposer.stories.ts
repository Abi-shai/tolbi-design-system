import type { Meta, StoryObj } from '@storybook/vue3'
import { onBeforeUnmount, ref } from 'vue'
import TolbiAiComposer from './TolbiAiComposer.vue'
import { TolbiAiThinkingLine } from '../TolbiAiThinkingLine'
import { TolbiAiVoiceNote } from '../TolbiAiVoiceNote'
import { Toast, ToastRegion } from '../Toast'
import { Button } from '../Button'
import { fakeMicrophone, type FakeMicrophone } from './TolbiAiComposer.demo'
import type { TolbiAiVoiceRecording } from './TolbiAiComposer.vue'

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
          'question y reste. Entrée envoie, Maj + Entrée va à la ligne (ADR-0059).\n\n' +
          '**La voix** (ADR-0061) : tant que la saisie est vide, le micro tient la place d\'Envoyer. ' +
          'L\'enregistrement tient sur une ligne — supprimer, le point rouge, le minuteur, l\'onde en ' +
          'direct, pause, envoyer ; Entrée envoie, Échap supprime, Espace met en pause. L\'autorisation, ' +
          'le micro bloqué et le silence se disent dans la saisie, sans fenêtre. Les histoires « Vocal » ' +
          'simulent le micro : cliquez sur le micro pour commencer.',
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

interface Sent {
  id: number
  src: string
  recording: TolbiAiVoiceRecording
  state: 'transcribing' | 'transcribed'
}

/**
 * The voice half, played against a microphone the story controls: the thread
 * receives what is sent, and a deletion offers « Annuler » for 8 s.
 */
const voiceDemo = (mic: FakeMicrophone | null, extra: Record<string, unknown> = {}): Story['render'] => () => ({
  components: { TolbiAiComposer, TolbiAiVoiceNote, ToastRegion, Toast, Button },
  setup() {
    const restore = mic ? fakeMicrophone(mic) : () => {}
    onBeforeUnmount(restore)
    const composer = ref<InstanceType<typeof TolbiAiComposer>>()
    const question = ref('')
    const sent = ref<Sent[]>([])
    const toasts = ref<{ id: number }[]>([])
    let next = 1
    const sendVoice = (recording: TolbiAiVoiceRecording) => {
      const item: Sent = { id: next++, src: URL.createObjectURL(recording.blob), recording, state: 'transcribing' }
      sent.value.push(item)
      setTimeout(() => (item.state = 'transcribed'), 1800)
    }
    const deleted = () => toasts.value.push({ id: next++ })
    const undo = (id: number) => {
      composer.value?.undoDelete()
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }
    const dismiss = (id: number) => (toasts.value = toasts.value.filter((t) => t.id !== id))
    return { composer, question, sent, toasts, sendVoice, deleted, undo, dismiss, extra }
  },
  template: `
    <div style="width:368px; display:flex; flex-direction:column; gap:var(--ds-spacing-xl);">
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:var(--ds-spacing-lg);">
        <TolbiAiVoiceNote
          v-for="n in sent"
          :key="n.id"
          :src="n.src"
          :duration="n.recording.duration"
          :levels="n.recording.levels"
          :state="n.state"
          language="Français"
          transcript="Combien d’hectares sont en sénescence ?"
        />
      </div>
      <TolbiAiComposer ref="composer" v-model="question" v-bind="extra" @send-voice="sendVoice" @delete-voice="deleted" />
      <ToastRegion>
        <Toast v-for="t in toasts" :key="t.id" tone="neutral" message="Vocal supprimé" @dismiss="dismiss(t.id)">
          <template #actions>
            <Button label="Annuler" variant="link" size="sm" @click="undo(t.id)" />
          </template>
        </Toast>
      </ToastRegion>
    </div>
  `,
})

/** Le micro est déjà autorisé : un clic, et l'enregistrement commence. */
export const Voice: Story = {
  name: 'Vocal — micro simulé',
  render: voiceDemo({ permission: 'granted' }),
}

/** Première fois : la saisie explique avant que le navigateur ne demande. */
export const VoiceAsk: Story = {
  name: 'Vocal — autorisation',
  render: voiceDemo({ permission: 'prompt' }),
}

export const VoiceDenied: Story = {
  name: 'Vocal — micro bloqué',
  render: voiceDemo({ permission: 'denied', grant: false }),
}

/** Un micro branché qui n'entend rien : la saisie le dit au lieu d'envoyer. */
export const VoiceSilent: Story = {
  name: 'Vocal — rien entendu',
  render: voiceDemo({ permission: 'granted', silent: true }),
}

/** La limite ramenée à 20 s pour la voir : le compte à rebours dès 5 s, la pause à 20. */
export const VoiceLimit: Story = {
  name: 'Vocal — limite proche',
  render: voiceDemo({ permission: 'granted' }, { voiceLimit: 20 }),
}

/** Le vrai micro de cet ordinateur — le navigateur demandera. */
export const VoiceReal: Story = {
  name: 'Vocal — vrai micro',
  render: voiceDemo(null),
}

/** Sans voix : la saisie vide garde Envoyer, éteint. */
export const WithoutVoice: Story = {
  name: 'Sans la voix',
  args: { voice: false },
}
