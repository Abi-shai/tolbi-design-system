import type { Meta, StoryObj } from '@storybook/vue3'
import FileGlyph from './FileGlyph.vue'

const FORMATS = [
  { format: 'pdf', label: 'PDF' },
  { format: 'doc', label: 'Word' },
  { format: 'csv', label: 'Tableur' },
  { format: 'json', label: 'JSON' },
  { format: 'geo', label: 'Contours' },
  { format: 'points', label: 'Points' },
  { format: 'kml', label: 'KML' },
  { format: 'file', label: 'Autre' },
] as const

const meta: Meta<typeof FileGlyph> = {
  title: 'Identité & média/FileGlyph',
  component: FileGlyph,
  /* wip: first release — the « Rapporter » view is its one consumer, not moved yet. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Le format d’un fichier en glyphe, devant son nom (ADR-0235). Pas de dessin maison : les boîtes de Material ' +
          'Design Icons (mdi, Apache 2.0), dans les couleurs connues des formats — PDF rouge, Word bleu, tableur vert, ' +
          'JSON orange. Les fichiers géospatiaux prennent la même boîte, le format écrit dedans (GEO, PTS en vert de ' +
          'marque, KML en bleu ciel). Les couleurs sont catégorielles : elles ne suivent pas le thème. Un document ' +
          'd’un organisme connu prend son logo à la place (`FileTile #glyph`).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Les huit formats aux quatre tailles du pictogramme, sur le clair puis le sombre. */
export const Formats: Story = {
  name: 'Formats',
  render: () => ({
    components: { FileGlyph },
    setup: () => ({ FORMATS, SIZES: [16, 20, 24, 32] }),
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-lg)">
        <div v-for="theme in ['light', 'dark']" :key="theme" :data-theme="theme === 'dark' ? 'dark' : undefined"
          style="display:flex;flex-wrap:wrap;gap:var(--ds-spacing-xl);padding:var(--ds-spacing-xl);border-radius:var(--ds-radius-surface);background:var(--ds-bg-default);color:var(--ds-text-subtle);font:var(--ds-font-label-md)">
          <div v-for="f in FORMATS" :key="f.format" style="display:flex;flex-direction:column;align-items:center;gap:var(--ds-spacing-sm)">
            <div style="display:flex;align-items:flex-end;gap:var(--ds-spacing-sm)">
              <FileGlyph v-for="s in SIZES" :key="s" :format="f.format" :size="s" />
            </div>
            {{ f.label }}
          </div>
        </div>
      </div>`,
  }),
}
