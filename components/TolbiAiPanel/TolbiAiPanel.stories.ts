import type { Meta, StoryObj } from '@storybook/vue3'
import { nextTick, ref } from 'vue'
import TolbiAiPanel from './TolbiAiPanel.vue'
import TolbiAiWelcome from './TolbiAiWelcome.vue'
import TolbiAiThread from './TolbiAiThread.vue'
import TolbiAiQuestion from './TolbiAiQuestion.vue'
import TolbiAiAnswer from './TolbiAiAnswer.vue'
import { TolbiAiComposer } from '../TolbiAiComposer'
import { TolbiAiThinkingLine } from '../TolbiAiThinkingLine'
import { TolbiAiVoiceNote } from '../TolbiAiVoiceNote'
import { TolbiAiNavButton } from '../TolbiAiNavButton'
import { HorizontalNavigation } from '../HorizontalNavigation'
import type { TolbiAiFollowUp, TolbiAiSourceItem } from './TolbiAiAnswer.vue'
import type { TolbiAiVoiceRecording } from '../TolbiAiComposer'

const SUGGESTIONS = [
  'Expliquer les résultats de ce projet',
  'Donner une explication agronomique de ces résultats',
  'Quelles stratégies recommandez-vous pour améliorer les rendements ?',
  'Quelles actions concrètes faut-il mettre en place sur le terrain ?',
]

const ANSWER = `
  <p>Sur la campagne du 20 juin au 10 novembre 2025, le projet atteint un rendement estimé de <strong>1,9 t/ha</strong> sur 152 ha, soit <strong>284 t</strong> de production.</p>
  <ul>
    <li><strong>+15 %</strong> par rapport à la campagne précédente (1,6 t/ha)</li>
    <li>Des parcelles de <strong>1,5 t/ha</strong> (Modou Sène) à <strong>2,1 t/ha</strong> (Mariama Baldé)</li>
    <li>Au passage satellite du 5 novembre : <strong>sénescence</strong> à 79,6 %, maturation à 12,1 %</li>
  </ul>
  <p>La campagne est close : ces chiffres sont des estimations de fin de cycle.</p>
`

const SOURCES: TolbiAiSourceItem[] = [
  { icon: 'satellite', label: 'Rendement estimé', date: '5 nov. 2025' },
  { icon: 'leaf', label: 'Phénologie', date: '5 nov. 2025' },
  { icon: 'land-plot', label: '5 parcelles déclarées' },
]

const FOLLOW_UPS: TolbiAiFollowUp[] = [
  { icon: 'map-pin', label: 'Montrer ces parcelles sur la carte' },
  { icon: 'calendar-range', label: 'Comparer avec la campagne 2024' },
]

