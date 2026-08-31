<script setup lang="ts">
/**
 * Reproduction of the product screen `/yield/332` — Yield, Tableau de bord.
 *
 * Built only from this design system: real components, real tokens, no
 * literal colour anywhere. Its purpose is not to be a page we ship — it is a
 * test rig for the system as a whole, and for what it does not yet cover.
 *
 * Every region the design system cannot supply is wrapped in `.gap`, which the
 * `showGaps` prop outlines and labels. Turn it off to judge how the assembly
 * feels; turn it on to see the boundary.
 */
import { ref } from 'vue'
import { HorizontalNavigation } from '../../components/HorizontalNavigation'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { Tabs } from '../../components/Tabs'
// InputDropdown lives in components/Dropdown/, not components/InputDropdown/ —
// it breaks the one-folder-per-component convention. Noted as a finding.
import { InputDropdown } from '../../components/Dropdown'
import { Scrollbar } from '../../components/Scrollbar'
import { ModuleIcon } from '../../components/ModuleIcon'

withDefaults(defineProps<{ showGaps?: boolean }>(), { showGaps: true })

/*
 * The register of what this design system cannot supply for this screen.
 * Regions carry a small numbered chip rather than an inline label: a label wide
 * enough to read is wide enough to cover the thing it points at.
 */
const GAPS = [
  { n: 1, label: 'Rail de modules', note: 'aucun composant' },
  { n: 2, label: 'Sélecteur de date', note: 'aucun Calendar dans le système' },
  { n: 3, label: 'Tuile de relevé', note: 'StatTile existe mais ne correspond pas' },
  { n: 4, label: 'Prévisions météo', note: 'aucun composant' },
  { n: 5, label: 'Carte et ses contrôles', note: 'hors périmètre du système' },
] as const

const producer = ref<string | null>(null)
const activeTab = ref('climat')

const producers = [
  { value: 'aminata', label: 'Aminata Bâ', supportingText: 'Kaolack · 12,6 ha' },
  { value: 'kofi', label: 'Kofi Diallo', supportingText: 'Fatick · 8,4 ha' },
  { value: 'mariam', label: 'Mariam Sow', supportingText: 'Kaolack · 21,0 ha' },
]

const tabs = [
  { value: 'production', label: 'Production' },
  { value: 'phenologie', label: 'Phénologie' },
  { value: 'climat', label: 'Climat' },
]

/* The recurring tile of this screen: icon + label + unit, then date + value. */
const readings = [
  { icon: 'cloud-rain', label: 'Pluie', unit: 'mm', date: '28 août 2026', value: '0,0', active: true },
  { icon: 'droplets', label: 'Humidité du sol', unit: '%', date: '28 août 2026', value: '7,8', active: false },
  { icon: 'thermometer', label: 'Température', unit: '°C', date: '28 août 2026', value: '29,0', active: false },
] as const

const forecast = [
  { day: "Aujourd'hui", temp: '29°', humidity: '7,8 %', rain: '0,0 mm', today: true },
  { day: 'sam.', temp: '29°', humidity: '5,0 %', rain: '2,9 mm', today: false },
  { day: 'dim.', temp: '29°', humidity: '4,3 %', rain: '1,9 mm', today: false },
  { day: 'lun.', temp: '29°', humidity: '3,4 %', rain: '1,3 mm', today: false },
  { day: 'mar.', temp: '30°', humidity: '3,2 %', rain: '0,3 mm', today: false },
  { day: 'mer.', temp: '29°', humidity: '3,1 %', rain: '0,0 mm', today: false },
  { day: 'jeu.', temp: '29°', humidity: '3,4 %', rain: '0,6 mm', today: false },
]
</script>

