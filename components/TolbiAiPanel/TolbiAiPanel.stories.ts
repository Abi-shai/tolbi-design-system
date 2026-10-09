import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import TolbiAiPanel from './TolbiAiPanel.vue'
import TolbiAiWelcome from './TolbiAiWelcome.vue'
import TolbiAiThread from './TolbiAiThread.vue'
import TolbiAiQuestion from './TolbiAiQuestion.vue'
import TolbiAiAnswer from './TolbiAiAnswer.vue'
import { TolbiAiComposer } from '../TolbiAiComposer'
import { TolbiAiThinkingLine } from '../TolbiAiThinkingLine'
import { TolbiAiVoiceNote } from '../TolbiAiVoiceNote'
import { TolbiAiLauncher } from '../TolbiAiLauncher'
import { HorizontalNavigation } from '../HorizontalNavigation'
import { SideNavigation, SideNavItem } from '../SideNavigation'
import { WorkspaceSelector } from '../WorkspaceSelector'
import { Button } from '../Button'
import { Toast, ToastRegion } from '../Toast'
import type { TolbiAiVoiceRecording } from '../TolbiAiComposer'
import type { TolbiAiConversation } from './history'

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
          'voyage (ADR-0037). L\'en-tête nomme la conversation et mène aux autres du projet — son titre ' +
          'ouvre l\'historique, groupé par jour (ADR-0069) — puis ALPHA, nouvelle conversation, agrandir, ' +
          'fermer ; le fil défile et suit son dernier message, la saisie est en pied (ADR-0062).\n\n' +
          '« Agrandir » lui donne la surface de la page — barre et navigation intactes — et une colonne ' +
          'de lecture de 720 px. La page reste dessous, telle quelle : « Réduire » la rend comme on ' +
          'l\'a laissée (ADR-0064). Elle doit être son propre contexte d\'empilement ' +
          '(`isolation: isolate`), sinon ce qui y porte un `z-index` — les contrôles d\'une carte — ' +
          'passe devant le panneau.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/* A ground the size of a screen's column, as the panel stands in the product. */
const STAGE = 'height:760px; display:flex; background:var(--ds-bg-neutral); padding-top:var(--ds-spacing-lg);'


/* ── A project's conversations, for the head's switcher (ADR-0069) ─────── */

type Item =
  | { id: number; kind: 'question'; text: string }
  | { id: number; kind: 'voice'; recording: TolbiAiVoiceRecording; src: string; state: 'transcribing' | 'transcribed' }
  | { id: number; kind: 'answer'; html: string }

/* So many days back, at a time — the history's groups stay where the story puts them. */
const day = (back: number, h: number, m: number) => {
  const d = new Date()
  d.setDate(d.getDate() - back)
  d.setHours(h, m, 0, 0)
  return d
}

/* Today, so many minutes ago — never before midnight, so it stays today. */
const ago = (minutes: number) => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return new Date(Math.max(midnight, now.getTime() - minutes * 60_000))
}

