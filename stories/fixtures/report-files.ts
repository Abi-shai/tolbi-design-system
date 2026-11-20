/* A report's files, for the stories of FileTile, PageThumbs and Tray (ADR-0234). */
/* The pictures are the product's; these stand in for them — a document by the
   top of its first page, a table by its first rows, outlines by their path. */
export const PREVIEWS: Record<string, string> = {
  doc: `<div style="height:100%;padding:10% 12%;background:var(--ds-bg-default);display:flex;flex-direction:column;gap:6%">
      <div style="height:9%;width:55%;border-radius:2px;background:var(--ds-text-strong)"></div>
      <div style="height:5%;width:35%;border-radius:2px;background:var(--ds-border-default)"></div>
      <div style="height:22%;border-radius:3px;background:var(--ds-bg-brand-subtle)"></div>
      <div style="height:4%;border-radius:2px;background:var(--ds-border-subtle)"></div>
      <div style="height:4%;width:80%;border-radius:2px;background:var(--ds-border-subtle)"></div>
    </div>`,
  table: `<div style="height:100%;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:16%;background:var(--ds-bg-default)">
      ${Array.from({ length: 24 }, (_, i) => `<div style="border-bottom:1px solid var(--ds-border-subtle);${i < 4 ? 'background:var(--ds-bg-neutral-subtle)' : ''}"></div>`).join('')}
    </div>`,
  outline: `<svg viewBox="0 0 160 100" style="width:100%;height:100%;display:block;background:var(--ds-bg-default)">
      <path d="M30 70 L48 22 L92 18 L128 40 L118 78 L64 86 Z" fill="var(--ds-bg-brand-subtle)" stroke="var(--ds-border-brand-solid)" stroke-width="2" />
      <path d="M64 86 L72 50 L118 78" fill="none" stroke="var(--ds-border-brand-solid)" stroke-width="1.5" />
    </svg>`,
}

export const FILES = [
  { id: 'report', name: 'Rapport de suivi 2026', format: 'Document · PDF', icon: 'file-text', preview: 'doc', glyph: 'pdf' },
  { id: 'parcels', name: 'Parcelles du projet', format: 'Contours · GeoJSON', icon: 'map', preview: 'outline', glyph: 'geo' },
  { id: 'indicators', name: 'Indicateurs par parcelle', format: 'Tableau · CSV', icon: 'table', preview: 'table', glyph: 'csv' },
  { id: 'zones', name: 'Zones exclues', format: 'Contours · KML', icon: 'map', preview: 'outline', glyph: 'kml' },
  { id: 'metadata', name: 'Métadonnées du calcul', format: 'Données · JSON', icon: 'braces', preview: null, glyph: 'json' },
  { id: 'method', name: 'Annexe méthodologique et sources des données satellitaires', format: 'Document · HTML', icon: 'file-text', preview: 'doc', glyph: 'file' },
] as const

/** A page of a document, in miniature: the sheet drawn at the thumbnail's width. */
export const PAGE = (n: number) => `<div style="height:100%;padding:12% 12%;background:var(--ds-bg-default);display:flex;flex-direction:column;gap:5%">
  ${n === 1 ? '<div style="height:7%;width:60%;border-radius:1px;background:var(--ds-text-strong)"></div><div style="height:18%;border-radius:2px;background:var(--ds-bg-brand-subtle)"></div>' : '<div style="height:4%;width:40%;border-radius:1px;background:var(--ds-text-subtle)"></div>'}
  ${Array.from({ length: n === 1 ? 6 : 10 }, (_, i) => `<div style="height:2.5%;width:${i % 3 === 2 ? 70 : 100}%;border-radius:1px;background:var(--ds-border-subtle)"></div>`).join('')}
</div>`
