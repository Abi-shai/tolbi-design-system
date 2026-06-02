<script setup lang="ts">
import { computed } from 'vue'

import carboneImg    from './assets/carbone.svg'
import sourceImg     from './assets/source.svg'
import callImg       from './assets/call.svg'
import scanImg       from './assets/scan.svg'
import dataImg       from './assets/data.svg'
import idImg         from './assets/id.svg'
import reddImg       from './assets/redd.svg'
import surveyImg     from './assets/survey.svg'
import yieldImg      from './assets/yield.svg'
import traceImg      from './assets/trace.svg'
import yieldMaskImg  from './assets/yield-mask.svg'
import forestMaskImg from './assets/forest-mask.svg'
import yieldOverlay  from './assets/yield-overlay.svg'
import forestOverlay from './assets/forest-overlay.svg'
import traceVector   from './assets/trace-vector.svg'

export type ModuleName =
  | 'Carbone' | 'Source' | 'Call' | 'Scan' | 'Data'
  | 'ID' | 'Redd+' | 'Survey' | 'Yield' | 'Forest'
  | 'Trace' | 'Eudr'

interface Props {
  module?: ModuleName
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  module: 'Carbone',
  size: 48,
})

const assets: Partial<Record<ModuleName, string>> = {
  Carbone: carboneImg,
  Source:  sourceImg,
  Call:    callImg,
  Scan:    scanImg,
  Data:    dataImg,
  ID:      idImg,
  'Redd+': reddImg,
  Survey:  surveyImg,
  Yield:   yieldImg,
  Forest:  yieldImg,
  Trace:   traceImg,
}

const src      = computed(() => assets[props.module])
const isYield  = computed(() => props.module === 'Yield')
const isForest = computed(() => props.module === 'Forest')
const isTrace  = computed(() => props.module === 'Trace')
const hasMask  = computed(() => isYield.value || isForest.value)

const maskSrc    = computed(() => isForest.value ? forestMaskImg : yieldMaskImg)
const overlaySrc = computed(() => isForest.value ? forestOverlay : yieldOverlay)

const sizeStyle = computed(() => ({
  width:  typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
}))
</script>

<template>
  <div class="ds-module-icon" :style="sizeStyle" :aria-label="module" role="img">
    <img v-if="src" :src="src" alt="" class="ds-module-icon__img" />

    <div v-if="hasMask" class="ds-module-icon__mask-group">
      <div
        class="ds-module-icon__mask"
        :style="{ maskImage: `url('${maskSrc}')` }"
      >
        <img :src="overlaySrc" alt="" class="ds-module-icon__overlay" />
      </div>
    </div>

    <div v-if="isTrace" class="ds-module-icon__trace">
      <img :src="traceVector" alt="" class="ds-module-icon__trace-img" />
    </div>
  </div>
</template>

<style scoped>
.ds-module-icon {
  position: relative;
  display: inline-flex;
  overflow: hidden;
  flex-shrink: 0;
}

.ds-module-icon__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ds-module-icon__mask-group {
  position: absolute;
  inset: 16.6%;
}

.ds-module-icon__mask {
  position: absolute;
  inset: 0;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-mode: alpha;
}

.ds-module-icon__overlay {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ds-module-icon__trace {
  position: absolute;
  inset: 41% 18% 41% 18.7%;
}

.ds-module-icon__trace-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
