import type { Meta, StoryObj } from '@storybook/vue3'
import ModuleIcon from './ModuleIcon.vue'
import { ARTWORK_SIZES } from '../artwork-size'
import ModuleIconDocs from './ModuleIcon.mdx'
import { moduleNames } from './registry'

const meta: Meta<typeof ModuleIcon> = {
  title: 'Identité & média/ModuleIcon',
  component: ModuleIcon,
  tags: ['autodocs', 'stable', 'primitive'],
  parameters: {
    layout: 'centered',
    docs: { page: ModuleIconDocs },
  },
  argTypes: {
    module: {
      control: 'select',
      options: moduleNames,
      description: 'Le module à représenter.',
      table: {
        category: 'Contenu',
        type: { summary: 'ModuleName' },
        defaultValue: { summary: "'Carbone'" },
      },
    },
    variant: {
      control: 'inline-radio',
      options: ['logo', 'illustration'],
      description:
        '`logo` — l\'artwork sur sa tuile arrondie, la valeur sémantique. ' +
        '`illustration` — le dessin original sans tuile, la valeur primitive.',
      table: {
        category: 'Apparence',
        type: { summary: "'logo' | 'illustration'" },
        defaultValue: { summary: "'logo'" },
      },
    },
    size: {
      control: 'inline-radio',
      options: ARTWORK_SIZES,
      description:
        'Côté de la boîte rendue, sur l\'échelle d\'artwork partagée avec ' +
        '`Logo`. Le dessin est un `viewBox="0 0 48 48"`, donc 48 est sa ' +
        'grille native. Hors échelle reste permis (nombre ou longueur CSS) — ' +
        'voir la prop.',
      table: {
        category: 'Apparence',
        type: { summary: 'ArtworkSize | number | string' },
        defaultValue: { summary: '48' },
      },
    },
    ariaLabel: {
      control: 'text',
      description:
        'Nom accessible. Par défaut le nom du module ; passer `null` quand ' +
        'l\'artwork est décoratif à côté d\'un libellé visible.',
      table: { category: 'Accessibilité', type: { summary: 'string | null' } },
    },
  },
  args: {
    module: 'Carbone',
    variant: 'logo',
    size: 48,
  },
}

export default meta
type Story = StoryObj<typeof meta>

const GRID = (variant: 'logo' | 'illustration') => ({
  components: { ModuleIcon },
  setup: () => ({ modules: moduleNames, variant }),
  template: `
    <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start; padding:1.5rem; font-family:var(--ds-typography-font-family-poppins);">
      <div
        v-for="mod in modules"
        :key="mod"
        style="display:flex; flex-direction:column; align-items:center; gap:10px; width:88px;"
      >
        <ModuleIcon :module="mod" :variant="variant" :size="48" />
        <span style="font-size:0.7rem; color:var(--ds-text-subtle); text-align:center;">{{ mod }}</span>
      </div>
    </div>
  `,
})

export const Default: Story = {}

export const Logos: Story = {
  name: 'Logos — sémantique',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Les 11 modules sur leur tuile. C\'est cette variante que les surfaces produit ' +
          'consomment — commutateur de modules, navigation, cartes.',
      },
    },
  },
  render: () => GRID('logo'),
}

export const Illustrations: Story = {
  name: 'Illustrations — primitive',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Le même artwork sans tuile. La primitive dont le logo est composé : à réserver ' +
          'aux cas où le module est déjà cadré par sa propre surface.',
      },
    },
  },
  render: () => GRID('illustration'),
}

export const Pairing: Story = {
  name: 'Primitive → sémantique',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Les deux variantes côte à côte. Le logo est strictement l\'illustration posée ' +
          'sur la tuile — même artwork, même position, rien de redessiné.',
      },
    },
  },
  render: () => ({
    components: { ModuleIcon },
    setup: () => ({ modules: moduleNames }),
    template: `
      <div style="padding:1.5rem; font-family:var(--ds-typography-font-family-poppins);">
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:1.25rem;">
          <div
            v-for="mod in modules"
            :key="mod"
            style="display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:0.875rem; border:1px solid var(--ds-border-subtle); border-radius:var(--ds-radius-surface);"
          >
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <ModuleIcon :module="mod" variant="illustration" :size="48" />
              <span style="color:var(--ds-text-subtlest);">→</span>
              <ModuleIcon :module="mod" variant="logo" :size="48" />
            </div>
            <span style="font-size:0.7rem; color:var(--ds-text-subtle);">{{ mod }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  name: 'Tailles',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          '`size` ne dépend pas de la variante. La tuile du logo remplit la boîte bord à bord ' +
          'et l\'artwork occupe les mêmes coordonnées dans les deux jeux : à `size` égal, le ' +
          'dessin fait exactement la même taille en primitive et en sémantique.',
      },
    },
  },
  render: () => ({
    components: { ModuleIcon },
    setup: () => ({
      sizes: ARTWORK_SIZES,
      rows: [
        { variant: 'illustration' as const, label: 'illustration — primitive' },
        { variant: 'logo' as const, label: 'logo — sémantique' },
      ],
    }),
    template: `
      <div style="display:flex; flex-direction:column; gap:2rem; padding:1.5rem; font-family:var(--ds-typography-font-family-poppins);">
        <div v-for="row in rows" :key="row.variant" style="display:flex; flex-direction:column; gap:0.75rem;">
          <span style="font-size:0.7rem; color:var(--ds-text-subtle);">{{ row.label }}</span>
          <div style="display:flex; gap:2rem; align-items:flex-end;">
            <div v-for="s in sizes" :key="s" style="display:flex; flex-direction:column; align-items:center; gap:0.75rem;">
              <ModuleIcon module="Carbone" :variant="row.variant" :size="s" />
              <span style="font-family:monospace; font-size:0.7rem; color:var(--ds-text-subtle);">{{ s }}px</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