const meta: Meta<typeof TolbiAiPanel> = {
  title: 'Structure/TolbiAiPanel',
  component: TolbiAiPanel,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tolbi AI ancré dans la page : une colonne de 400 px, la hauteur de la surface, que la page ' +
          'laisse passer au lieu de la recouvrir. Elle ne flotte pas : s\'ouvrir est une largeur qui ' +
          'voyage (ADR-0037), et « Agrandir » la porte à 720 px. En-tête (le nom, ALPHA, historique, ' +
          'nouvelle conversation, agrandir, fermer), le fil qui défile et suit son dernier message, la ' +
          'saisie en pied (ADR-0062).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* A ground the size of a screen's column, as the panel stands in the product. */
const STAGE = 'height:760px; display:flex; background:var(--ds-bg-neutral); padding-top:var(--ds-spacing-lg);'

export const Welcome: Story = {
  name: 'Accueil',
  render: () => ({
    components: { TolbiAiPanel, TolbiAiWelcome, TolbiAiComposer },
    setup: () => ({ open: ref(true), expanded: ref(false), question: ref(''), SUGGESTIONS, STAGE }),
    template: `
      <div :style="STAGE">
        <div style="flex:1; min-width:0;" />
        <TolbiAiPanel v-model:open="open" v-model:expanded="expanded">
          <TolbiAiWelcome :suggestions="SUGGESTIONS" @select="(s) => (question = s)" />
          <template #composer><TolbiAiComposer v-model="question" /></template>
        </TolbiAiPanel>
      </div>
    `,
  }),
}

export const Conversation: Story = {
  name: 'Conversation',
  render: () => ({
    components: { TolbiAiPanel, TolbiAiThread, TolbiAiQuestion, TolbiAiAnswer, TolbiAiComposer },
    setup: () => ({ open: ref(true), question: ref(''), feedback: ref(null), ANSWER, SOURCES, FOLLOW_UPS, STAGE }),
    template: `
      <div :style="STAGE">
        <div style="flex:1; min-width:0;" />
        <TolbiAiPanel v-model:open="open">
          <TolbiAiThread>
            <TolbiAiQuestion key="q" text="Expliquer les résultats de ce projet" />
            <TolbiAiAnswer key="a" v-model:feedback="feedback" :sources="SOURCES" :follow-ups="FOLLOW_UPS">
              <div v-html="ANSWER" />
            </TolbiAiAnswer>
          </TolbiAiThread>
          <template #composer><TolbiAiComposer v-model="question" /></template>
        </TolbiAiPanel>
      </div>
    `,
  }),
}

/**
 * Le parcours, dans la page : l'entrée de la barre ouvre le panneau (⌘J aussi),
 * la page se resserre ; une suggestion ou une question part dans le fil, la ligne
 * d'attente la suit, la réponse prend sa place. Le micro de cette histoire est le
 * vrai : le navigateur le demandera.
 */
export const InThePage: Story = {
  name: 'Dans la page',
  render: () => ({
    components: {
      HorizontalNavigation, TolbiAiNavButton, TolbiAiPanel, TolbiAiWelcome, TolbiAiThread,
      TolbiAiQuestion, TolbiAiAnswer, TolbiAiThinkingLine, TolbiAiVoiceNote, TolbiAiComposer,
    },
    setup() {
      const open = ref(false)
      const expanded = ref(false)
      const question = ref('')
      const status = ref<'ready' | 'pending' | 'failed'>('ready')
      type Item =
        | { id: number; kind: 'question'; text: string }
        | { id: number; kind: 'voice'; recording: TolbiAiVoiceRecording; src: string; state: 'transcribing' | 'transcribed' }
        | { id: number; kind: 'answer' }
      const items = ref<Item[]>([])
      const panel = ref<InstanceType<typeof TolbiAiPanel>>()
      let next = 1
      let timer: ReturnType<typeof setTimeout> | undefined
      const answerLater = () => {
        status.value = 'pending'
        timer = setTimeout(() => {
          items.value.push({ id: next++, kind: 'answer' })
          status.value = 'ready'
        }, 2600)
      }
      const ask = (text: string) => {
        items.value.push({ id: next++, kind: 'question', text })
        question.value = ''
        void nextTick(() => panel.value?.scrollToEnd())
        answerLater()
      }
      const askVoice = (recording: TolbiAiVoiceRecording) => {
        const id = next++
        items.value.push({ id, kind: 'voice', recording, src: URL.createObjectURL(recording.blob), state: 'transcribing' })
        setTimeout(() => {
          const voice = items.value.find((i) => i.id === id)
          if (voice?.kind === 'voice') voice.state = 'transcribed'
        }, 1500)
        void nextTick(() => panel.value?.scrollToEnd())
        answerLater()
      }
      const stop = () => {
        clearTimeout(timer)
        status.value = 'ready'
      }
      const restart = () => {
        stop()
        items.value = []
      }
      return { open, expanded, question, status, items, panel, ask, askVoice, stop, restart, SUGGESTIONS, ANSWER, SOURCES, FOLLOW_UPS }
    },
    template: `
      <div style="height:100vh; min-height:720px; display:flex; flex-direction:column; background:var(--ds-bg-neutral);">
        <div style="padding:var(--ds-spacing-lg) var(--ds-spacing-lg) 0 var(--ds-spacing-md);">
          <HorizontalNavigation module="Yield" :breadcrumbs="[{ label: 'Projets' }, { label: 'Rendement Arachide Nord' }]" user-initials="AY">
            <template #assistant>
              <TolbiAiNavButton v-model:open="open" controls="tolbi-ai-panel" />
            </template>
          </HorizontalNavigation>
        </div>
        <div style="flex:1; min-height:0; display:flex; padding:var(--ds-spacing-lg) var(--ds-spacing-lg) 0;">
          <main style="flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--ds-spacing-lg);">
            <div style="flex:1; border-radius:var(--ds-radius-surface) var(--ds-radius-surface) 0 0; background:var(--ds-bg-default); padding:var(--ds-spacing-2xl); font:var(--ds-font-body-md); color:var(--ds-text-subtle);">
              La page du projet — elle se resserre quand le panneau s'ouvre.
            </div>
          </main>
          <TolbiAiPanel id="tolbi-ai-panel" ref="panel" v-model:open="open" v-model:expanded="expanded" @new-conversation="restart">
            <TolbiAiWelcome v-if="!items.length && status === 'ready'" :suggestions="SUGGESTIONS" @select="ask" />
            <TolbiAiThread v-else>
              <template v-for="item in items" :key="item.id">
                <TolbiAiQuestion v-if="item.kind === 'question'" :text="item.text" />
                <TolbiAiVoiceNote
                  v-else-if="item.kind === 'voice'"
                  style="align-self:flex-end"
                  :src="item.src"
                  :duration="item.recording.duration"
                  :levels="item.recording.levels"
                  :state="item.state"
                  language="Français"
                  transcript="Explique-moi les résultats de ce projet."
                />
                <TolbiAiAnswer v-else :sources="SOURCES" :follow-ups="FOLLOW_UPS" @follow-up="(f) => ask(f.label)">
                  <div v-html="ANSWER" />
                </TolbiAiAnswer>
              </template>
              <TolbiAiThinkingLine v-if="status === 'pending'" key="waiting" />
            </TolbiAiThread>
            <template #composer>
              <TolbiAiComposer v-model="question" :status="status" @send="ask" @send-voice="askVoice" @stop="stop" />
            </template>
          </TolbiAiPanel>
        </div>
      </div>
    `,
  }),
}
