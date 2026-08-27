import type { Meta, StoryObj } from '@storybook/vue3'
import { fn, userEvent, within, expect } from '@storybook/test'
import Icon from './Icon.vue'
import { icons, type IconName } from './registry'

const allNames = Object.keys(icons) as IconName[]

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icônes [Lucide](https://lucide.dev) (ISC), inlinées en SVG. La couleur suit `currentColor` — ' +
          'elle se contrôle en CSS via `color`. Le jeu correspond exactement à la frame Figma `Icons/Lucide` ' +
          'et se régénère avec `npm run icons`.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: allNames,
      description: 'Nom Lucide en kebab-case.',
      table: {
        category: 'Contenu',
        type: { summary: 'IconName' },
      },
    },
    size: {
      control: 'inline-radio',
      options: [16, 20, 24, 32],
      description:
        'Une des quatre tailles de l\'échelle. Le stroke n\'est pas compensé : il suit la boîte, ' +
        'soit un stroke effectif de `2 × taille / 24`.',
      table: {
        category: 'Apparence',
        type: { summary: 'IconSize' },
        defaultValue: { summary: '24' },
      },
    },
    ariaLabel: {
      control: 'text',
      description: 'Label accessible. Si omis, l\'icône est masquée aux lecteurs d\'écran (`aria-hidden`).',
      table: {
        category: 'Accessibilité',
        type: { summary: 'string' },
      },
    },
  },
  args: {
    name: 'check',
    size: 24,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { name: 'check' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const svg = canvasElement.querySelector('svg')
    await expect(svg).toBeTruthy()
    await expect(svg).toHaveAttribute('aria-hidden')
  },
}

export const Sizes: Story = {
  name: 'Échelle et stroke effectif',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Quatre tailles sanctionnées. Les icônes sont dessinées sur une grille de 24px en ' +
          '`stroke-width: 2` ; le stroke suit la boîte, donc le stroke effectif vaut ' +
          '`2 × taille / 24`. Il n\'est **pas** compensé aux petites tailles — plus fin à 16, ' +
          'plus lourd à 32. 16px est le plancher pour une icône autonome.',
      },
    },
  },
  render: () => ({
    components: { Icon },
    setup: () => ({
      steps: ([16, 20, 24, 32] as const).map(size => ({
        size,
        stroke: ((2 * size) / 24).toFixed(2).replace('.', ','),
      })),
    }),
    template: `
      <div style="display: flex; align-items: flex-end; gap: 2.5rem; flex-wrap: wrap; padding: 1.5rem; font-family: var(--ds-typography-font-family-poppins);">
        <div v-for="s in steps" :key="s.size" style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
          <Icon name="land-plot" :size="s.size" style="color: var(--ds-semantic-text-primary);" />
          <span style="font-family: monospace; font-size: 0.7rem; color: var(--ds-semantic-text-tertiary); white-space: nowrap;">
            {{ s.size }} px · {{ s.stroke }}
          </span>
        </div>
      </div>
    `,
  }),
}

export const Ornaments: Story = {
  name: 'Ornements de contrôle',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Les glyphes *à l\'intérieur* d\'un contrôle — coche de `Checkbox`, fermeture de `Tag` — ' +
          'suivent la taille du contrôle et non l\'échelle. Ce sont des ornements, exemptés du ' +
          'plancher de 16px. Ne jamais utiliser une taille hors échelle pour une icône autonome.',
      },
    },
  },
  render: () => ({
    components: { Icon },
    setup: () => ({
      steps: ([10, 12, 14] as const).map(size => ({
        size,
        stroke: ((2 * size) / 24).toFixed(2).replace('.', ','),
      })),
    }),
    template: `
      <div style="display: flex; align-items: flex-end; gap: 2.5rem; flex-wrap: wrap; padding: 1.5rem; font-family: var(--ds-typography-font-family-poppins);">
        <div v-for="s in steps" :key="s.size" style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
          <Icon name="check" :size="s.size" style="color: var(--ds-semantic-text-primary);" />
          <span style="font-family: monospace; font-size: 0.7rem; color: var(--ds-semantic-text-tertiary); white-space: nowrap;">
            {{ s.size }} px · {{ s.stroke }}
          </span>
        </div>
      </div>
    `,
  }),
}

export const Colors: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Icon },
    template: `
      <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1rem;">
        <Icon name="leaf" :size="32" style="color: var(--ds-color-brand-500);" />
        <Icon name="leaf" :size="32" style="color: var(--ds-color-error-500);" />
        <Icon name="leaf" :size="32" style="color: var(--ds-color-warning-500);" />
        <Icon name="leaf" :size="32" style="color: var(--ds-color-gray-light-400);" />
        <Icon name="leaf" :size="32" style="color: var(--ds-semantic-text-primary);" />
      </div>
    `,
  }),
}

export const Gallery: Story = {
  name: 'Jeu complet',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Le jeu complet, tel que publié dans la frame Figma `Icons/Lucide`.',
      },
    },
  },
  render: () => ({
    components: { Icon },
    setup: () => ({ allNames }),
    template: `
      <div style="padding: 1.5rem;">
        <p style="font-family: var(--ds-typography-font-family-poppins); font-size: 0.8rem; color: var(--ds-semantic-text-tertiary); margin: 0 0 1.25rem;">
          {{ allNames.length }} icônes Lucide.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem;">
          <div
            v-for="name in allNames"
            :key="name"
            style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--ds-semantic-border-secondary, #eaecf0);"
          >
            <Icon :name="name" :size="24" style="color: var(--ds-semantic-text-primary, #101828);" />
            <span style="font-family: var(--ds-typography-font-family-poppins); font-size: 0.6rem; color: var(--ds-semantic-text-tertiary, #475467); text-align: center; word-break: break-all;">{{ name }}</span>
          </div>
        </div>
      </div>
    `,
  }),
}
