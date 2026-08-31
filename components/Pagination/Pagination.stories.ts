import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Pagination from './Pagination.vue'

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Barre de pagination avec navigation Précédent/Suivant et numéros de pages. Gère automatiquement les ellipses pour les longues séquences.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  name: 'Interactive',
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(1)
      return { currentPage, totalPages: 10 }
    },
    template: `
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-xl);">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="p => currentPage = p"
        />
      </div>
    `,
  }),
}

export const MiddlePage: Story = {
  name: 'Page du milieu',
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(5)
      return { currentPage, totalPages: 10 }
    },
    template: `
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-xl);">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="p => currentPage = p"
        />
      </div>
    `,
  }),
}

export const FewPages: Story = {
  name: 'Peu de pages',
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(1)
      return { currentPage, totalPages: 4 }
    },
    template: `
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-xl);">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="p => currentPage = p"
        />
      </div>
    `,
  }),
}

export const LastPage: Story = {
  name: 'Dernière page',
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(10)
      return { currentPage, totalPages: 10 }
    },
    template: `
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-xl);">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="p => currentPage = p"
        />
      </div>
    `,
  }),
}
