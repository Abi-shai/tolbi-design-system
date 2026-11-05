import type { Meta, StoryObj } from '@storybook/vue3'
import { computed, ref } from 'vue'
import PeriodPicker from './PeriodPicker.vue'
import { Button } from '../Button'
import { MapPanel } from '../Map'

const meta: Meta<typeof PeriodPicker> = {
  title: 'Navigation/PeriodPicker',
  component: PeriodPicker,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La **frise des périodes** (ADR-0100, piste A) : les années **côte à côte**, chacune à une pression — ' +
          'un curseur fait viser, une liste cache la suite des années.\n\n' +
          'Trois parties, seule celle du milieu est toujours là : **la granularité** au début (année, mois, ' +
          'jour — `granularities` + `v-model:granularity`, le produit répond par d’autres `periods`) ; **les ' +
          'périodes**, un `ButtonGroup` `sm` entre ‹ et ›, qui passent à la précédente et à la suivante ; ' +
          '**`#actions`** au bout — « Comparer ».\n\n' +
          '`shown` périodes à la fois ; la fenêtre suit le choix et ne bouge que quand il atteint son bord. ' +
          'Un seul arrêt de tabulation : ←/→, Début, Fin déplacent le choix.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof PeriodPicker>

const years = Array.from({ length: 10 }, (_, i) => String(2017 + i)).map((y) => ({ value: y, label: y }))

export const Default: Story = {
  name: 'Les années',
  render: () => ({
    components: { PeriodPicker, MapPanel },
    setup: () => ({ year: ref('2026'), years }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel><PeriodPicker v-model="year" :periods="years" label="Année" /></MapPanel>
      </div>
    `,
  }),
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

/** Les deux bouts : la granularité au début, « Comparer » à la fin. */
export const Granularity: Story = {
  name: 'Granularité et action',
  render: () => ({
    components: { PeriodPicker, MapPanel, Button },
    setup() {
      const granularity = ref('year')
      const granularities = [
        { value: 'year', label: 'Année' },
        { value: 'month', label: 'Mois' },
        { value: 'day', label: 'Jour' },
      ]
      const periods = computed(() => {
        if (granularity.value === 'year') return years
        if (granularity.value === 'month') return MONTHS.map((m, i) => ({ value: `2026-${i + 1}`, label: m }))
        return Array.from({ length: 31 }, (_, i) => ({ value: `2026-10-${i + 1}`, label: String(i + 1) }))
      })
      const value = ref('2026')
      const unit = computed(() => granularities.find((g) => g.value === granularity.value)!.label)
      return {
        granularity, granularities, periods, value, unit,
        regrain: (g: string) => {
          granularity.value = g
          value.value = periods.value[periods.value.length - 1].value
        },
      }
    },
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel>
          <PeriodPicker
            v-model="value"
            :granularity="granularity"
            :granularities="granularities"
            :periods="periods"
            :label="unit"
            @update:granularity="regrain"
          >
            <template #actions>
              <Button variant="secondary-gray" size="sm" icon-leading="calendar-range" label="Comparer" />
            </template>
          </PeriodPicker>
        </MapPanel>
      </div>
    `,
  }),
}

export const WithAction: Story = {
  name: 'Avec une action seule',
  render: () => ({
    components: { PeriodPicker, MapPanel, Button },
    setup: () => ({ year: ref('2024'), years }),
    template: `
      <div style="background:var(--ds-bg-neutral);padding:24px;border-radius:12px">
        <MapPanel>
          <PeriodPicker v-model="year" :periods="years" label="Année">
            <template #actions>
              <Button variant="secondary-gray" size="sm" icon-leading="calendar-range" label="Comparer" />
            </template>
          </PeriodPicker>
        </MapPanel>
      </div>
    `,
  }),
}
