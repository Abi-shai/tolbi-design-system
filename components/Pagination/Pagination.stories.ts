import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Pagination from './Pagination.vue'

const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['stable'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Le pied d’une liste (ADR-0080) : à gauche le rang — « 1–10 sur 42 projets » quand `total` est donné ; à ' +
          'droite les lignes par page quand `pageSize` est lié, puis les pages numérotées entre deux flèches, avec des ' +
          'ellipses pour les longues séquences. Changer de taille revient à la page 1. Il n’envoie rien : il émet ' +
          '`page-change` et `update:pageSize`.',
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
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-surface);">
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
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-surface);">
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
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-surface);">
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
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-surface);">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="p => currentPage = p"
        />
      </div>
    `,
  }),
}

export const WithSummary: Story = {
  name: 'Résumé et lignes par page',
  render: () => ({
    components: { Pagination },
    setup() {
      const currentPage = ref(1)
      const pageSize = ref(10)
      return { currentPage, pageSize }
    },
    template: `
      <div style="background: var(--ds-bg-default); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-surface);">
        <Pagination
          :current-page="currentPage"
          :total="42"
          v-model:page-size="pageSize"
          item-label="projets"
          @page-change="p => currentPage = p"
        />
      </div>
    `,
  }),
}
