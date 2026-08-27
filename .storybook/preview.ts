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
      // The design system reads bottom-up: the decisions first (Foundations),
      // then the atoms carrying them (Primitives), then the parts that only
      // exist inside a parent (Subcomponents), then assembled Components.
      // Anything unlisted sorts alphabetically after its listed siblings.
      storySort: {
        order: [
          'Introduction',
          'Foundations', [
            'Color', ['Primitives', 'Semantic'],
            'Typography',
            'Spacing', ['Primitives', 'Semantic'],
            'Radius',
            'Widths',
            'Containers',
            'Effects', ['Shadows', 'Focus Rings', 'Backdrop Blurs'],
            'Motion',
          ],
          'Primitives',
          'Subcomponents',
          'Components',
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
