import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import Table from './Table.vue'
import type { TableColumn, TableRow } from './Table.vue'
import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Button } from '../Button'

const meta: Meta<typeof Table> = {
  title: 'Données/Table',
  component: Table,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tableau de données avec sélection par case à cocher, cellules personnalisables via slots, et pagination intégrée.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Table>

const COLUMNS: TableColumn[] = [
  { key: 'name',    label: 'Nom',             minWidth: 220 },
  { key: 'status',  label: 'Statut',           width: 120 },
  { key: 'role',    label: 'Rôle',            width: 176, help: 'Niveau d\'accès au tableau de bord et aux outils d\'analyse.' },
  { key: 'email',   label: 'Adresse e-mail',  width: 220 },
  { key: 'tags',    label: 'Entreprise',      width: 280 },
  { key: 'actions', label: '',                width: 80, align: 'right' },
]

const TAG_COLORS = ['brand', 'blue', 'purple', 'orange', 'success', 'pink', 'indigo'] as const

const ROWS: TableRow[] = [
  { id: 1,  name: 'Kofi Acheampong',   handle: '@kofi.a',    status: 'Actif',     role: 'Administrateur', email: 'kofi.acheampong@tolbi.co',  tags: ['Côte d\'Ivoire', 'Maïs'] },
  { id: 2,  name: 'Amélie Traoré',     handle: '@amelie.t',  status: 'Actif',     role: 'Analyste',       email: 'amelie.traore@tolbi.co',    tags: ['Sénégal', 'Riz', 'Coton'] },
  { id: 3,  name: 'Moussa Diallo',     handle: '@moussa.d',  status: 'Inactif',   role: 'Éditeur',        email: 'moussa.diallo@tolbi.co',    tags: ['Mali', 'Sorgho'] },
  { id: 4,  name: 'Fatoumata Balde',   handle: '@fatou.b',   status: 'Actif',     role: 'Analyste',       email: 'fatoumata.balde@tolbi.co',  tags: ['Guinée'] },
  { id: 5,  name: 'Koffi Mensah',      handle: '@koffi.m',   status: 'En attente',role: 'Éditeur',        email: 'koffi.mensah@tolbi.co',     tags: ['Togo', 'Manioc', 'Igname'] },
  { id: 6,  name: 'Nadia Coulibaly',   handle: '@nadia.c',   status: 'Actif',     role: 'Administrateur', email: 'nadia.coulibaly@tolbi.co',  tags: ['Burkina Faso', 'Coton'] },
  { id: 7,  name: 'Ibrahim Sawadogo',  handle: '@ibrahim.s', status: 'Actif',     role: 'Analyste',       email: 'ibrahim.sawadogo@tolbi.co', tags: ['Burkina Faso'] },
  { id: 8,  name: 'Aya Koné',          handle: '@aya.k',     status: 'Inactif',   role: 'Éditeur',        email: 'aya.kone@tolbi.co',         tags: ['Côte d\'Ivoire', 'Cacao'] },
  { id: 9,  name: 'Seydou Ouédraogo',  handle: '@seydou.o',  status: 'Actif',     role: 'Analyste',       email: 'seydou.ouedraogo@tolbi.co', tags: ['Burkina Faso', 'Sésame'] },
  { id: 10, name: 'Mariam Diabaté',    handle: '@mariam.d',  status: 'Actif',     role: 'Éditeur',        email: 'mariam.diabate@tolbi.co',   tags: ['Mali', 'Riz'] },
]

function statusColor(status: string) {
  if (status === 'Actif') return 'success'
  if (status === 'Inactif') return 'gray'
  return 'warning'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export const Default: Story = {
  name: 'Membres de l\'équipe',
  render: () => ({
    components: { Table, Avatar, Badge, Button },
    setup() {
      const selected = ref<(string | number)[]>([])
      return { selected, COLUMNS, ROWS, TAG_COLORS, statusColor, initials }
    },
    template: `
      <Table
        :columns="COLUMNS"
        :rows="ROWS"
        v-model="selected"
        :selectable="true"
      >
        <template #cell-name="{ row }">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <Avatar size="sm" :initials="initials(row.name)" />
            <div style="min-width:0">
              <div style="font-family:var(--ds-typography-font-family-poppins);font-size:0.875rem;font-weight:500;color:var(--ds-text-strong);line-height:1.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ row.name }}</div>
              <div style="font-family:var(--ds-typography-font-family-poppins);font-size:0.75rem;color:var(--ds-text-subtle);line-height:1.125rem">{{ row.handle }}</div>
            </div>
          </div>
        </template>

        <template #cell-status="{ row }">
          <Badge :label="row.status" :color="statusColor(row.status)" dot />
        </template>

        <template #cell-tags="{ row }">
          <div style="display:flex;flex-wrap:nowrap;align-items:center;gap:4px;overflow:hidden">
            <Badge
              v-for="(tag, i) in row.tags.slice(0, 3)"
              :key="tag"
              :label="tag"
              :color="TAG_COLORS[i % TAG_COLORS.length]"
              size="sm"
            />
            <Badge
              v-if="row.tags.length > 3"
              :label="'+' + (row.tags.length - 3)"
              tone="neutral"
              size="sm"
            />
          </div>
        </template>

        <template #cell-actions="{ row }">
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
            <Button variant="ghost" size="sm" :icon-only="true" icon-leading="trash-2" :label="'Supprimer ' + row.name" />
            <Button variant="ghost" size="sm" :icon-only="true" icon-leading="square-pen" :label="'Modifier ' + row.name" />
          </div>
        </template>
      </Table>
    `,
  }),
}

export const WithPagination: Story = {
  name: 'Avec pagination',
  render: () => ({
    components: { Table, Avatar, Badge, Button },
    setup() {
      const PAGE_SIZE = 5
      const currentPage = ref(1)
      const selected = ref<(string | number)[]>([])
      const totalPages = Math.ceil(ROWS.length / PAGE_SIZE)

      const pagedRows = () =>
        ROWS.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)

      return { selected, COLUMNS, pagedRows, currentPage, totalPages, TAG_COLORS, statusColor, initials }
    },
    template: `
      <Table
        :columns="COLUMNS"
        :rows="pagedRows()"
        v-model="selected"
        :selectable="true"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="p => currentPage = p"
      >
        <template #cell-name="{ row }">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <Avatar size="sm" :initials="initials(row.name)" />
            <div style="min-width:0">
              <div style="font-family:var(--ds-typography-font-family-poppins);font-size:0.875rem;font-weight:500;color:var(--ds-text-strong);line-height:1.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ row.name }}</div>
              <div style="font-family:var(--ds-typography-font-family-poppins);font-size:0.75rem;color:var(--ds-text-subtle);line-height:1.125rem">{{ row.handle }}</div>
            </div>
          </div>
        </template>
        <template #cell-status="{ row }">
          <Badge :label="row.status" :color="statusColor(row.status)" dot />
        </template>
        <template #cell-tags="{ row }">
          <div style="display:flex;flex-wrap:nowrap;align-items:center;gap:4px;overflow:hidden">
            <Badge v-for="(tag, i) in row.tags.slice(0, 3)" :key="tag" :label="tag" :color="TAG_COLORS[i % TAG_COLORS.length]" size="sm" />
            <Badge v-if="row.tags.length > 3" :label="'+' + (row.tags.length - 3)" tone="neutral" size="sm" />
          </div>
        </template>
        <template #cell-actions="{ row }">
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
            <Button variant="ghost" size="sm" :icon-only="true" icon-leading="trash-2" :label="'Supprimer ' + row.name" />
            <Button variant="ghost" size="sm" :icon-only="true" icon-leading="square-pen" :label="'Modifier ' + row.name" />
          </div>
        </template>
      </Table>
    `,
  }),
}

export const Loading: Story = {
  name: 'Chargement',
  render: () => ({
    components: { Table },
    setup() {
      return { columns: COLUMNS, rows: [] as TableRow[] }
    },
    template: `<Table :columns="columns" :rows="rows" :selectable="true" :loading="true" :loading-rows="6" />`,
  }),
}

export const Empty: Story = {
  name: 'État vide',
  render: () => ({
    components: { Table },
    setup() {
      return {
        columns: COLUMNS.slice(0, 4),
        rows: [] as TableRow[],
      }
    },
    template: `<Table :columns="columns" :rows="rows" empty-text="Aucun membre trouvé." />`,
  }),
}