const PAST: { id: string; title: string; at: Date; answer?: string; pending?: boolean }[] = [
  { id: 'c1', title: 'Expliquer les résultats de ce projet', at: ago(25), answer: ANSWER },
  { id: 'c2', title: 'Quelle parcelle a le plus produit cette campagne ?', at: ago(190), pending: true },
  { id: 'c3', title: 'Comparer avec la campagne 2024', at: day(1, 18, 10), answer: '<p>En 2024, le projet produisait <strong>1,6 t/ha</strong> sur 148 ha. Cette campagne fait <strong>+15 %</strong>, portée par les parcelles du sud, semées dix jours plus tôt.</p>' },
  { id: 'c4', title: 'Pourquoi la parcelle de Modou Sène est en retard ?', at: day(1, 9, 42), answer: '<p>Elle a été semée le <strong>4 juillet</strong>, deux semaines après les autres : au 5 novembre, elle était encore en maturation à <strong>41 %</strong>.</p>' },
  { id: 'c5', title: 'Résumer l’état de la sénescence', at: day(3, 16, 20), answer: '<p>Au dernier passage, <strong>79,6 %</strong> des surfaces sont en sénescence. Les trois parcelles du nord ferment la marche.</p>' },
  { id: 'c6', title: 'Prévoir la date de récolte', at: day(5, 10, 0), answer: '<p>Au rythme observé, la récolte peut commencer autour du <strong>18 novembre</strong> pour 80 % des surfaces.</p>' },
  { id: 'c7', title: 'Quel impact a eu la pluie du 12 octobre ?', at: day(6, 8, 45), answer: '<p><strong>38 mm</strong> en une journée : aucune baisse visible de l’indice de végétation la semaine suivante.</p>' },
  { id: 'c8', title: 'Préparer le rapport pour la coopérative', at: day(10, 15, 0), answer: '<p>Voici un plan en quatre parties : la campagne en chiffres, les parcelles, la météo, les prochaines étapes.</p>' },
  { id: 'c9', title: 'Expliquer l’indice NDVI à un producteur', at: day(17, 9, 0), answer: '<p>Le NDVI mesure la vigueur des plantes vue du ciel : plus il est haut, plus la culture est dense et verte.</p>' },
  { id: 'c10', title: 'Lister les parcelles sans relevé', at: day(24, 11, 30), answer: '<p>Deux parcelles n’ont pas de relevé depuis le <strong>1er septembre</strong> : Ndiaye 3 et Diop 1.</p>' },
  { id: 'c11', title: 'Estimer le rendement avant semis', at: day(36, 14, 0), answer: '<p>Sur les trois dernières campagnes, l’estimation de départ était de <strong>1,7 t/ha</strong>.</p>' },
  { id: 'c12', title: 'Comparer les variétés d’arachide', at: day(43, 17, 15), answer: '<p>La 55-437 a produit <strong>12 %</strong> de plus que la Fleur 11 sur les parcelles comparables.</p>' },
]

const LATE_ANSWER = '<p>La parcelle de <strong>Mariama Baldé</strong> : <strong>2,1 t/ha</strong> sur 9 ha, soit 18,9 t — la seule au-dessus de 2 t/ha.</p>'

/*
  The product's side, as a story plays it: the list, each conversation's
  exchanges, and what a fetch takes — 900ms for the list the first time it is
  asked for (`slowList`), 450ms for a conversation. A conversation is born
  with its first question; an answer lands in the conversation that asked,
  wherever the reader is.
*/
function useConversations({ empty = false, slowList = false } = {}) {
  let next = 1
  const conversations = ref<TolbiAiConversation[]>(
    empty ? [] : PAST.map(({ id, title, at, pending }) => ({ id, title, at, pending })),
  )
  const threads = ref<Record<string, Item[]>>(
    empty
      ? {}
      : Object.fromEntries(
          PAST.map((c) => [
            c.id,
            [
              { id: next++, kind: 'question', text: c.title } as Item,
              ...(c.answer ? [{ id: next++, kind: 'answer', html: c.answer } as Item] : []),
            ],
          ]),
        ),
  )
  const conversation = ref<string | null>(empty ? null : 'c1')
  const loading = ref(false)
  const listLoading = ref(false)
  const question = ref('')
  let listed = !slowList

  const items = computed(() => (conversation.value ? (threads.value[conversation.value] ?? []) : []))
  const pending = computed(() => conversations.value.find((c) => c.id === conversation.value)?.pending ?? false)
  const status = computed(() => (pending.value ? 'pending' : 'ready'))
  const find = (id: string) => conversations.value.find((c) => c.id === id)

  const fetchList = () => {
    if (listed) return
    listed = true
    listLoading.value = true
    setTimeout(() => (listLoading.value = false), 900)
  }

  const answerLater = (id: string, after = 2600) =>
    setTimeout(() => {
      const c = find(id)
      if (!c?.pending) return
      threads.value[id].push({ id: next++, kind: 'answer', html: id === 'c2' ? LATE_ANSWER : ANSWER })
      c.pending = false
    }, after)

  const choose = (id: string | null) => {
    conversation.value = id
    if (!id) return
    loading.value = true
    setTimeout(() => (loading.value = false), 450)
    if (find(id)?.pending) answerLater(id)
  }

  const begin = (text: string) => {
    let id = conversation.value
    if (!id) {
      id = `n${next++}`
      conversations.value.unshift({ id, title: text, at: new Date() })
      threads.value[id] = []
      conversation.value = id
    }
    const c = find(id)
    if (c) {
      c.at = new Date()
      c.pending = true
    }
    return id
  }

  const ask = (text: string) => {
    const id = begin(text)
    threads.value[id].push({ id: next++, kind: 'question', text })
    question.value = ''
    answerLater(id)
  }

  const askVoice = (recording: TolbiAiVoiceRecording) => {
    const id = begin('Explique-moi les résultats de ce projet.')
    const note = next++
    threads.value[id].push({ id: note, kind: 'voice', recording, src: URL.createObjectURL(recording.blob), state: 'transcribing' })
    setTimeout(() => {
      const voice = threads.value[id].find((i) => i.id === note)
      if (voice?.kind === 'voice') voice.state = 'transcribed'
    }, 1500)
    answerLater(id)
  }

  const stop = () => {
    const c = conversation.value ? find(conversation.value) : undefined
    if (c) c.pending = false
  }

  const restart = () => (conversation.value = null)

  /* Renamed in the row: the product keeps the title (ADR-0072). */
  const rename = (id: string, title: string) => {
    const c = find(id)
    if (c) c.title = title
  }

  /*
    Deleted at once, with « Annuler » in a toast for as long as it stays (8s
    with an action, ADR-0052): the conversation comes back where it was, and
    is current again if it was. Deleting the current one opens a new one.
  */
  type Removed = { key: number; item: TolbiAiConversation; index: number; wasCurrent: boolean }
  const removed = ref<Removed[]>([])
  let removedKey = 1

  const remove = (id: string) => {
    const index = conversations.value.findIndex((c) => c.id === id)
    if (index < 0) return
    const [item] = conversations.value.splice(index, 1)
    const wasCurrent = item.id === conversation.value
    removed.value.push({ key: removedKey++, item, index, wasCurrent })
    if (wasCurrent) conversation.value = null
  }

  const undo = (r: Removed) => {
    conversations.value.splice(Math.min(r.index, conversations.value.length), 0, r.item)
    if (r.wasCurrent && conversation.value === null) conversation.value = r.item.id
    removed.value = removed.value.filter((x) => x.key !== r.key)
  }

  const forget = (key: number) => (removed.value = removed.value.filter((x) => x.key !== key))

  return {
    conversations, conversation, loading, listLoading, question, items, pending, status,
    fetchList, choose, ask, askVoice, stop, restart, rename, remove, removed, undo, forget,
  }
}