<template>
  <div class="screen" :class="{ 'screen--show-gaps': showGaps }">
    <ol v-if="showGaps" class="legend">
      <li v-for="g in GAPS" :key="g.n" class="legend__item">
        <span class="legend__n">{{ g.n }}</span>
        <span class="legend__label">{{ g.label }}</span>
        <span class="legend__note">{{ g.note }}</span>
      </li>
    </ol>

    <!-- ── Top bar — HorizontalNavigation, straight from the system ────── -->
    <HorizontalNavigation
      state="Project"
      :breadcrumbs="[{ label: 'Projets' }, { label: 'hefd', active: true }]"
      :credits="0"
      credit-state="empty"
      credit-context="project"
      user-initials="MD"
      has-notification
    />

    <div class="screen__body">
      <!-- ── Left rail ─────────────────────────────────────────────────── -->
      <div class="gap rail" data-n="1">
        <button class="rail__btn" type="button" aria-label="Replier le rail">
          <Icon name="chevrons-left" :size="20" />
        </button>
        <span class="rail__module"><ModuleIcon module="Yield" :size="32" :aria-label="null" /></span>
        <button class="rail__btn rail__btn--active" type="button" aria-label="Tableau de bord">
          <Icon name="house" :size="20" />
        </button>
        <button class="rail__btn" type="button" aria-label="Carte">
          <Icon name="map" :size="20" />
        </button>
        <button class="rail__btn" type="button" aria-label="Analyses">
          <Icon name="trending-up" :size="20" />
        </button>
      </div>

      <main class="page">
        <!-- ── Page header ─────────────────────────────────────────────── -->
        <header class="page__head">
          <div class="page__title-block">
            <h1 class="page__title">Tableau de bord</h1>
            <span class="page__period">
              Période d'analyse
              <span class="page__period-sep" aria-hidden="true"></span>
              <Icon name="calendar" :size="16" />
            </span>
          </div>

          <div class="page__actions">
            <Button label="Affecter des agents" variant="secondary-gray" icon-leading="user-plus" />
            <Button label="Partagez les résultats" variant="secondary-gray" icon-leading="arrow-up-right" />
            <Button label="Télécharger les résultats" variant="primary" icon-leading="download" />
          </div>
        </header>

        <!-- ── Filters ─────────────────────────────────────────────────── -->
        <div class="page__filters">
          <div class="page__filters-left">
            <InputDropdown
              v-model="producer"
              class="page__producer"
              placeholder="Rechercher un producteur"
              :options="producers"
            />
            <Button
              variant="secondary-gray"
              icon-leading="filter"
              :icon-only="true"
              label="Filtrer"
            />
          </div>

          <div class="page__filters-right">
            <div class="gap datepicker" data-n="2">
              <Icon name="calendar" :size="20" />
              <span class="datepicker__value">Ven. 28 août 2026</span>
              <Badge label="Prévu" tone="neutral" size="sm" />
              <Icon name="chevron-down" :size="20" />
            </div>
            <Button label="Comparez les dates" variant="secondary-gray" />
          </div>
        </div>

        <!-- ── Two columns ─────────────────────────────────────────────── -->
        <div class="page__cols">
          <!-- Left: analysis panel -->
          <Card class="panel" padding="none">
            <template #header>
              <h2 class="panel__title">Informations d'analyse</h2>
            </template>

            <div class="panel__body">
              <Tabs v-model="activeTab" :tabs="tabs" size="sm" />

              <Scrollbar max-height="19rem" shadows class="panel__readings">
                <div class="readings">
                  <!--
                    Near-miss: this tile recurs three times and neither StatTile
                    nor MetricValue fits it — the unit sits in the header and the
                    body is a date/value pair, not a label/value one.
                  -->
                  <div
                    v-for="r in readings"
                    :key="r.label"
                    class="gap reading"
                    :class="{ 'reading--active': r.active }"
                    data-n="3"
                  >
                    <div class="reading__head">
                      <Icon :name="r.icon" :size="20" />
                      <span class="reading__label">{{ r.label }}</span>
                      <span class="reading__unit">{{ r.unit }}</span>
                    </div>
                    <div class="reading__row">
                      <span class="reading__date">{{ r.date }}</span>
                      <span class="reading__value">{{ r.value }}</span>
                    </div>
                  </div>
                </div>
              </Scrollbar>

              <div class="gap forecast" data-n="4">
                <h3 class="forecast__title">Prévisions des prochains jours</h3>
                <div
                  v-for="f in forecast"
                  :key="f.day"
                  class="forecast__row"
                  :class="{ 'forecast__row--today': f.today }"
                >
                  <span class="forecast__day">{{ f.day }}</span>
                  <Icon name="cloud-rain" :size="20" class="forecast__icon" />
                  <span class="forecast__temp">{{ f.temp }}</span>
                  <span class="forecast__humidity">{{ f.humidity }}</span>
                  <span class="forecast__rain">{{ f.rain }}</span>
                </div>
              </div>
            </div>
          </Card>

          <!-- Right: map -->
          <div class="gap map" data-n="5">
            <div class="map__surface">
              <div class="map__tl">
                <button class="map__ctl" type="button" aria-label="Recentrer"><Icon name="house" :size="20" /></button>
                <button class="map__wide" type="button">
                  <Icon name="maximize-2" :size="16" /> Voir plus grand
                </button>
              </div>

              <div class="map__tr">
                <div class="map__zoom">
                  <button class="map__ctl" type="button" aria-label="Zoomer"><Icon name="plus" :size="20" /></button>
                  <button class="map__ctl" type="button" aria-label="Dézoomer"><Icon name="minus" :size="20" /></button>
                </div>
                <button class="map__ctl" type="button" aria-label="Calques"><Icon name="layers" :size="20" /></button>
                <button class="map__ctl map__ctl--brand" type="button" aria-label="Aide"><Icon name="circle-question-mark" :size="20" /></button>
              </div>

              <span class="map__pin"><span class="map__pin-dot" aria-hidden="true"></span> Champ 1</span>

              <div class="map__legend">
                <span class="map__legend-title">Pluie</span>
                <div class="map__legend-row"><span>0.0 mm</span><span>0.0 mm</span></div>
                <span class="map__legend-scale" aria-hidden="true"></span>
              </div>

              <button class="map__ai" type="button" aria-label="Assistant Tolbi">
                <Icon name="sparkles" :size="24" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/*
 * Not one literal colour, length or type value below comes from outside the
 * token layer — including inside the `.gap` regions, which are drawn with
 * tokens even though the components behind them do not exist yet.
 */
