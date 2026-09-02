import type { Meta, StoryObj } from '@storybook/vue3'
import semantic from '../src/color/semantic.json'
import SemanticTokenRow from './components/SemanticTokenRow.vue'

function refToCssVar(ref: string): string {
  return '--ds-' + ref.replace(/[{}]/g, '').split('.').join('-')
}

interface Entry { value: string; description?: string }

function flattenTokens(obj: Record<string, any>, path: string[] = []): Map<string, Entry> {
  const result = new Map<string, Entry>()
  for (const [key, val] of Object.entries(obj)) {
    const currentPath = [...path, key]
    if (val && typeof val === 'object' && '$value' in val) {
      result.set(currentPath.join('.'), { value: val.$value as string, description: val.$description })
    } else if (val && typeof val === 'object') {
      for (const [k, v] of flattenTokens(val, currentPath)) result.set(k, v)
    }
  }
  return result
}

const tokens = flattenTokens(semantic)

function getCategory(category: string) {
  return [...tokens.entries()]
    .filter(([path]) => path.startsWith(`${category}.`))
    .map(([path, entry]) => ({
      cssVar: '--ds-' + path.split('.').join('-'),
      primitiveCssVar: refToCssVar(entry.value),
      description: entry.description,
    }))
}

const HEADER = `
  <thead>
    <tr style="border-bottom: 2px solid var(--ds-border-subtle);">
      <th style="padding: 0.5rem 1.5rem 0.75rem 0; text-align: left; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-text-subtle);">Token</th>
      <th style="padding: 0.5rem 0.75rem 0.75rem; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-text-subtle);">Value</th>
      <th style="padding: 0.5rem 0 0.75rem 1rem; text-align: left; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-text-subtle);">Primitive</th>
      <th style="padding: 0.5rem 0 0.75rem 1.25rem; text-align: left; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-text-subtle);">Why it exists</th>
    </tr>
  </thead>
`

function makeStory(category: string): StoryObj<typeof meta> {
  return {
    render: () => ({
      components: { SemanticTokenRow },
      setup: () => ({ tokens: getCategory(category) }),
      template: `
        <div style="padding: 1.5rem; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            ${HEADER}
            <tbody>
              <SemanticTokenRow
                v-for="token in tokens"
                :key="token.cssVar"
                :css-var="token.cssVar"
                :primitive-css-var="token.primitiveCssVar"
                :description="token.$description"
              />
            </tbody>
          </table>
        </div>
      `,
    }),
  }
}

const meta: Meta = {
  title: 'Foundations/Color/Semantic',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Background: Story = makeStory('bg')
export const Text:        Story = makeStory('text')
export const Border:      Story = makeStory('border')