/* The product's toasts: a deleted conversation and the way back. */
const TOASTS = `
  <ToastRegion>
    <Toast
      v-for="r in removed"
      :key="r.key"
      message="Conversation supprimée"
      :detail="r.item.title"
      @dismiss="forget(r.key)"
    >
      <template #actions>
        <Button label="Annuler" variant="link" size="sm" @click="undo(r)" />
      </template>
    </Toast>
  </ToastRegion>
`

/* The panel's body, the same in every story that keeps a history. */
const BODY = `
  <TolbiAiWelcome
    v-if="!items.length"
    key="welcome"
    :suggestions="SUGGESTIONS"
    :awaken="awaken"
    @awake="awoken = true"
    @select="ask"
  />
  <TolbiAiThread v-else :key="conversation">
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
      <TolbiAiAnswer v-else><div v-html="item.html" /></TolbiAiAnswer>
    </template>
    <TolbiAiThinkingLine v-if="pending" key="waiting" />
  </TolbiAiThread>
`

const PANEL_PIECES = {
  TolbiAiPanel, TolbiAiWelcome, TolbiAiThread, TolbiAiQuestion, TolbiAiAnswer, TolbiAiThinkingLine, TolbiAiVoiceNote, TolbiAiComposer,
  Toast, ToastRegion, Button,
}

const withHistory = ({ empty = false } = {}) => () => ({
  components: PANEL_PIECES,
  setup: () => ({ ...useConversations({ empty }), open: ref(true), expanded: ref(false), awaken: false, awoken: ref(true), SUGGESTIONS, STAGE }),
  template: `
    <div :style="STAGE">
      <div style="flex:1; min-width:0;" />
      <TolbiAiPanel
        v-model:open="open"
        v-model:expanded="expanded"
        :conversations="conversations"
        :conversation="conversation"
        :conversations-loading="listLoading"
        :loading="loading"
        @update:conversation="choose"
        @history="fetchList"
        @new-conversation="restart"
        @rename-conversation="rename"
        @delete-conversation="remove"
      >
        ${BODY}
        <template #composer>
          <TolbiAiComposer v-model="question" :status="status" voice scope="Rendement Arachide Nord" @send="ask" @send-voice="askVoice" @stop="stop" />
        </template>
      </TolbiAiPanel>
      ${TOASTS}
    </div>
  `,
})