.screen {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: var(--ds-bg-neutral-subtle);
  font-family: var(--ds-typography-font-family-poppins);
}

.screen__body { display: flex; flex: 1 1 auto; min-height: 0; }

/* ── Gap marking ──────────────────────────────────────────────────── */
.screen--show-gaps .gap {
  position: relative;
  outline: 1px dashed var(--ds-border-brand-solid);
  outline-offset: -1px;
  border-radius: var(--ds-radius-md);
}

/*
 * An 18px chip that sits half outside the region's corner: big enough to read,
 * small enough that it never lands on content.
 */
.screen--show-gaps .gap::after {
  content: attr(data-n);
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  transform: translate(35%, -35%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
  font-family: var(--ds-typography-font-family-mono);
  font-size: var(--ds-font-size-label-xs);
  line-height: 1;
  font-weight: var(--ds-font-weight-label-xs);
  pointer-events: none;
}

/* ── Gap legend ───────────────────────────────────────────────────── */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-md) var(--ds-spacing-2xl);
  margin: 0;
  padding: var(--ds-spacing-lg) var(--ds-container-padding-desktop);
  list-style: none;
  background-color: var(--ds-bg-brand-subtle);
  border-bottom: 1px solid var(--ds-border-brand);
}

.legend__item { display: inline-flex; align-items: center; gap: var(--ds-spacing-md); }

.legend__n {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
  font-family: var(--ds-typography-font-family-mono);
  font-size: var(--ds-font-size-label-xs);
  line-height: 1;
}

.legend__label {
  font-size: var(--ds-font-size-label-md);
  line-height: var(--ds-line-height-label-md);
  font-weight: var(--ds-font-weight-label-md);
  color: var(--ds-text-strong);
}

.legend__note {
  font-size: var(--ds-font-size-body-sm);
  line-height: var(--ds-line-height-body-sm);
  color: var(--ds-text-subtle);
}

/* ── Left rail ────────────────────────────────────────────────────── */
.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg) var(--ds-spacing-md);
  background-color: var(--ds-bg-default);
  border-right: 1px solid var(--ds-border-subtle);
  flex-shrink: 0;
}

.rail__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: var(--ds-radius-md);
  background: none;
  cursor: pointer;
  color: var(--ds-text-subtlest);
}

.rail__btn:hover { background-color: var(--ds-bg-hover); }
.rail__btn:focus-visible { outline: none; box-shadow: var(--ds-focus-ring-brand); }
.rail__btn--active { background-color: var(--ds-bg-neutral-subtle); color: var(--ds-text-brand); }
.rail__module { display: flex; padding: var(--ds-spacing-xs) 0; }

