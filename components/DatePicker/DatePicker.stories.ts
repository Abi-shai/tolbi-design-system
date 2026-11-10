import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import DatePicker from './DatePicker.vue'
import type { DatePickerRange, DatePickerValue } from './DatePicker.vue'
import { FormField } from '../FormField'

const meta: Meta<typeof DatePicker> = {
  title: 'Saisie/DatePicker',
  component: DatePicker,
  /* wip: first release — the product's three pickers (two v-calendar, one hand-made year grid) are not yet replaced. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un composant, quatre modes (ADR-0152, Figma `4116:3094`) : `granularity` = `day` | `year`, et `range`. ' +
          '**Le champ se tape** par segments — AAAA ; JJ/MM/AAAA dans l’ordre de la langue — ↑ ↓ font ± 1 sur le ' +
          'segment actif, ← → passent d’un segment à l’autre. **Le panneau s’ouvre sous le champ** : une grille de ' +
          '16 années (4 × 4) calée sur `min`, ou le mois, dont l’en-tête mène à la même grille. **Une plage** se ' +
          'choisit en deux clics, l’intervalle teinté, le survol en aperçu. **Hors bornes, refusé** : la valeur ' +
          'n’est pas prise et `invalid` dit pourquoi (« Entre 2011 et 2031 »), pour le `FormField` autour. ' +
          'Clavier du panneau : ← → ± 1, ↑ ↓ ± une rangée, Page préc./suiv. ± une page, Entrée choisit, Échap ferme.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const shown = (v: unknown) => (v === null || v === undefined ? '—' : JSON.stringify(v))

/** Année de plantation — l’année seule, bornée 2011–2031 ; le panneau s’ouvre sur la page de la valeur. */
export const Year: Story = {
  name: 'Année',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => {
      const value = ref<DatePickerValue | null>(2026)
      const error = ref<string | null>(null)
      return { value, error, shown }
    },
    template: `
      <div style="width:300px;display:flex;flex-direction:column;gap:12px">
        <FormField label="Année de plantation" :error="error ?? undefined">
          <DatePicker v-model="value" granularity="year" :min="2011" :max="2031" @invalid="error = $event" />
        </FormField>
        <span data-testid="value" style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Valeur : {{ shown(value) }}</span>
      </div>
    `,
  }),
  /* Guarded: the grid picks and closes; a typed year past max is refused and said. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir le calendrier' }))
    const grid = await body.findByRole('grid', { name: '2011 – 2026' })
    await userEvent.click(within(grid).getByRole('gridcell', { name: '2020' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('2020'))
    await waitFor(() => expect(body.queryByRole('grid')).toBeNull())
    const year = canvas.getByRole('spinbutton', { name: 'année' })
    await userEvent.click(year)
    await userEvent.keyboard('1998')
    await waitFor(() => expect(canvas.getByText('Entre 2011 et 2031')).toBeVisible())
    await expect(canvas.getByTestId('value')).toHaveTextContent('2020')
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}2024')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('2024'))
    /* The message closes over `exit` (ADR-0025), so it is waited for. */
    await waitFor(() => expect(canvas.queryByText('Entre 2011 et 2031')).toBeNull())
  },
}

/** Date de démarrage — le jour, JJ/MM/AAAA ; l’en-tête « Mars 2026 ⌄ » ouvre la grille d’années, puis revient au mois. */
export const Day: Story = {
  name: 'Jour',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => ({ value: ref<DatePickerValue | null>('2026-03-12'), shown }),
    template: `
      <div style="width:300px;display:flex;flex-direction:column;gap:12px">
        <FormField label="Date de démarrage">
          <DatePicker v-model="value" granularity="day" />
        </FormField>
        <span data-testid="value" style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Valeur : {{ shown(value) }}</span>
      </div>
    `,
  }),
  /* Guarded: ↑ on the day segment steps it; a day picked in the grid becomes the value. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('spinbutton', { name: 'jour' }))
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('2026-03-13'))
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir le calendrier' }))
    const grid = await body.findByRole('grid', { name: 'Mars 2026' })
    await userEvent.click(within(grid).getByRole('gridcell', { name: /20 mars 2026/ }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('2026-03-20'))
  },
}

/** Période d’analyse — une plage d’années : deux clics dans la même grille, l’intervalle teinté. */
export const YearRange: Story = {
  name: 'Plage d’années',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => ({ value: ref<DatePickerRange | null>(null), shown }),
    template: `
      <div style="width:300px;display:flex;flex-direction:column;gap:12px">
        <FormField label="Période d’analyse">
          <DatePicker v-model="value" granularity="year" range :min="2016" :max="2028" />
        </FormField>
        <span data-testid="value" style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Valeur : {{ shown(value) }}</span>
      </div>
    `,
  }),
  /* Guarded: two picks make the range and close; the order does not matter. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir le calendrier' }))
    const grid = await body.findByRole('grid', { name: '2016 – 2031' })
    await userEvent.click(within(grid).getByRole('gridcell', { name: '2026' }))
    await userEvent.click(within(grid).getByRole('gridcell', { name: '2018' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('{"start":2018,"end":2026}'))
    await waitFor(() => expect(body.queryByRole('grid')).toBeNull())
  },
}

/**
 * ADR-0153 — **plusieurs années**, non contiguës (la création d’un projet Yield) : `multiple`, `v-model` en
 * `number[]`. Les cellules se choisissent une à une et le choix se **valide** ; fermer sans valider garde la valeur.
 * Le champ les liste, il ne se tape pas.
 */
