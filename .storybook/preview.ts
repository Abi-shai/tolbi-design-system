import type { Preview } from '@storybook/vue3'
import theme from './theme'
import '../tokens/fonts.css'
import '../tokens/dist/colors.css'
import '../tokens/dist/typography.css'
import '../tokens/dist/shadows.css'
import '../tokens/dist/focus-rings.css'
import '../tokens/dist/blurs.css'
import '../tokens/dist/space.css'
import '../tokens/dist/spacing.css'
import '../tokens/dist/semantic.css'
import '../tokens/dist/semantic-dark.css'
import '../tokens/dist/radius.css'

const preview: Preview = {
  parameters: {
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