/** L'accueil d'un projet sans conversation : l'en-tête dit « Nouvelle conversation », la première naît avec la première question. */
export const Welcome: Story = {
  name: 'Accueil',
  render: withHistory({ empty: true }),
}

/**
 * Une conversation du projet : son titre est en tête, et l'ouvre sur les autres
 * (ADR-0069) — groupées par jour, l'actuelle marquée, une recherche dès huit.
 * Choisir change le fil par un fondu, un squelette le temps qu'elle arrive ;
 * « Quelle parcelle… » attend encore sa réponse, qui arrive quand on l'ouvre.
 */
export const Conversation: Story = {
  name: 'Conversation',
  render: withHistory(),
}

/**
 * La réponse arrive (ADR-0068) : une ligne de lumière, aux deux encres de
 * l'étincelle, descend la réponse et la laisse voir — comme le passage d'un
 * satellite sur une parcelle. Une fois, à l'arrivée ; « Rejouer » relance la
 * question. Une conversation rouverte ne rejoue rien.
 */
export const Arrival: Story = {
  name: 'La réponse arrive',
  render: () => ({
    components: { TolbiAiPanel, TolbiAiThread, TolbiAiQuestion, TolbiAiAnswer, TolbiAiThinkingLine, TolbiAiComposer, Button },
    setup() {
      const run = ref(0)
      const answered = ref(false)
      const question = ref('')
      let timer: ReturnType<typeof setTimeout> | undefined
      const play = () => {
        clearTimeout(timer)
        answered.value = false
        run.value++
        timer = setTimeout(() => (answered.value = true), 1600)
      }
      play()
      return { run, answered, question, play, ANSWER, STAGE }
    },
    template: `
      <div :style="STAGE">
        <div style="flex:1; min-width:0; padding:var(--ds-spacing-2xl);">
          <Button label="Rejouer" variant="secondary-gray" size="sm" icon-leading="refresh-cw" @click="play" />
        </div>
        <TolbiAiPanel :open="true">
          <TolbiAiThread :key="run">
            <TolbiAiQuestion key="q" text="Expliquer les résultats de ce projet" />
            <TolbiAiThinkingLine v-if="!answered" key="waiting" />
            <TolbiAiAnswer v-else key="a"><div v-html="ANSWER" /></TolbiAiAnswer>
          </TolbiAiThread>
          <template #composer><TolbiAiComposer v-model="question" scope="Rendement Arachide Nord" /></template>
        </TolbiAiPanel>
      </div>
    `,
  }),
}

const WORKSPACES = [{ id: 'kaolack', name: 'Coopérative de Kaolack' }]

