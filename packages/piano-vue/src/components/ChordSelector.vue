<script setup lang="ts">
import { type Chord, formatNoteName } from '@stromland/piano-lib';

import ChoiceChip from './ChoiceChip.vue';

defineProps<{ chords: Chord[] }>();

/** Position of the selected chord in `chords`. */
const model = defineModel<number>({ required: true });
</script>

<template>
  <div class="chords">
    <ChoiceChip
      v-for="(chord, index) in chords"
      :key="chord.name"
      :selected="index === model"
      @click="model = index"
    >
      {{ formatNoteName(chord.name) }}
    </ChoiceChip>
  </div>
</template>

<style scoped>
.chords {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(76px, 1fr));
  gap: 6px;
}
</style>
