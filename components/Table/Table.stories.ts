import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import Table from './Table.vue'
import TableColumnMenu from './TableColumnMenu.vue'
import type { TableColumn, TableRow, TableSort } from './Table.vue'
import { IconButton } from '../IconButton'
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
          'Tableau de données avec sélection par case à cocher, cellules personnalisables via slots, et pagination ' +
          'intégrée. ADR-0080 (planche validée le 27 oct.) : le **tri** se montre sur la colonne triée seulement, les ' +
          'autres en donnent l’aperçu au survol et au focus ; une **ligne s’ouvre par son nom** (`rowLink` ou ' +
          '`@row-click`) — un vrai lien, et un clic ailleurs sur la ligne lui est confié ; les **colonnes figées** ' +
          '(`fixed`) restent en place et un filet marque leur bord tant que du contenu passe dessous ; ' +
          '`visibleColumns` se règle avec `TableColumnMenu` ; le pied dit le rang, la taille de page et les pages. ' +
          'Le tableau ne trie ni ne pagine lui-même : il émet, le produit charge.',
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

/**
 * ADR-0026: skeleton → content is the most-watched transition in a data product,
 * because it fires on every page load. Toggle it and watch the shimmer hand over
 * rather than snap.
 */
export const LoadingHandover: Story = {
  name: 'Loading handover',
  render: () => ({
    setup: () => ({ loading: ref(true), columns: COLUMNS, rows: ROWS }),
    components: { Table },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-xl); align-items: flex-start;">
        <button
          id="toggle-loading"
          type="button"
          @click="loading = !loading"
          style="font: var(--ds-font-label-lg); padding: var(--ds-control-padding-sm);
                 border: var(--ds-border-width-default) solid var(--ds-border-default);
                 border-radius: var(--ds-radius-control); background: var(--ds-bg-default); cursor: pointer;"
        >{{ loading ? 'Charger' : 'Recharger' }}</button>
        <Table :columns="columns" :rows="rows" :loading="loading" />
      </div>
    `,
  }),
}

/* ── The product's list (ADR-0080) ────────────────────────────────── */

const PROJECT_COLUMNS: TableColumn[] = [
  { key: 'name',     label: 'Nom du projet', width: 260, sortable: true, fixed: 'start', hideable: false },
  { key: 'norm',     label: 'Norme',         width: 120, sortable: true },
  { key: 'area',     label: 'Surface (ha)',  width: 150, sortable: true, align: 'right' },
  { key: 'polygons', label: 'Polygones',     width: 140, sortable: true, align: 'right' },
  { key: 'created',  label: 'Créé le',       width: 150, sortable: true },
  { key: 'status',   label: 'Statut',        width: 130, sortable: true },
  { key: 'region',   label: 'Région',        width: 160, sortable: true },
  { key: 'actions',  label: '',              width: 104, fixed: 'end', hideable: false, align: 'right' },
]

const NAMES = ['Coops Bayan Cocoa', 'Deforestation Assessment', 'Analyse RDUE Périmètre 62590', 'Test analogue', 'Soubré — lot de 128 parcelles', 'Gripazo coopérative', 'Daloa — campagne 2025', 'Méagui Nord', 'Divo — producteurs certifiés', 'Guiglo Ouest']
const REGIONS = ['Nawa', 'Haut-Sassandra', 'Lôh-Djiboua', 'Cavally', 'Gôh']
const PROJECTS: TableRow[] = Array.from({ length: 42 }, (_, i) => {
  const day = new Date(2025, 0, 5 + i * 7)
  return {
    id: i + 1,
    name: `${NAMES[i % NAMES.length]}${i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ''}`,
    norm: 'EUDR',
    area: Math.round(((i * 7919) % 250000) + 50) / 100,
    polygons: (i * 37) % 250 + 1,
    created: day,
    status: i % 9 === 3 ? 'En cours' : 'Terminé',
    region: REGIONS[i % REGIONS.length],
  }
})

const NUMBER = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * La liste des projets EUDR, telle que la planche l’a tranchée : « Colonnes » à droite de la barre, tri, ligne qui
 * s’ouvre par son nom, nom et actions figés, pied complet. Le tri et la pagination sont faits ici, dans la story —
 * dans le produit, le serveur les fait.
 */
export const ProjectList: Story = {
  name: 'Liste des projets',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Table, TableColumnMenu, Badge, IconButton },
    setup() {
      const sort = ref<TableSort | null>({ key: 'created', direction: 'descending' })
      const page = ref(1)
      const size = ref(10)
      const visible = ref(PROJECT_COLUMNS.filter(c => c.key !== 'region').map(c => c.key))
      const opened = ref('—')
      const sorted = computed(() => {
        const s = sort.value
        if (!s) return PROJECTS
        const k = s.key
        return [...PROJECTS].sort((a, b) => {
          const x = a[k] as never, y = b[k] as never
          const d = x < y ? -1 : x > y ? 1 : 0
          return s.direction === 'ascending' ? d : -d
        })
      })
      const rows = computed(() => sorted.value.slice((page.value - 1) * size.value, page.value * size.value))
      return {
        columns: PROJECT_COLUMNS, sort, page, size, visible, rows, opened, total: PROJECTS.length,
        link: (row: TableRow) => `#projet-${row.id}`,
        number: (n: number) => NUMBER.format(n), date: (d: Date) => DATE.format(d),
      }
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--ds-spacing-xl);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:var(--ds-spacing-lg);">
          <span style="font:var(--ds-font-body-md); color:var(--ds-text-subtle);">Ouvert : {{ opened }}</span>
          <TableColumnMenu :columns="columns" v-model="visible" :default-value="columns.filter(c => c.key !== 'region').map(c => c.key)" />
        </div>
        <Table
          :columns="columns"
          :rows="rows"
          :visible-columns="visible"
          v-model:sort="sort"
          :row-link="link"
          :current-page="page"
          :total="total"
          v-model:page-size="size"
          item-label="projets"
          @page-change="p => page = p"
          @click.capture="e => { const a = e.target.closest && e.target.closest('a'); if (a) { e.preventDefault(); opened = a.textContent.trim() } }"
        >
          <template #cell-area="{ value }">{{ number(value) }}</template>
          <template #cell-created="{ value }">{{ date(value) }}</template>
          <template #cell-status="{ value }">
            <Badge :label="value" :tone="value === 'Terminé' ? 'success' : 'warning'" size="sm" />
          </template>
          <template #cell-actions="{ row }">
            <div style="display:flex; justify-content:flex-end;">
              <IconButton icon="pencil" size="xs" variant="subtle" :ariaLabel="'Modifier ' + row.name" @click="opened = 'modifier ' + row.name" />
              <IconButton icon="trash-2" size="xs" variant="subtle" :ariaLabel="'Supprimer ' + row.name" @click="opened = 'supprimer ' + row.name" />
            </div>
          </template>
        </Table>
      </div>
    `,
  }),
}

/** Dans une colonne étroite : le nom et les actions restent, le reste défile dessous ; le filet ne paraît que du côté où du contenu passe. */
export const FixedColumns: Story = {
  name: 'Colonnes figées',
  render: () => ({
    components: { Table, Badge, IconButton },
    setup: () => ({ columns: PROJECT_COLUMNS, rows: PROJECTS.slice(0, 5), number: (n: number) => NUMBER.format(n), date: (d: Date) => DATE.format(d) }),
    template: `
      <div style="max-width:760px;">
        <Table :columns="columns" :rows="rows" :sort="{ key: 'created', direction: 'descending' }">
          <template #cell-area="{ value }">{{ number(value) }}</template>
          <template #cell-created="{ value }">{{ date(value) }}</template>
          <template #cell-status="{ value }">
            <Badge :label="value" :tone="value === 'Terminé' ? 'success' : 'warning'" size="sm" />
          </template>
          <template #cell-actions="{ row }">
            <div style="display:flex; justify-content:flex-end;">
              <IconButton icon="pencil" size="xs" variant="subtle" :ariaLabel="'Modifier ' + row.name" />
              <IconButton icon="trash-2" size="xs" variant="subtle" :ariaLabel="'Supprimer ' + row.name" />
            </div>
          </template>
        </Table>
      </div>
    `,
  }),
}
