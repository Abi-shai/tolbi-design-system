import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect, userEvent, fn } from '@storybook/test'
import ModulesList from './ModulesList.vue'

// Modules du design Figma (node 518:15253) — ordre et labels exacts
const FIGMA_MODULES = [
  { name: 'Carbone' as const, label: 'Carbone'  },
  { name: 'Survey'  as const, label: 'Survey'   },
  { name: 'Scan'    as const, label: 'Scan'      },
  { name: 'ID'      as const, label: 'ID'        },
  { name: 'Redd+'   as const, label: 'Redd +'   },
  { name: 'Call'    as const, label: 'Call'      },
  { name: 'Forest'  as const, label: 'Forest'   },
  { name: 'Yield'   as const, label: 'Yield'    },
  { name: 'Trace'   as const, label: 'Trace'    },
]

const meta: Meta<typeof ModulesList> = {
  title: 'Navigation/ModulesList',
  component: ModulesList,
  tags: ['stable'],
  parameters: {
    layout: 'centered',
  },
  args: {
    modules: FIGMA_MODULES,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActiveModule: Story = {
  name: 'Module actif (Carbone)',
  args: {
    modules: FIGMA_MODULES.map(m => ({ ...m, active: m.name === 'Carbone' })),
  },
}

export const WithDisabledModules: Story = {
  name: 'Modules désactivés',
  args: {
    modules: FIGMA_MODULES.map(m => ({
      ...m,
      active:   m.name === 'Carbone',
      disabled: ['Redd+', 'Trace', 'Yield'].includes(m.name),
    })),
  },
}

/** Six modules ou moins : deux rangées, la boîte s’arrête là — rien à faire dépasser, rien à faire défiler (ADR-0163). */
export const SixOrFewer: Story = {
  name: 'Six modules ou moins',
  args: { modules: FIGMA_MODULES.slice(0, 6) },
}

/**
 * ADR-0164 — **sur une page** (l’accueil d’etolbi) : `layout="page"`, une grille fluide qui se replie, sans hauteur
 * fixe ni ombre ; chaque module un bloc bordé, le dessin à 32 et le nom. Avec `href`, chaque entrée est un vrai lien
 * — clic milieu, nouvel onglet — et émet toujours `select` avec le clic, qu’un routeur peut reprendre.
 */
export const OnAPage: Story = {
  name: 'Sur une page',
  parameters: { layout: 'padded' },
  args: {
    layout: 'page',
    modules: FIGMA_MODULES.map(m => ({ ...m, href: `#${m.name.toLowerCase()}`, active: m.name === 'Yield' })),
    onSelect: fn(),
  },
  render: args => ({
    components: { ModulesList },
    setup: () => ({ args }),
    template: `<div style="max-width: 1100px"><ModulesList v-bind="args" /></div>`,
  }),
  /* Guarded: the entries are links, the current one says it is the page; a modified click is the browser's
     (no `select`, ADR-0165), a plain one emits it. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const links = canvas.getAllByRole('link')
    await expect(links).toHaveLength(FIGMA_MODULES.length)
    await expect(canvas.getByRole('link', { name: 'Yield' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: 'Carbone' })).toHaveAttribute('href', '#carbone')
    const carbone = canvas.getByRole('link', { name: 'Carbone' })
    for (const mod of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, [mod]: true })
      carbone.addEventListener('click', e => e.preventDefault(), { once: true })
      carbone.dispatchEvent(click)
    }
    await expect(args.onSelect).not.toHaveBeenCalled()
    carbone.addEventListener('click', e => e.preventDefault(), { once: true })
    await userEvent.click(carbone)
    await expect(args.onSelect).toHaveBeenCalledTimes(1)
  },
}
