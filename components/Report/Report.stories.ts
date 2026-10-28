import type { Meta, StoryObj } from '@storybook/vue3'
import Report from './Report.vue'
import ReportSection from './ReportSection.vue'
import ReportSignature from './ReportSignature.vue'
import { DetailRow } from '../DetailRow'
import { Table } from '../Table'

const meta: Meta<typeof Report> = {
  title: 'Structure/Report',
  component: Report,
  tags: ['wip'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Un document qui s’imprime (ADR-0089, piste A) — la DDS d’abord, puis les rapports dMRV, Scan, Baseline. Sobre, comme ' +
          'le document officiel : une ligne d’en-tête (la marque, le statut), le titre et sa référence, des sections qui se ' +
          'numérotent seules (`ReportSection`), les `DetailRow`, `Table` et figures du produit, la déclaration et sa signature ' +
          '(`ReportSignature`, annexe II). Sur papier : A4, marges de 20 mm, en-tête courant dès la page 2 et pied « Page n sur ' +
          'N » (Chrome 131+), un titre jamais seul en bas de page, une ligne jamais coupée. À l’écran : la feuille sur le fond ' +
          'gris et « Imprimer » au-dessus, que le papier ne montre pas.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const PRODUCTS = {
  columns: [
    { key: 'code', label: 'Code SH' },
    { key: 'label', label: 'Description' },
    { key: 'qty', label: 'Quantité', align: 'right' },
    { key: 'area', label: 'Surface', align: 'right' },
  ],
  rows: [
    { id: 1, code: '1801', label: 'Cacao en fèves, brut', qty: '12 400 kg', area: '10,7 ha' },
    { id: 2, code: '1806 10', label: 'Poudre de cacao sucrée', qty: '2 100 kg', area: '—' },
    { id: 3, code: '0901 11', label: 'Café non torréfié', qty: '8 000 kg', area: '6,2 ha' },
  ],
}

/* A field seen from above, for the story only. */
const MAP = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60"><rect width="160" height="60" fill="#6d8a4f"/><path d="M0 40 L60 20 L160 35 L160 60 L0 60Z" fill="#8fa35c"/><path d="M40 12 L90 6 L110 28 L60 34Z" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 2"/></svg>')

export const Dds: Story = {
  name: 'La déclaration de diligence raisonnée',
  render: () => ({
    components: { Report, ReportSection, ReportSignature, DetailRow, Table },
    setup: () => ({ PRODUCTS, MAP }),
    template: `
      <Report
        title="Déclaration de diligence raisonnée"
        reference="DDR-SN-2026-0142"
        date="27 oct. 2026"
        status="Déposée"
        footer="Tolbi · généré le 27 oct. 2026 à 10:42"
      >
        <template #summary>
          <dl style="margin:0">
            <DetailRow label="Opérateur" value="Coopérative agricole de Kaolack" />
            <DetailRow label="Pays" value="Sénégal" />
            <DetailRow label="Identifiants" value="TVA SN 0042198 · EORI SN0042198A" mono />
            <DetailRow label="Activité" value="Exportation" />
          </dl>
        </template>
        <ReportSection title="Les produits">
          <Table :columns="PRODUCTS.columns" :rows="PRODUCTS.rows" />
        </ReportSection>
        <ReportSection title="Les parcelles">
          <figure style="margin:0; display:flex; flex-direction:column; gap:var(--ds-spacing-sm)">
            <img :src="MAP" alt="Trois parcelles tracées à Kaolack" style="width:100%; aspect-ratio:8/3; object-fit:cover; border-radius:var(--ds-radius-inner)" />
            <figcaption style="font:var(--ds-font-body-sm); color:var(--ds-text-subtle)">Figure 1 — 3 parcelles, 16,9 ha, à Kaolack. Géolocalisation complète en annexe (GeoJSON).</figcaption>
          </figure>
        </ReportSection>
        <ReportSection title="L’évaluation du risque">
          <dl style="margin:0">
            <DetailRow label="Déforestation après le 31/12/2020" value="Aucune détectée (Sentinel-2)" />
            <DetailRow label="Légalité" value="Titres fonciers vérifiés" />
            <DetailRow label="Risque" value="Négligeable" />
          </dl>
        </ReportSection>
        <ReportSection title="Déclaration">
          <ReportSignature on-behalf-of="Coopérative agricole de Kaolack" date="27 oct. 2026" name="Awa Diop, responsable conformité">
            En soumettant cette déclaration de diligence raisonnée, l’opérateur confirme que la diligence raisonnée a été exercée
            conformément au règlement (UE) 2023/1115 et qu’aucun risque, ou seulement un risque négligeable, n’a été constaté.
          </ReportSignature>
        </ReportSection>
      </Report>
    `,
  }),
}
