import type { Preview } from '@storybook/vue3'
import theme from './theme'
import '../tokens/fonts.css'
import '../tokens/dist/index.css'

const preview: Preview = {
  parameters: {
    options: {
      // Must be inline — Storybook statically analyses this to build the index,
      // so it cannot resolve a variable reference.
      //
      // Two tiers, then nine functional categories. The categories are
      // alphabetical on purpose: any "importance" ordering is a judgment that
      // gets argued, and predictability is the point. Atlassian orders its own
      // categories the same way.
      //
      // There is deliberately no atomic-level tier for components. "How
      // composed is it?" is a maintainer's question; "where is the thing that
      // does X?" is the question someone browsing actually has. The primitive
      // rule survives as the `primitive` tag, not as an address (ADR-0007).
      storySort: {
        order: [
          'Introduction',
          'Foundations', [
            'Color', ['Primitives', 'Semantic', 'Display palette', 'Chart series'],
            'Typography',
            'Spacing', ['Primitives', 'Semantic', 'Control padding'],
            'Radius', ['Primitives', 'Roles'],
            'Widths',
            'Containers',
            'Effects', ['Shadows', 'Elevation', 'Focus Rings'],
            'Motion',
          ],
          'Actions',
          'Données',
          'Étiquettes',
          'Feedback & chargement',
          'Identité & média',
          'Navigation',
          'Saisie',
          'Structure',
          'Superposition',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme,
    },
    backgrounds: {
      default: 'White',
      values: [
        { name: 'White',     value: '#FFFFFF' },
        { name: 'Secondary', value: '#F9FAFB' },
        { name: 'Dark',      value: '#1F242F' },
        { name: 'Brand',     value: '#033A1F' },
      ],
    },
  },
}

export default preview
