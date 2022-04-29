<script setup lang="ts">
import ToggleButton from '../ToggleButton.vue';
import { Scale, type ScaleType } from '@stromland/piano-lib';

type Props = {
  select: (scale: ScaleType) => void;
  selected: ScaleType;
};

const props = defineProps<Props>();

const scaleNames: Record<ScaleType, string> = {
  major: 'Major',
  minor: 'Minor',
  harmonicMinor: 'Harmonic minor',
};
</script>

<template>
  <div class="scale-container">
    <ToggleButton
      v-for="(_, scale) in Scale.scales"
      :key="scale"
      :pressed="scale === props.selected"
      @click="props.select(scale)"
    >
      {{ scaleNames[scale] }}
    </ToggleButton>
  </div>
</template>

<style scoped>
.scale-container {
  display: flex;
}
</style>
