import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import Dialog from './Dialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { Button } from '../Button'
import { FormField } from '../FormField'
import { InputField } from '../InputField'
import { Checkbox } from '../Checkbox'

const meta: Meta<typeof Dialog> = {
  title: 'Superposition/Dialog',
  component: Dialog,
  tags: ['stable'],
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
          'confirmation, en trois niveaux : confirmer, montrer ce qui part, taper le nom. **Sur le côté** ' +
          '(`placement="side"`, ADR-0079), c’est le panneau latéral : même voile, même focus, posé à 12 px des bords, ' +
          'filets en retrait, fondu quand il reste du contenu dessous. `size` vaut pour les deux formes : `sm` 24rem, `md` 32rem, `lg` 45rem, ' +
          '`xl` 60rem, `full`.',
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

/* ── At the side — the side panel (ADR-0079) ─────────────────────────── */

const PROJECTS = ['Référence carbone — Gripazo', 'Suivi carbone — Gripazo 2025', 'Suivi carbone — Gripazo 2026']
const CHOICES = 'display:flex; gap:var(--ds-spacing-2xl);'
const ZONE = 'height:200px; border-radius:var(--ds-radius-control); background:var(--ds-bg-neutral-subtle);'

/**
 * Le panneau latéral (Figma « Panneau latéral », piste B, tranchée le 21 oct.) : `placement="side"`. Même voile,
 * même focus, même fermeture que la modale ; la surface se pose à 12 px des bords de l’écran, sur toute la hauteur.
 * L’en-tête — titre et description — et le pied restent, chacun fermé par un filet en retrait ; le corps défile
 * entre eux, à 20 px des bords, et un fondu sur ses 64 derniers pixels dit qu’il en reste dessous. Sous 40rem, plein
 * écran, le pied empilé. Le corps est au produit.
 */
export const Side: Story = {
  name: 'Panneau latéral',
  render: () => ({
    components: { Dialog, Button, FormField, InputField, Checkbox },
    setup: () => ({
      open: ref(false), name: ref('Référence carbone — Soubré 2025'), kind: ref('reference'), period: ref('single'),
      PAGE, PROJECTS, CHOICES, ZONE,
    }),
    template: `
      <div :style="PAGE">
        <Button label="Créer un projet" variant="primary" icon-leading="plus" @click="open = true" />
        <span v-for="p in PROJECTS" :key="p">{{ p }}</span>
        <Dialog
          v-model:open="open"
          placement="side"
          title="Créer un projet"
          description="Remplissez les informations requises et créez votre projet."
        >
          <FormField label="Nom du projet" required>
            <InputField v-model="name" data-autofocus />
          </FormField>
          <FormField label="Type de projet" hint="Choisissez ce que le projet mesure.">
            <div :style="CHOICES">
              <Checkbox type="radio" name="kind" value="reference" :model-value="kind === 'reference'" @update:model-value="kind = 'reference'" label="Référence" />
              <Checkbox type="radio" name="kind" value="follow" :model-value="kind === 'follow'" @update:model-value="kind = 'follow'" label="Suivi" />
            </div>
          </FormField>
          <FormField label="Période de l’analyse" hint="Une analyse à une date, ou sur une plage de dates.">
            <div :style="CHOICES">
              <Checkbox type="radio" name="period" value="single" :model-value="period === 'single'" @update:model-value="period = 'single'" label="Date unique" />
              <Checkbox type="radio" name="period" value="range" :model-value="period === 'range'" @update:model-value="period = 'range'" label="Plage de dates" />
            </div>
          </FormField>
          <FormField label="Date de l’analyse">
            <InputField model-value="15 janv. 2025" />
          </FormField>
          <FormField label="Zone du projet" required>
            <div :style="ZONE" />
          </FormField>
          <template #actions>
            <Button label="Annuler" variant="secondary-gray" size="sm" @click="open = false" />
            <Button label="Créer le projet" variant="primary" size="sm" @click="open = false" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}

/** Une échelle pour les deux formes : `sm` 24rem, `md` 32rem (défaut), `lg` 45rem, `xl` 60rem, et `full`. */
export const Sizes: Story = {
  name: 'Tailles',
  render: () => ({
    components: { Dialog, Button },
    setup: () => ({ open: ref<string | null>(null), PAGE, SIZES: ['sm', 'md', 'lg', 'xl', 'full'], placement: ref('centre') }),
    template: `
      <div :style="PAGE">
        <div style="display:flex; gap:var(--ds-spacing-md); flex-wrap:wrap;">
          <Button v-for="s in SIZES" :key="'c' + s" :label="'Centre · ' + s" variant="secondary-gray" @click="placement = 'centre'; open = s" />
        </div>
        <div style="display:flex; gap:var(--ds-spacing-md); flex-wrap:wrap;">
          <Button v-for="s in SIZES" :key="'s' + s" :label="'Côté · ' + s" variant="secondary-gray" @click="placement = 'side'; open = s" />
        </div>
        <Dialog
          v-for="s in SIZES"
          :key="s"
          :open="open === s"
          @update:open="(v) => { if (!v) open = null }"
          :placement="placement"
          :size="s"
          :title="'Taille ' + s"
          description="La largeur est un plafond : un écran étroit donne moins."
        >
          <template #actions>
            <Button label="Fermer" variant="secondary-gray" @click="open = null" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}

const FIELDS = [
  { id: 'p1', name: 'Parcelle Ndiaye 1', ha: 4.2 },
  { id: 'p2', name: 'Parcelle Ndiaye 2', ha: 5.8 },
  { id: 'p3', name: 'Parcelle Sow — bas-fond', ha: 2.5 },
  { id: 'p4', name: 'Parcelle Sow — plateau', ha: 7.1 },
  { id: 'p5', name: 'Parcelle Diallo', ha: 3.4 },
  { id: 'p6', name: 'Parcelle Fall', ha: 6.0 },
  { id: 'p7', name: 'Parcelle Ba', ha: 1.9 },
  { id: 'p8', name: 'Parcelle Kane', ha: 8.3 },
]

/**
 * ADR-0081 — un résumé au début du pied (`summary`, ou le slot `#summary`) : ce sur quoi les actions vont
 * agir. Le pied reste quand le corps défile, donc les chiffres restent en vue pendant qu’on coche ; chaque
 * changement est annoncé (`role="status"`). Libellé sur valeur, sans fond — le pied est déjà un niveau. Faute
 * de place, les actions passent dessous, toujours à droite.
 */
export const Summary: Story = {
  name: 'Résumé dans le pied',
  render: () => ({
    components: { Dialog, Button, Checkbox },
    setup() {
      const open = ref<'centre' | 'side' | null>(null)
      const linked = ref<string[]>(['p1'])
      const toggle = (id: string) => {
        linked.value = linked.value.includes(id) ? linked.value.filter(x => x !== id) : [...linked.value, id]
      }
      const ha = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n)
      const summary = () => {
        const n = linked.value.length
        const area = FIELDS.filter(f => linked.value.includes(f.id)).reduce((t, f) => t + f.ha, 0)
        return [
          { label: 'Champs liés', value: n + (n > 1 ? ' champs' : ' champ') },
          { label: 'Surface occupée', value: ha(area) + ' ha' },
        ]
      }
      return { open, linked, toggle, summary, FIELDS, ha, PAGE }
    },
    template: `
      <div :style="PAGE">
        <div style="display:flex; gap:var(--ds-spacing-md)">
          <Button label="Lier des champs" variant="secondary-gray" @click="open = 'centre'" />
          <Button label="Lier des champs — côté" variant="secondary-gray" @click="open = 'side'" />
        </div>
        <Dialog
          :open="open !== null"
          @update:open="(v) => { if (!v) open = null }"
          :placement="open === 'side' ? 'side' : 'centre'"
          :size="open === 'side' ? 'md' : 'lg'"
          title="Lier des champs"
          description="Les champs où le produit a été cultivé."
          :summary="summary()"
        >
          <template #form>
          <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-md)">
            <Checkbox
              v-for="f in FIELDS"
              :key="f.id"
              size="md"
              :model-value="linked.includes(f.id)"
              @update:model-value="toggle(f.id)"
              :label="f.name"
              :supporting-text="ha(f.ha) + ' ha'"
            />
          </div>
          </template>
          <template #actions>
            <Button label="Annuler" variant="secondary-gray" size="sm" @click="open = null" />
            <Button label="Lier les champs" variant="primary" size="sm" :disabled="!linked.length" @click="open = null" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}

/* A list from another library, as reka-ui builds one: a combobox whose listbox
   closes on a `keydown` heard on `window` — without cancelling the key. */
const ForeignSelect = defineComponent({
  props: { label: { type: String, required: true }, options: { type: Array as () => string[], required: true } },
  setup(props) {
    const open = ref(false)
    const value = ref(props.options[0])
    const id = `foreign-${Math.random().toString(36).slice(2, 8)}`
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open.value) open.value = false }
    onMounted(() => window.addEventListener('keydown', onKey))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
    return () => h('div', { style: 'position:relative; display:flex; flex-direction:column; gap:var(--ds-spacing-sm); font:var(--ds-font-body-md)' }, [
      h('label', { for: id, style: 'font:var(--ds-font-label-lg); color:var(--ds-text-default)' }, props.label),
      h('input', {
        id, role: 'combobox', readonly: true, value: value.value,
        'aria-expanded': String(open.value), 'aria-haspopup': 'listbox', 'aria-controls': id + '-list',
        style: 'padding:var(--ds-control-padding-md); border:var(--ds-border-width-default) solid var(--ds-border-default); border-radius:var(--ds-radius-control); font:var(--ds-font-body-lg)',
        onClick: () => { open.value = !open.value },
        onKeydown: (e: KeyboardEvent) => { if (e.key === 'ArrowDown') { open.value = true; e.preventDefault() } },
      }),
      open.value ? h('ul', {
        id: id + '-list', role: 'listbox',
        style: 'margin:0; padding:var(--ds-spacing-xs); list-style:none; border:var(--ds-border-width-default) solid var(--ds-border-subtle); border-radius:var(--ds-radius-control); background:var(--ds-bg-default); box-shadow:var(--ds-elevation-overlay)',
      }, props.options.map(o => h('li', { role: 'option', 'aria-selected': String(o === value.value), style: 'padding:var(--ds-spacing-sm) var(--ds-spacing-md); cursor:pointer', onClick: () => { value.value = o; open.value = false } }, o))) : null,
    ])
  },
})

/**
 * ADR-0083 (retour 34) — une liste d’une autre bibliothèque, ouverte dans la fenêtre, qui se ferme sur une Échap
 * écoutée sur `window` sans l’annuler (reka-ui, donc Nuxt UI). La première Échap ferme la liste et laisse la
 * fenêtre ; la seconde ferme la fenêtre. Une Échap visant une couche ouverte que la surface contient — une liste,
 * un menu, une fenêtre, un popover, ou le contrôle qui l’a ouverte — est à cette couche, prise ou non.
 */
export const ForeignList: Story = {
  name: 'Une liste d’une autre bibliothèque',
  render: () => ({
    components: { Dialog, Button, ForeignSelect },
    setup: () => ({ open: ref<'centre' | 'side' | null>(null), last: ref('—'), PAGE }),
    template: `
      <div :style="PAGE">
        <div style="display:flex; gap:var(--ds-spacing-md)">
          <Button label="Fenêtre" variant="secondary-gray" @click="open = 'centre'" />
          <Button label="Panneau latéral" variant="secondary-gray" @click="open = 'side'" />
        </div>
        <span>Dernière fermeture : {{ last }}</span>
        <Dialog
          :open="open !== null"
          @update:open="(v) => { if (!v) open = null }"
          @cancel="last = 'Échap ou voile'"
          :placement="open === 'side' ? 'side' : 'centre'"
          title="Créer une déclaration"
          description="Ouvrez la liste des pays, puis appuyez sur Échap."
        >
          <template #form>
            <ForeignSelect label="Pays d’origine" :options="['Sénégal', 'Côte d’Ivoire', 'Mali', 'Ghana']" />
          </template>
          <template #actions>
            <Button label="Annuler" variant="secondary-gray" size="sm" @click="open = null" />
            <Button label="Continuer" size="sm" @click="open = null" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}