/* ── Page ─────────────────────────────────────────────────────────── */
.page {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  padding: var(--ds-spacing-2xl) var(--ds-container-padding-desktop) var(--ds-spacing-2xl) var(--ds-spacing-2xl);
}

.page__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--ds-spacing-xl); flex-wrap: wrap; }
.page__title-block { display: flex; flex-direction: column; gap: var(--ds-spacing-md); }

.page__title {
  margin: 0;
  font-size: var(--ds-font-size-heading-2xl);
  line-height: var(--ds-line-height-heading-2xl);
  letter-spacing: var(--ds-letter-spacing-heading-2xl);
  font-weight: var(--ds-font-weight-heading-2xl);
  color: var(--ds-text-strong);
}

.page__period {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  align-self: flex-start;
  padding: var(--ds-spacing-xs) var(--ds-spacing-lg);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-bg-default);
  font-size: var(--ds-font-size-label-md);
  line-height: var(--ds-line-height-label-md);
  font-weight: var(--ds-font-weight-label-md);
  color: var(--ds-text-default);
}

.page__period-sep { width: 1px; align-self: stretch; background-color: var(--ds-border-subtle); }
.page__actions { display: flex; gap: var(--ds-spacing-md); flex-wrap: wrap; }

.page__filters { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-spacing-xl); flex-wrap: wrap; }
.page__filters-left,
.page__filters-right { display: flex; align-items: center; gap: var(--ds-spacing-md); }
.page__producer { width: 20rem; }

.datepicker {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  border: 1px solid var(--ds-border-default);
  border-radius: var(--ds-radius-md);
  background-color: var(--ds-bg-default);
  color: var(--ds-text-subtlest);
}

.datepicker__value {
  font-size: var(--ds-font-size-label-lg);
  line-height: var(--ds-line-height-label-lg);
  font-weight: var(--ds-font-weight-label-lg);
  color: var(--ds-text-strong);
}

/* ── Columns ──────────────────────────────────────────────────────── */
.page__cols {
  display: grid;
  grid-template-columns: minmax(0, 26rem) minmax(0, 1fr);
  gap: var(--ds-spacing-xl);
  align-items: start;
  min-height: 0;
}

.panel { min-width: 0; }

.panel__title {
  margin: 0;
  font-size: var(--ds-font-size-heading-lg);
  line-height: var(--ds-line-height-heading-lg);
  letter-spacing: var(--ds-letter-spacing-heading-lg);
  font-weight: var(--ds-font-weight-heading-lg);
  color: var(--ds-text-strong);
}

.panel__body { display: flex; flex-direction: column; gap: var(--ds-spacing-xl); padding: var(--ds-spacing-xl); }
.panel__readings { --fade-color: var(--ds-bg-default); }
.readings { display: flex; flex-direction: column; gap: var(--ds-spacing-lg); }

.reading {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-lg);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-lg);
  background-color: var(--ds-bg-default);
}

.reading--active { background-color: var(--ds-bg-brand-subtle); border-color: var(--ds-border-brand); }

.reading__head { display: flex; align-items: center; gap: var(--ds-spacing-md); color: var(--ds-text-subtlest); }

.reading__label {
  flex: 1 1 auto;
  font-size: var(--ds-font-size-heading-sm);
  line-height: var(--ds-line-height-heading-sm);
  font-weight: var(--ds-font-weight-heading-sm);
  color: var(--ds-text-strong);
}

.reading__unit,
.reading__date {
  font-size: var(--ds-font-size-body-md);
  line-height: var(--ds-line-height-body-md);
  color: var(--ds-text-subtle);
}

.reading__row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--ds-spacing-md); }

.reading__value {
  font-size: var(--ds-font-size-heading-lg);
  line-height: var(--ds-line-height-heading-lg);
  font-weight: var(--ds-font-weight-heading-lg);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}

/* ── Forecast ─────────────────────────────────────────────────────── */
.forecast { display: flex; flex-direction: column; gap: var(--ds-spacing-md); padding-top: var(--ds-spacing-md); }

