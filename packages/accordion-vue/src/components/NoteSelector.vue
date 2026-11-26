<script setup lang="ts">
import ChoiceChip from './ChoiceChip.vue';

defineProps<{
  /** The name of each of the twelve notes, starting at C. */
  names: string[];
}>();

/** Pitch class of the selected note: 0 = C … 11 = B. */
const model = defineModel<number>({ required: true });
</script>

<template>
  <div class="notes">
    <ChoiceChip
      v-for="(name, pitchClass) in names"
      :key="pitchClass"
      :selected="pitchClass === model"
      @click="model = pitchClass"
    >
      {{ name }}
    </ChoiceChip>
  </div>
</template>

<style scoped>
/* Two rows of six on a phone, one row of twelve when there is room. */
.notes {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

@media (min-width: 640px) {
  .notes {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}
</style>