export const ManyYears: Story = {
  name: 'Plusieurs années',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => ({ value: ref<number[]>([]), shown }),
    template: `
      <div style="width:300px;display:flex;flex-direction:column;gap:12px">
        <FormField label="Années de la campagne">
          <DatePicker v-model="value" granularity="year" multiple :min="2016" :max="2026" />
        </FormField>
        <span data-testid="value" style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Valeur : {{ shown(value) }}</span>
      </div>
    `,
  }),
  /* Guarded: three years toggled, one untoggled, confirmed; then a change closed by Escape is not kept. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir le calendrier' }))
    const grid = await body.findByRole('grid', { name: '2016 – 2031' })
    for (const y of ['2021', '2023', '2024', '2026', '2024']) await userEvent.click(within(grid).getByRole('gridcell', { name: y }))
    await expect(body.getByRole('status')).toHaveTextContent('3 années')
    await expect(canvas.getByTestId('value')).toHaveTextContent('[]')
    await userEvent.click(body.getByRole('button', { name: 'Valider' }))
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('[2021,2023,2026]'))
    await waitFor(() => expect(body.queryByRole('grid')).toBeNull())
    await expect(canvas.getByText('2021, 2023, 2026')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir le calendrier' }))
    const again = await body.findByRole('grid', { name: '2016 – 2031' })
    await userEvent.click(within(again).getByRole('gridcell', { name: '2018' }))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(body.queryByRole('grid')).toBeNull())
    await expect(canvas.getByTestId('value')).toHaveTextContent('[2021,2023,2026]')
  },
}

/** Une plage de jours — la même règle sur le mois : début, fin, l’intervalle teinté. */
export const DayRange: Story = {
  name: 'Plage de jours',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => ({ value: ref<DatePickerRange | null>({ start: '2026-03-09', end: '2026-03-20' }), shown }),
    template: `
      <div style="width:340px;display:flex;flex-direction:column;gap:12px">
        <FormField label="Période de collecte">
          <DatePicker v-model="value" range />
        </FormField>
        <span data-testid="value" style="font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Valeur : {{ shown(value) }}</span>
      </div>
    `,
  }),
}

/** Hors bornes — tapée, une année hors min / max est refusée ; le `FormField` dit pourquoi. */
export const OutOfBounds: Story = {
  name: 'Hors bornes',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => ({ value: ref<DatePickerValue | null>(null), error: ref<string | null>(null) }),
    template: `
      <div style="width:300px">
        <FormField label="Année de plantation" :error="error ?? undefined">
          <DatePicker v-model="value" granularity="year" :min="2011" :max="2031" @invalid="error = $event" />
        </FormField>
      </div>
    `,
  }),
  /* 1998 typed: refused, said. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('spinbutton', { name: 'année' }))
    await userEvent.keyboard('1998')
    await waitFor(() => expect(canvas.getByText('Entre 2011 et 2031')).toBeVisible())
  },
}

/** Les deux tailles et l’état désactivé. */
export const Sizes: Story = {
  name: 'Tailles',
  render: () => ({
    components: { DatePicker, FormField },
    setup: () => ({ a: ref('2026-03-12'), b: ref(2026) }),
    template: `
      <div style="width:300px;display:flex;flex-direction:column;gap:16px">
        <FormField label="md"><DatePicker v-model="a" /></FormField>
        <FormField label="sm"><DatePicker v-model="a" size="sm" /></FormField>
        <FormField label="Désactivé"><DatePicker v-model="b" granularity="year" disabled /></FormField>
      </div>
    `,
  }),
}
