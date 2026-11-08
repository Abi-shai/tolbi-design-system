import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import OptionCard from './OptionCard.vue'
import OptionList from './OptionList.vue'

const meta: Meta<typeof OptionCard> = {
  title: 'Saisie/OptionList/Card',
  component: OptionCard,
  tags: ['stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une option présentée comme une carte (ADR-0086) : le média au début, le titre et sa phrase, une ' +
          'méta, et **le contrôle à la fin** — là où un chevron doit être.\n\n' +
          'Dans une `OptionList`, c’est une **vraie case ou un vrai bouton radio caché**, dont la carte est ' +
          'le label : le clavier est celui du navigateur, pas le nôtre. **Seule**, avec `href` ou un clic, ' +
          'c’est le même dessin mais **une rangée qui mène** — un `<a>` ou un `<button>`, un chevron à la ' +
          'place du contrôle, et **aucun état choisi** : une rangée qui mène ne se choisit pas. Avec `actionLabel`, ' +
          'c’est **une rangée qui porte une action** (ADR-0126) : un fichier à télécharger, pas un endroit où aller.\n\n' +
          'Le survol est le **contour seul**, parce qu’un fond avalerait la tuile de l’icône — `bg-hover` ' +
          'est justement son primitif.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof OptionCard>

/** Seule : une rangée qui mène. Chevron, pas de contrôle, pas d’état choisi. */
export const Leading: Story = {
  name: 'Une rangée qui mène',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:420px">
        <OptionCard
          href="#cacao"
          icon="leaf"
          label="Cacao"
          description="Theobroma cacao — SH 1801"
          meta="128 ha"
        />
        <OptionCard
          href="#hevea"
          icon="trees"
          label="Hévéa"
          description="Hevea brasiliensis — SH 4001"
          meta="74 ha"
        />
      </div>
    `,
  }),
}

/** Les médias : une icône sur sa tuile, un avatar, un drapeau. */
export const Media: Story = {
  name: 'Les trois médias',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:420px">
        <OptionCard href="#a" icon="land-plot" label="Parcelle 62590-014" description="Soubré · 3,42 ha" />
        <OptionCard href="#b" avatar-initials="AD" label="Awa Diop" description="Responsable conformité" />
        <OptionCard href="#c" flag="CI" label="Côte d’Ivoire" description="Pays de récolte" />
      </div>
    `,
  }),
}

/** Désactivée : le contour, le fond et toutes les encres reculent ensemble. */
export const Disabled: Story = {
  name: 'Désactivée',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="max-width:420px">
        <OptionCard icon="leaf" label="Café" description="Coffea canephora — SH 0901" meta="22 ha" disabled />
      </div>
    `,
  }),
}

/**
 * **Une rangée qui porte une action** (ADR-0126, ADR-0127) — les documents d’un rapport ARR : un fichier à télécharger,
 * pas un endroit où aller. La rangée n’est plus un bouton ni un lien ; le chevron laisse la place au **glyphe seul** de
 * l’action — `IconButton xs subtle`, rond, sans bordure, sans mot — en haut à droite, et c’est lui qui prend le focus.
 * `actionLabel` est son nom et son infobulle ; `actionLoading` fait tourner le glyphe pendant la génération du
 * fichier ; `disabled` grise la rangée et le bouton. Une seule action par rangée.
 */
export const WithAction: Story = {
  name: 'Une rangée qui porte une action',
  render: () => ({
    components: { OptionCard },
    setup() {
      const busy = ref<string | null>(null)
      const download = (id: string) => { busy.value = id; setTimeout(() => { busy.value = null }, 1600) }
      const docs = [
        { id: 'report', icon: 'file-text', label: 'Rapport de 2026', description: 'La baseline, les points de contrôle et le carbone gagné, en PDF' },
        { id: 'points', icon: 'map-pin', label: 'Points du projet et de contrôle', description: 'Les 240 points et leurs mesures, en CSV' },
        { id: 'method', icon: 'book-open', label: 'Méthode', description: 'VM0047, ce qui a été appliqué et pourquoi' },
        { id: 'pd', icon: 'clipboard-list', label: 'PD pré-remplie', description: 'Le document de projet, prêt à compléter' },
        { id: 'audit', icon: 'folder', label: 'Dossier auditeur', description: 'Tout ce qu’un auditeur demande, en une archive', disabled: true },
      ]
      return { docs, busy, download }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:560px">
        <OptionCard
          v-for="d in docs"
          :key="d.id"
          :icon="d.icon"
          :label="d.label"
          :description="d.description"
          :disabled="d.disabled"
          action-label="Télécharger"
          action-icon="download"
          :action-loading="busy === d.id"
          @action="download(d.id)"
        />
      </div>
    `,
  }),
}

/**
 * ADR-0135 — **une ligne pour la phrase** : dans une liste de parcelles (`OptionList layout="stack"` dans un
 * `MapPanel lg`), `descriptionLines: 1` coupe la phrase en « … » et toutes les rangées gardent la même hauteur.
 * Coupée, elle se lit entière au survol (une infobulle, **seulement quand elle est coupée**) ; un lecteur d’écran
 * l’entend toujours entière. `labelLines` fait de même pour le titre.
 */
export const OneLine: Story = {
  name: 'Phrase sur une ligne',
  render: () => ({
    components: { OptionCard, OptionList },
    setup: () => ({
      parcel: ref('P-0412'),
      parcels: [
        { code: 'P-0412', who: 'Traoré Moussa · Djoutougbo 2', ha: '17,5 ha' },
        { code: 'P-0413', who: 'Koné Aminata Fatoumata · Djoutougbo 2 — bas-fond nord, près du marigot', ha: '4,2 ha' },
        { code: 'P-0415', who: 'Diallo Ibrahima · Sokoura', ha: '9,8 ha' },
        { code: 'P-0419', who: 'Ouattara Salimata · Kafiné 1 — parcelle partagée avec la coopérative', ha: '12,1 ha' },
      ],
    }),
    template: `
      <div style="width:23rem;--reading-secondary-font:var(--ds-font-body-md)">
        <OptionList v-model="parcel" layout="stack" aria-label="Parcelles">
          <OptionCard v-for="p in parcels" :key="p.code" :value="p.code" :label="p.code" :description="p.who" :meta="p.ha" :description-lines="1" />
        </OptionList>
      </div>
    `,
  }),
}
