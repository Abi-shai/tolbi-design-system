import type { Preview } from '@storybook/vue3'
import theme from './theme'
import '../tokens/fonts.css'
import '../tokens/dist/index.css'

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