/*
  The product's frame, as Figma draws it (2310:3618): the navigation, then a
  column holding the bar and the row — the page, then the panel. The page is
  its own stacking context, as the panel asks.
*/
const inThePage = ({ open: startOpen = false, expanded: startExpanded = false, empty = false, slowList = false } = {}) => ({
  components: { SideNavigation, SideNavItem, WorkspaceSelector, HorizontalNavigation, TolbiAiLauncher, ...PANEL_PIECES },
  setup() {
    const section = ref('projets')
    const navCollapsed = ref(false)
    const open = ref(startOpen)
    const expanded = ref(startExpanded)
    /* The first opening awakens the sign; after that, it is at rest. */
    const awoken = ref(startOpen)
    const awaken = computed(() => !awoken.value)
    return {
      ...useConversations({ empty, slowList }),
      section, navCollapsed, open, expanded, awoken, awaken, WORKSPACES, SUGGESTIONS,
    }
  },
  template: `
    <div style="height:100vh; min-height:720px; display:flex; background:var(--ds-bg-neutral);">
      <SideNavigation
        v-model="section"
        v-model:collapsed="navCollapsed"
        aria-label="Navigation principale"
        :style="navCollapsed ? '' : 'width: 268px'"
      >
        <template #header>
          <WorkspaceSelector :workspaces="WORKSPACES" model-value="kaolack" :collapsed="navCollapsed" />
        </template>
        <SideNavItem value="accueil" icon="house" label="Accueil" />
        <SideNavItem value="projets" icon="folder" label="Projets" />
        <SideNavItem value="cartographie" icon="map" label="Cartographie" />
        <SideNavItem value="rapports" icon="chart-column" label="Rapports" />
        <SideNavItem value="parametres" icon="settings" label="Paramètres" />
      </SideNavigation>
      <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--ds-spacing-lg); padding:var(--ds-spacing-lg) var(--ds-spacing-lg) 0 var(--ds-spacing-md);">
        <HorizontalNavigation module="Yield" :breadcrumbs="[{ label: 'Projets' }, { label: 'Rendement Arachide Nord' }]" user-initials="AY" />
        <div style="flex:1; min-height:0; display:flex;">
          <main style="flex:1; min-width:0; isolation:isolate; display:flex; flex-direction:column;">
            <div style="flex:1; display:flex; flex-direction:column; gap:var(--ds-spacing-xl); border-radius:var(--ds-radius-surface) var(--ds-radius-surface) 0 0; background:var(--ds-bg-default); padding:var(--ds-spacing-2xl);">
              <p style="margin:0; font:var(--ds-font-body-md); color:var(--ds-text-subtle);">
                La page du projet — elle se resserre quand le panneau s'ouvre. Agrandi, le panneau la
                recouvre sans la toucher ; « Réduire » la rend telle qu'on l'a laissée.
              </p>
              <div style="flex:1; display:grid; place-items:center; border-radius:var(--ds-radius-surface-sm); background:var(--ds-bg-neutral-subtle); font:var(--ds-font-label-md); color:var(--ds-text-subtlest);">
                Carte
              </div>
            </div>
          </main>
          <TolbiAiPanel
            id="tolbi-ai-panel"
            v-model:open="open"
            v-model:expanded="expanded"
            :conversations="conversations"
            :conversation="conversation"
            :conversations-loading="listLoading"
            :loading="loading"
            @update:conversation="choose"
            @history="fetchList"
            @new-conversation="restart"
            @rename-conversation="rename"
            @delete-conversation="remove"
          >
            ${BODY}
            <template #composer>
              <TolbiAiComposer v-model="question" :status="status" voice scope="Rendement Arachide Nord" @send="ask" @send-voice="askVoice" @stop="stop" />
            </template>
          </TolbiAiPanel>
          <TolbiAiLauncher v-model:open="open" controls="tolbi-ai-panel" />
          ${TOASTS}
        </div>
      </div>
    </div>
  `,
})

/**
 * Le parcours, dans la page : le bouton flottant en bas à droite ouvre le
 * panneau (⌘J aussi) et s'efface tant qu'il est ouvert (ADR-0070) — la première
 * fois, le signe s'éveille —
 * la page se resserre ; une suggestion ou une question part dans le fil, la ligne
 * d'attente la suit, la réponse prend sa place. Le titre en tête ouvre les autres
 * conversations du projet (ADR-0069). « Agrandir » donne au panneau la surface de
 * la page, « Réduire » la lui rend. Le micro de cette histoire est le vrai : le
 * navigateur le demandera.
 */
export const InThePage: Story = {
  name: 'Dans la page',
  render: () => inThePage(),
}

/**
 * Agrandi (Figma 2310:4829) : le panneau prend la surface de la page — la barre
 * et la navigation n'en perdent rien —, une colonne de lecture de 720 px, la
 * saisie en bas. La page est dessous, inerte, à sa largeur : « Réduire » la rend
 * telle qu'on l'a laissée.
 */
export const Expanded: Story = {
  name: 'Agrandi',
  render: () => inThePage({ open: true, expanded: true }),
}

/**
 * L'historique se fait attendre : la première fois que le titre l'ouvre, le
 * produit le demande (`history`) et des lignes de squelette tiennent sa place.
 */
export const HistoryLoading: Story = {
  name: 'Historique — la liste se charge',
  render: () => inThePage({ open: true, slowList: true }),
}

/**
 * Un projet sans conversation : « Nouvelle conversation » en tête, une phrase
 * dans la liste ; la première question crée la première conversation.
 */
export const FirstConversation: Story = {
  name: 'Historique — la première conversation',
  render: () => inThePage({ open: true, empty: true }),
}
