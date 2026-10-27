import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import OptionList from './OptionList.vue'
import OptionCard from './OptionCard.vue'

const meta: Meta<typeof OptionList> = {
  title: 'Saisie/OptionList',
  component: OptionList,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une option à choisir, en carte ou en ligne (ADR-0086). `OptionCard` : un média en tête (icône sur sa tuile, avatar, ' +
          'drapeau ou `#media`), le titre et sa phrase, une méta juste avant la fin, **le contrôle à la fin** — là où le chevron ' +
          'est forcément. `OptionList` tient le choix : `v-model` et des ronds pour un seul, `multiple` + `v-model:values` et des ' +
          'cases pour plusieurs ; `layout="grid"` (2 à 4 colonnes, hauteur égale, en pile quand la place manque) ou `stack`. ' +
          'Choisie, une carte le dit trois fois : contour `border-brand` en 2 px, teinte `bg-selected`, contrôle coché. De vrais ' +
          'ronds et de vraies cases cachés, la carte pour label : le clavier est celui du navigateur. Seule, avec `href` ou un ' +
          'clic, la carte **mène** : un chevron, pas d’état choisi.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Le type de projet : deux options, un seul choix, l’une désactivée. */
export const ProjectType: Story = {
  name: 'Un seul choix — le type de projet',
  render: () => ({
    components: { OptionList, OptionCard },
    setup: () => ({ value: ref('reference') }),
    template: `
      <div style="max-width:432px">
        <OptionList v-model="value" legend="Type de projet">
          <OptionCard value="reference" label="Référence" description="Évaluez l’état de référence de la zone, avant votre intervention." />
          <OptionCard value="follow" label="Suivi" description="Mesurez l’évolution de la zone depuis un état de référence." />
          <OptionCard value="audit" label="Audit" description="Indisponible pour un projet sans état de référence." disabled />
        </OptionList>
        <p style="margin-top:var(--ds-spacing-lg); font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">v-model : {{ value }}</p>
      </div>
    `,
  }),
}

/** La zone du projet : en grille, quatre méthodes, une icône chacune ; hauteur égale sur la ligne. */
export const Grid: Story = {
  name: 'En grille — la zone du projet',
  render: () => ({
    components: { OptionList, OptionCard },
    setup: () => ({ value: ref('draw') }),
    template: `
      <div style="max-width:760px">
        <OptionList v-model="value" layout="grid" :columns="2" legend="Zone du projet">
          <OptionCard value="producers" icon="users" label="Producteurs" description="Les parcelles des producteurs d’une liste." />
          <OptionCard value="admin" icon="map" label="Zone administrative" description="Une région, un département, une commune." />
          <OptionCard value="draw" icon="pencil" label="Tracé" description="Dessinez la zone sur la carte." />
          <OptionCard value="file" icon="upload" label="Fichier" description="Importez un GeoJSON, un KML ou un shapefile." />
        </OptionList>
      </div>
    `,
  }),
}

/** Le pays : en pile, un drapeau et une méta. */
export const Countries: Story = {
  name: 'En pile — le pays, avec une méta',
  render: () => ({
    components: { OptionList, OptionCard },
    setup: () => ({ value: ref('CI') }),
    template: `
      <div style="max-width:432px">
        <OptionList v-model="value" legend="Pays">
          <OptionCard value="CI" flag="CI" label="Côte d’Ivoire" meta="128 parcelles" />
          <OptionCard value="GH" flag="GH" label="Ghana" meta="42 parcelles" />
          <OptionCard value="CM" flag="CM" label="Cameroun" meta="9 parcelles" />
        </OptionList>
      </div>
    `,
  }),
}

/** Les coopératives : plusieurs choix, des cases ; chaque case est un arrêt de Tab. */
export const Multiple: Story = {
  name: 'Plusieurs choix — les coopératives',
  render: () => ({
    components: { OptionList, OptionCard },
    setup: () => ({ values: ref(['bayan']) }),
    template: `
      <div style="max-width:432px">
        <OptionList multiple v-model:values="values" legend="Coopératives">
          <OptionCard value="gripazo" avatar-initials="GC" label="Gripazo coopérative" description="Soubré, Nawa" meta="42 producteurs" />
          <OptionCard value="bayan" avatar-initials="CB" label="Coops Bayan Cocoa" description="Méagui, Nawa" meta="128 producteurs" />
          <OptionCard value="divo" avatar-initials="DN" label="Divo Nord" description="Divo, Lôh-Djiboua" meta="17 producteurs" />
        </OptionList>
        <p style="margin-top:var(--ds-spacing-lg); font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">v-model:values : {{ values.join(', ') }}</p>
      </div>
    `,
  }),
}

/** La ligne qui mène : un lien ou un bouton, un chevron, pas d’état choisi. */
export const Leads: Story = {
  name: 'La ligne qui mène — le chevron',
  render: () => ({
    components: { OptionCard },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-md); max-width:560px">
        <OptionCard href="#ddr" icon="file-text" label="Déclaration de diligence raisonnée" description="Le dossier à déposer pour un lot." meta="3 brouillons" />
        <OptionCard icon="folder" label="Dossiers du projet" description="Les pièces jointes et leurs versions." meta="12" />
        <OptionCard icon="shield-check" label="Analyse de conformité" description="Le résultat EUDR, parcelle par parcelle." disabled />
      </div>
    `,
  }),
}
