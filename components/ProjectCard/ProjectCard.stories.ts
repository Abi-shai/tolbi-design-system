import type { Meta, StoryObj } from '@storybook/vue3'
import ProjectCard from './ProjectCard.vue'
import Docs from './ProjectCard.mdx'
import { moduleNames } from '../ModuleIcon'
import { Sparkline } from '../Sparkline'
import { ProjectGlyph } from '../ProjectGlyph'

const meta: Meta<typeof ProjectCard> = {
  title: 'Données/ProjectCard',
  component: ProjectCard,
  tags: ['stable'],
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

/* The head of an insight — a name on the left, its reading on the right. */
const INSIGHT_HEAD = 'display:flex;justify-content:space-between;gap:var(--ds-spacing-md);white-space:nowrap;font:var(--ds-font-label-md);color:var(--ds-text-default)'

/*
  dMRV — a monitoring project: the carbon it gained, the surface it follows,
  and **the carbon against the baseline**, year after year — `Sparkline`'s
  `comparison` is that sentence (ADR-0100): the project's line, the baseline
  dashed, on one scale.
*/
const DMRV = {
  card: {
    title: 'FPH — Agroforesterie cacao',
    meta: [{ icon: 'map-pin', label: 'Soubré' }],
    metrics: [
      { label: 'Gain carbone', value: '3 120', unit: 'tCO2e' },
      { label: 'Surface suivie', value: '236', unit: 'ha' },
    ],
    freshness: 'Créé le 4 mars 2021',
  },
  // tCO2e/ha, 2020 → 2026
  project:  [9.1, 9.6, 10.2, 10.9, 11.5, 12.1, 12.7],
  baseline: [9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7],
  label: '12,7 tCO2e/ha en 2026 contre 9,7 pour la baseline, depuis 9,1 en 2020',
  /* Real data from the product (etolbi /dmrv): a name the line cuts, figures
     seven characters long. */
  long: {
    title: 'Suivi des émissions — coopérative agricole de Soubré',
    /* The region alone: the identity line of a project says where it is. */
    meta: [{ icon: 'map-pin', label: "Soubré, Côte d'Ivoire" }],
    metrics: [
      { label: 'Gain carbone', value: '166 610', unit: 'tCO2e' },
      { label: 'Surface suivie', value: '29 645,2', unit: 'ha' },
    ],
    freshness: 'Créé le 2 février 2024',
  },
}

const frame = (inner: string) =>
  `<div style="width: 280px; display: flex;">${inner}</div>`

/** Yield : le bloc du bas est une progression — 2 stades sur 4, de gauche à droite. */
export const Yield: Story = {
  name: 'Yield · stades phénologiques',
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
  name: 'Scan · répartition',
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
  name: 'Tous les modules',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectCard, Sparkline, ProjectGlyph },
    setup: () => ({ y: YIELD, s: SCAN, d: DMRV, INSIGHT_HEAD, up: [0.31, 0.32, 0.34, 0.33, 0.36, 0.38, 0.39, 0.41, 0.42, 0.44], ref: [0.31, 0.31, 0.32, 0.32, 0.32, 0.33, 0.33, 0.33, 0.34, 0.34] }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, 280px); gap: var(--ds-spacing-xl); align-items: stretch;">
        <ProjectCard v-bind="y" />
        <ProjectCard v-bind="s" />
        <ProjectCard state="done" status="À jour" title="Soubré — cacao agroforestier"
          :meta="[{ icon: 'map-pin', label: 'Soubré · référence 2026' }]"
          :metrics="[{ label: 'Part créditable', value: '86', unit: '%' }, { label: 'Crédits estimés', value: '65 762', unit: 'tCO2e' }]"
          freshness="Créée le 12 mars 2026">
          <template #zone><ProjectGlyph kind="baseline" status="up-to-date" seed="soubre-ref" /></template>
          <template #insight>
            <div :style="INSIGHT_HEAD"><span>Indice de stock</span><span style="color:var(--ds-text-on-success-subtle)">7× plus vite</span></div>
            <Sparkline :values="up" :comparison="ref" label="+12 % contre +4 % pour les points de contrôle" />
          </template>
        </ProjectCard>
        <ProjectCard v-bind="d.card" state="done" status="Suivi à jour">
          <template #zone><ProjectGlyph kind="zone" status="done" seed="fph-cacao" /></template>
          <template #insight>
            <div :style="INSIGHT_HEAD"><span>Comparé à la baseline</span><span style="color:var(--ds-text-on-success-subtle)">+3,0 tCO2e/ha</span></div>
            <Sparkline :values="d.project" :comparison="d.baseline" :label="d.label" />
          </template>
        </ProjectCard>
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

/**
 * La fiche de référence de l’ARR (ADR-0100) : l’aperçu est un **slot**
 * (`#insight`) — un chiffre et sa `Sparkline` — parce qu’un module y mesure
 * autre chose qu’une répartition.
 *
 * **En calcul** : la même carte, à la même hauteur. Ce qu’on sait reste ; ce
 * qui se calcule s'écrit « — », lu « en calcul », et la courbe attend en
 * pointillé (ADR-0105). Rien à ouvrir : ni lien, ni menu, ni soulèvement.
 */
export const Baseline: Story = {
  name: 'ARR · Dynamic baseline',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectCard, Sparkline, ProjectGlyph },
    setup: () => ({
      up: [0.31, 0.32, 0.34, 0.33, 0.36, 0.38, 0.39, 0.41, 0.42, 0.44],
      ref: [0.31, 0.31, 0.32, 0.32, 0.32, 0.33, 0.33, 0.33, 0.34, 0.34],
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 280px); gap: var(--ds-spacing-xl); align-items: stretch;">
        <ProjectCard state="done" status="À jour" title="Soubré — cacao agroforestier"
          :meta="[{ icon: 'map-pin', label: 'Soubré · référence 2026' }]"
          :metrics="[{ label: 'Part créditable', value: '86', unit: '%' }, { label: 'Crédits estimés', value: '65 762', unit: 'tCO2e' }]"
          freshness="Créée le 12 mars 2026">
          <template #zone><ProjectGlyph kind="baseline" status="up-to-date" seed="soubre-ref" /></template>
          <template #insight>
            <div style="display:flex;justify-content:space-between;font:var(--ds-font-label-md);color:var(--ds-text-default)">
              <span>Indice de stock</span><span style="color:var(--ds-text-on-success-subtle)">7× plus vite</span>
            </div>
            <Sparkline :values="up" :comparison="ref" label="+12 % contre +4 % pour les points de contrôle" />
          </template>
        </ProjectCard>
        <ProjectCard state="running" status="À mettre à jour" title="Gagnoa nord"
          :meta="[{ icon: 'map-pin', label: 'Gagnoa · référence 2026' }]"
          :metrics="[{ label: 'Part créditable', value: '78', unit: '%' }, { label: 'Crédits estimés', value: '41 230', unit: 'tCO2e' }]"
          freshness="Créée le 14 octobre 2026">
          <template #zone><ProjectGlyph kind="baseline" status="outdated" seed="gagnoa-nord" /></template>
          <template #insight>
            <div style="display:flex;justify-content:space-between;font:var(--ds-font-label-md);color:var(--ds-text-default)">
              <span>Indice de stock</span><span style="color:var(--ds-text-on-success-subtle)">5× plus vite</span>
            </div>
            <Sparkline :values="up.map(v => v * 0.97)" :comparison="ref" label="+9 % contre +4 % pour les points de contrôle" />
          </template>
        </ProjectCard>
        <ProjectCard state="computing" title="Bas-Sassandra — riz pluvial"
          :meta="[{ icon: 'map-pin', label: 'Sassandra' }]"
          :metrics="[{ label: 'Surface comparée', value: '2 880', unit: 'ha' }, { label: 'Carbone', value: null }]"
          freshness="Créée le 26 octobre 2026">
          <template #zone><ProjectGlyph kind="baseline" status="computing" seed="bas-sassandra" /></template>
          <template #insight>
            <div style="display:flex;justify-content:space-between;font:var(--ds-font-label-md);color:var(--ds-text-default)">
              <span>Indice de stock</span><span style="color:var(--ds-text-subtlest)">—</span>
            </div>
            <Sparkline :values="[]" label="En calcul" />
          </template>
        </ProjectCard>
      </div>
    `,
  }),
}

/**
 * dMRV — un projet de suivi. La même coque ; l'aperçu dit **le carbone face à la
 * baseline**, année après année : la ligne du projet, la baseline en pointillé,
 * sur une même échelle (`Sparkline` avec `comparison`, ADR-0100).
 *
 * Les états sont ceux du suivi : à jour ; **en calcul** — le motif existant,
 * `state="computing"` et les chiffres à `null`, rien à ouvrir ; et le suivi de
 * l'année **à lancer**, qui garde le dernier suivi lisible.
 */
export const Dmrv: Story = {
  name: 'dMRV · suivi',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectCard, Sparkline, ProjectGlyph },
    setup: () => ({ d: DMRV, INSIGHT_HEAD }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(4, 280px); gap: var(--ds-spacing-xl); align-items: stretch;">
        <ProjectCard v-bind="d.card" state="done" status="Suivi à jour">
          <template #zone><ProjectGlyph kind="zone" status="done" seed="fph-cacao" /></template>
          <template #insight>
            <div :style="INSIGHT_HEAD"><span>Comparé à la baseline</span><span style="color:var(--ds-text-on-success-subtle)">+3,0 tCO2e/ha</span></div>
            <Sparkline :values="d.project" :comparison="d.baseline" :label="d.label" />
          </template>
        </ProjectCard>
        <ProjectCard v-bind="d.card" state="computing"
          :metrics="[{ label: 'Gain carbone', value: null }, { label: 'Surface suivie', value: '236', unit: 'ha' }]">
          <template #zone><ProjectGlyph kind="zone" status="running" seed="fph-cacao" /></template>
          <template #insight>
            <div :style="INSIGHT_HEAD"><span>Comparé à la baseline</span><span style="color:var(--ds-text-subtlest)">—</span></div>
            <Sparkline :values="[]" label="En calcul" />
          </template>
        </ProjectCard>
        <ProjectCard v-bind="d.card" state="running" status="Suivi 2027 à lancer">
          <template #zone><ProjectGlyph kind="zone" status="done" seed="fph-cacao" /></template>
          <template #insight>
            <div :style="INSIGHT_HEAD"><span>Comparé à la baseline</span><span style="color:var(--ds-text-on-success-subtle)">+3,0 tCO2e/ha</span></div>
            <Sparkline :values="d.project" :comparison="d.baseline" :label="d.label" />
          </template>
        </ProjectCard>
        <ProjectCard v-bind="d.long" state="done" href="#">
          <template #zone><ProjectGlyph kind="zone" status="done" seed="soubre-coop" /></template>
          <template #insight>
            <div :style="INSIGHT_HEAD"><span>Comparé à la baseline</span><span style="color:var(--ds-text-on-success-subtle)">+5,6 tCO2e/ha</span></div>
            <Sparkline :values="d.project" :comparison="d.baseline" :label="d.label" />
          </template>
        </ProjectCard>
      </div>
    `,
  }),
}

/* One module per entry first — each module's look, in the order of the product —
   then what every card shares. */
export const __namedExportsOrder = ['Yield', 'Scan', 'Baseline', 'Dmrv', 'Modules', 'States', 'ModuleMark', 'CropOverflow']