.forecast__title {
  margin: 0 0 var(--ds-spacing-xs);
  font-size: var(--ds-font-size-heading-md);
  line-height: var(--ds-line-height-heading-md);
  font-weight: var(--ds-font-weight-heading-md);
  color: var(--ds-text-strong);
}

.forecast__row {
  display: grid;
  grid-template-columns: 5rem 24px 2.5rem 1fr auto;
  align-items: center;
  gap: var(--ds-spacing-md);
  font-size: var(--ds-font-size-body-md);
  line-height: var(--ds-line-height-body-md);
  color: var(--ds-text-default);
  font-variant-numeric: tabular-nums;
}

.forecast__row--today .forecast__day { font-weight: var(--ds-font-weight-label-lg); color: var(--ds-text-strong); }
.forecast__icon { color: var(--ds-text-subtlest); }
.forecast__humidity { text-align: right; color: var(--ds-text-subtle); }
.forecast__rain { text-align: right; color: var(--ds-text-brand); }

/* ── Map ──────────────────────────────────────────────────────────── */
.map { min-width: 0; }

.map__surface {
  position: relative;
  height: 38rem;
  border-radius: var(--ds-radius-xl);
  background-color: var(--ds-bg-inverse);
  overflow: hidden;
}

.map__tl { position: absolute; top: var(--ds-spacing-lg); left: var(--ds-spacing-lg); display: flex; gap: var(--ds-spacing-md); }
.map__tr { position: absolute; top: var(--ds-spacing-lg); right: var(--ds-spacing-lg); display: flex; flex-direction: column; gap: var(--ds-spacing-md); }
.map__zoom { display: flex; flex-direction: column; border-radius: var(--ds-radius-md); overflow: hidden; }

.map__ctl {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  background-color: var(--ds-bg-default);
  color: var(--ds-text-default);
  cursor: pointer;
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-sm);
}

.map__zoom .map__ctl { border-radius: 0; box-shadow: none; }
.map__zoom .map__ctl + .map__ctl { border-top: 1px solid var(--ds-border-subtle); }
.map__ctl:focus-visible { outline: none; box-shadow: var(--ds-focus-ring-brand); }
.map__ctl--brand { background-color: var(--ds-bg-brand-solid); color: var(--ds-text-on-brand-solid); }

.map__wide {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  height: 40px;
  padding: 0 var(--ds-spacing-lg);
  border: 0;
  border-radius: var(--ds-radius-md);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-shadow-sm);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--ds-font-size-label-lg);
  font-weight: var(--ds-font-weight-label-lg);
  color: var(--ds-text-default);
}

.map__wide:focus-visible { outline: none; box-shadow: var(--ds-focus-ring-brand); }

.map__pin {
  position: absolute;
  top: 42%;
  left: 8%;
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  font-size: var(--ds-font-size-body-sm);
  line-height: var(--ds-line-height-body-sm);
  color: var(--ds-text-on-inverse);
}

.map__pin-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-bg-default);
  box-shadow: 0 0 0 2px var(--ds-text-success);
}

.map__legend {
  position: absolute;
  left: var(--ds-spacing-lg);
  bottom: var(--ds-spacing-lg);
  width: 18rem;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-lg);
  border-radius: var(--ds-radius-lg);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-shadow-lg);
}

.map__legend-title {
  font-size: var(--ds-font-size-heading-sm);
  line-height: var(--ds-line-height-heading-sm);
  font-weight: var(--ds-font-weight-heading-sm);
  color: var(--ds-text-strong);
}

.map__legend-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--ds-font-size-body-sm);
  line-height: var(--ds-line-height-body-sm);
  color: var(--ds-text-subtle);
  font-variant-numeric: tabular-nums;
}

.map__legend-scale {
  height: 8px;
  border-radius: var(--ds-radius-full);
  background: linear-gradient(to right, var(--ds-bg-neutral-subtle), var(--ds-bg-brand-solid));
}

.map__ai {
  position: absolute;
  right: var(--ds-spacing-xl);
  bottom: var(--ds-spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1px solid var(--ds-border-brand);
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-bg-default);
  color: var(--ds-text-brand);
  box-shadow: var(--ds-shadow-lg);
  cursor: pointer;
}

.map__ai:focus-visible { outline: none; box-shadow: var(--ds-focus-ring-brand); }
</style>
