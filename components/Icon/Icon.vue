<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './registry'

interface Props {
  name: IconName
  size?: number | string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), { size: 24 })

const component = computed(() => icons[props.name])
</script>

<template>
  <component
    :is="component"
    :width="size"
    :height="size"
    :aria-hidden="!ariaLabel || undefined"
    :aria-label="ariaLabel"
    class="ds-icon"
  />
</template>

<style scoped>
.ds-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
