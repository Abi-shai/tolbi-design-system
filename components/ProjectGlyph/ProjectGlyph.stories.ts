import type { Meta, StoryObj } from '@storybook/vue3'
import ProjectGlyph from './ProjectGlyph.vue'
import { ProjectCard } from '../ProjectCard'

const meta: Meta<typeof ProjectGlyph> = {
  title: 'Identité & média/ProjectGlyph',
  component: ProjectGlyph,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'L’illustration d’un projet — **une illustration d’une gamme, pas un aperçu du projet** (ADR-0107). ' +
          'La gamme « Glyphe » du propriétaire (Figma `3041:8757`) : un objet géographique — zone, parcelle, baseline — ' +
          'dessiné dans son état. Une liste **fait tourner** la gamme : chaque projet garde sa variante (`seed`, son id), ' +
          'ses voisins en portent d’autres. Chaque dessin donne huit variantes (quatre quarts de tour, en miroir ou non). ' +
          'Décorative ; elle se pose dans le `#zone` de `ProjectCard`, à 40px, sans fond (ADR-0106).',
      },
    },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['zone', 'parcel', 'baseline'] },
    status: { control: 'select', options: ['done', 'running', 'failed', 'monitored', 'alert', 'quality', 'forest', 'invalid', 'up-to-date', 'outdated', 'computing'] },
    seed: { control: 'text' },
    variant: { control: { type: 'number', min: 0, max: 7 } },
    size: { control: 'number' },
  },
  args: { kind: 'zone', status: 'done', size: 40 },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Une zone terminée' }

/** La gamme : trois objets, chacun dans ses états — à 40 et à 32. */
export const Range: Story = {
  name: 'La gamme',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectGlyph },
    setup: () => ({
      rows: [
        ['zone', ['done', 'running', 'failed'], 'Zone — terminée, en cours, échec'],
        ['parcel', ['monitored', 'alert', 'quality', 'forest', 'invalid'], 'Parcelle — suivie, en alerte, qualité ; forêt en 2016, contour invalide (ARR)'],
        ['baseline', ['up-to-date', 'outdated', 'computing'], 'Baseline — à jour, à mettre à jour, en calcul'],
      ],
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-3xl);">
        <div v-for="[kind, statuses, label] in rows" :key="kind" style="display:flex;flex-direction:column;gap:var(--ds-spacing-md);">
          <span style="font:var(--ds-font-label-md);color:var(--ds-text-subtle)">{{ label }}</span>
          <div style="display:flex;gap:var(--ds-spacing-3xl);align-items:end;">
            <div v-for="s in statuses" :key="s" style="display:flex;gap:var(--ds-spacing-md);align-items:end;">
              <ProjectGlyph :kind="kind" :status="s" :size="40" />
              <ProjectGlyph :kind="kind" :status="s" :size="32" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

/** Le cycle d’un dessin : quatre quarts de tour, puis les mêmes en miroir. */
export const Cycle: Story = {
  name: 'Le cycle — huit variantes',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectGlyph },
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-xl);">
        <div v-for="kind in ['zone','baseline']" :key="kind" style="display:flex;gap:var(--ds-spacing-xl);">
          <ProjectGlyph v-for="i in 8" :key="i" :kind="kind" :status="kind === 'zone' ? 'done' : 'up-to-date'" :variant="i - 1" />
        </div>
      </div>
    `,
  }),
}

/** Dans une liste de projets dMRV : chaque carte garde sa variante, ses voisines en portent d’autres. */
export const InAList: Story = {
  name: 'Dans une liste',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { ProjectGlyph, ProjectCard },
    setup: () => ({
      projects: [
        { id: 'fph-cacao', title: 'FPH — Agroforesterie cacao', place: 'Soubré' },
        { id: 'gagnoa-n', title: 'Gagnoa nord', place: 'Gagnoa' },
        { id: 'daloa-o', title: 'Daloa ouest', place: 'Daloa' },
        { id: 'sassandra', title: 'Bas-Sassandra', place: 'Sassandra' },
        { id: 'man-hevea', title: 'Man — hévéa', place: 'Man' },
        { id: 'divo-cafe', title: 'Divo — café', place: 'Divo' },
      ],
    }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(3, 320px);gap:var(--ds-spacing-xl);">
        <ProjectCard v-for="p in projects" :key="p.id" state="done" status="Suivi à jour" :title="p.title"
          :meta="[{ icon: 'map-pin', label: p.place }]"
          :metrics="[{ label: 'Gain carbone', value: '3 120', unit: 'tCO2e' }, { label: 'Surface suivie', value: '236', unit: 'ha' }]"
          freshness="Créé le 4 mars 2021">
          <template #zone><ProjectGlyph kind="zone" status="done" :seed="p.id" /></template>
        </ProjectCard>
      </div>
    `,
  }),
}
