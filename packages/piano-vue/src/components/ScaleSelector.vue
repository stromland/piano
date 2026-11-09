<script setup lang="ts">
import { SCALES, SCALE_TYPES, type ScaleType } from '@stromland/piano-lib';

import ChoiceChip from './ChoiceChip.vue';

const model = defineModel<ScaleType>({ required: true });
</script>

<template>
  <div class="scales">
    <ChoiceChip
      v-for="type in SCALE_TYPES"
      :key="type"
      class="scale"
      :selected="type === model"
      @click="model = type"
    >
      {{ SCALES[type].name }}
    </ChoiceChip>
  </div>
</template>

<style scoped>
.scales {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.scale {
  flex: 1 1 auto;
  padding-inline: 14px;
}
</style>
