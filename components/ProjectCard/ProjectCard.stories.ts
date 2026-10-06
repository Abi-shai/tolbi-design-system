import type { Meta, StoryObj } from '@storybook/vue3'
import ProjectCard from './ProjectCard.vue'
import Docs from './ProjectCard.mdx'
import { moduleNames } from '../ModuleIcon'

const meta: Meta<typeof ProjectCard> = {
  title: 'Données/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: {
      page: Docs,
      description: {
        component:
          "Un projet d'un module, en tuile. **La coque est partagée, l'aperçu ne l'est pas** : " +
          'tous les modules ont la même anatomie — état, nom, ligne d’identité, deux chiffres, ' +
          'fraîcheur — et c’est ce qui rend lisible une grille qui les mélange. Ce qu’un module ' +
          '*mesure* est le seul endroit où le motif a le droit de casser.\n\n' +
          'Il se trouve que les deux modules livrés décrivent **la même chose** : une répartition. ' +
          '`crops` répartit la parcelle entre cultures, et `stage` entre stades phénologiques — une ' +
          'parcelle n’est jamais *à* un stade, ses hectares sont étalés sur plusieurs à la fois, ' +
          '80 % en floraison et 5 % encore en montaison. Donc **une seule géométrie**, et deux props ' +
          'séparées parce qu’un stade et une culture ne sont pas la même chose pour l’appelant.\n\n' +
          'Les segments sont ordonnés **du plus gros au plus petit**, par le composant : la palette ' +
          'catégorielle est ordonnée par ΔE mesuré (ADR-0016), donc la part dominante prend toujours ' +
          'la teinte la plus distinguable.\n\n' +
          '`module` pose le **repère du module** sur la ligne du titre — la seule chose de la carte ' +
          'qui dise à qui appartient le projet. Elle ne décide rien : le bloc du bas découle ' +
          'toujours de la donnée.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['planned', 'running', 'done', 'loading'],
      table: { category: 'État' },
    },
    demo: { control: 'boolean', table: { category: 'État' } },
    module: {
      control: 'select',
      options: [undefined, ...moduleNames],
      description:
        'Le module auquel appartient le projet — son illustration se pose devant le titre. ' +
        '`ModuleName` ne couvre que les 11 modules dont le système a le dessin ; pour les autres, ' +
        'laisser vide.',
      table: { category: 'Contenu', type: { summary: 'ModuleName' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const YIELD = {
  title: 'Rendement Arachide Nord',
  module: 'Yield' as const,
  demo: true,
  // Pas de surface : la carte ne la porte plus. Le rendement est en t/ha et la
  // production en t — l'hectare est déjà dans les deux chiffres, le répéter en
  // ligne d'identité ne dit rien de neuf.
  meta: [
    { icon: 'wheat', label: 'Arachide' },
    { icon: 'map-pin', label: 'Kaolack' },
  ],
  metrics: [
    { label: 'Rendement', value: '2,6', unit: 't/ha', badge: { running: 'Prévu', done: 'Estimé' } },
    { label: 'Production', value: '2 000', unit: 't' },
  ],
  stageLabel: 'Stades phénologiques',
  stage: [
    { label: 'Floraison', share: 62 },
    { label: 'Montaison', share: 21 },
    { label: 'Levée', share: 12 },
    { label: 'Maturité', share: 5 },
  ],
  freshness: 'Créé le 12 mars 2026',
}

const SCAN = {
  title: 'Cartographie Casamance',
  module: 'Scan' as const,
  demo: true,
  meta: [
    { icon: 'wheat', label: '4 cultures' },
    { icon: 'map-pin', label: 'Casamance' },
  ],
  metrics: [
    { label: 'Cartographié', value: '847', unit: 'ha' },
    { label: 'Couvert végétal', value: '92', unit: '%' },
  ],
  crops: [
    { label: 'Arachide', share: 46 },
    { label: 'Mil', share: 27 },
    { label: 'Maïs', share: 18 },
    { label: 'Jachère', share: 9 },
  ],
  freshness: 'Créé le 12 mars 2026',
}

const frame = (inner: string) =>
  `<div style="width: 280px; display: flex;">${inner}</div>`

/** Yield : le bloc du bas est une progression — 2 stades sur 4, de gauche à droite. */
export const Yield: Story = {
  name: 'Yield — stades phénologiques',
  render: () => ({
    components: { ProjectCard },
    setup: () => ({ args: YIELD }),
    template: frame('<ProjectCard v-bind="args" style="width: 100%;" />'),
  }),
}

/**
 * Scan : la même géométrie dirait « avancement », donc elle change de nature.
 * Les largeurs *sont* la donnée, et la légende ne passe jamais à la ligne — au
 * delà de ce qui tient, le reste devient `+N`.
 */
export const Scan: Story = {
  name: 'Scan — répartition',
  render: () => ({
    components: { ProjectCard },
    setup: () => ({ args: SCAN }),
    template: frame('<ProjectCard v-bind="args" style="width: 100%;" />'),
  }),
}

/** Sept cultures pour trois places : la queue se replie sur `+4`. */
export const CropOverflow: Story = {
  name: 'Scan — sept cultures',
  render: () => ({
    components: { ProjectCard },
    setup: () => ({
      args: {
        ...SCAN,
        crops: [
          { label: 'Arachide', share: 46 },
          { label: 'Mil', share: 27 },
          { label: 'Maïs', share: 18 },
          { label: 'Sorgho', share: 4 },
          { label: 'Niébé', share: 3 },
          { label: 'Riz', share: 1 },
          { label: 'Jachère', share: 1 },
        ],
      },
    }),
    template: frame('<ProjectCard v-bind="args" style="width: 100%;" />'),
  }),
}

/**
 * Les quatre états. `loading` n'est pas un état de projet — il est sur le même
 * axe parce que c'est ce que le consommateur doit rendre.
 *
 * Le chargement ne porte **ni pastille ni menu** : il n'y a encore rien à
 * commander, et un glyphe y ferait lire un état final. Une barre tient la place
 * de la pastille, pour que la carte ne grandisse pas à l'arrivée.
 */
export const States: Story = {
  name: 'Les quatre états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectCard },
    setup: () => ({ args: YIELD }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, 280px); gap: var(--ds-spacing-xl);">
        <ProjectCard v-bind="args" state="planned"
          :metrics="[{ label: 'Rendement', value: '—' }, { label: 'Production', value: '—' }]"
          stageLabel="Démarre le 15 juin 2026" :stage="[]" />
        <ProjectCard v-bind="args" state="running" />
        <ProjectCard v-bind="args" state="done"
          :stage="[{ label: 'Maturité', share: 96 }, { label: 'Floraison', share: 4 }]" />
        <ProjectCard v-bind="args" state="loading" />
      </div>
    `,
  }),
}

/**
 * Les deux modules côte à côte : même coque, aperçus différents — et, depuis
 * `module`, un repère qui dit lequel est lequel sans attendre qu'on lise la
 * barre du bas.
 */
export const Modules: Story = {
  name: 'Les deux modules',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectCard },
    setup: () => ({ y: YIELD, s: SCAN }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 280px); gap: var(--ds-spacing-xl);">
        <ProjectCard v-bind="y" />
        <ProjectCard v-bind="s" />
      </div>
    `,
  }),
}

/**
 * **Le module se voit, il ne s'écrit pas.** Le repère est l'illustration du
 * module (ADR-0005) — pas le logo : la carte est déjà la surface, une tuile
 * dans une tuile se battrait avec son rayon.
 *
 * **Il y avait une taille gratuite et on ne l'a pas prise.** 24px est exactement
 * une boîte de ligne de `label-xl-strong` (16/24 dans les deux échelles typo) et
 * ne coûte aucune hauteur — mais à cette taille les onze dessins sont des taches
 * colorées, distinguables sans être identifiables. Donc **32px**, et la ligne
 * déclare son plancher (`--project-card-mark`, lu comme boîte du dessin *et*
 * comme `min-height`) : les trois cartes ci-dessous font la même hauteur, avec
 * repère comme sans.
 *
 * La troisième carte n'en porte pas. `ModuleName` ne nomme que les 11 modules
 * dont le système a le dessin (`Eudr`, `ina` et `conformite` n'en ont pas —
 * ADR-0005, ADR-0031), donc un projet d'un de ceux-là laisse la prop vide :
 * **un repère faux est pire que pas de repère.**
 */
export const ModuleMark: Story = {
  name: 'Le repère de module',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectCard },
    setup: () => ({ y: YIELD, s: SCAN }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 280px); gap: var(--ds-spacing-xl);">
        <ProjectCard v-bind="y" />
        <ProjectCard v-bind="s" />
        <ProjectCard v-bind="y" :module="undefined" title="Rendement Arachide Nord" />
      </div>
    `,
  }),
}
