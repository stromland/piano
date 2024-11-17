<script setup lang="ts">
import { type Note, PIANO_NOTES } from '@stromland/piano-lib';

import ToggleButton from '../ToggleButton.vue';

type Props = {
  select: (note: Note) => void;
  selected: Note;
};

const props = defineProps<Props>();
</script>

<template>
  <div class="notes-container">
    <ToggleButton
      v-for="note in PIANO_NOTES"
      :key="note"
      :pressed="note === props.selected"
      @click="props.select(note)"
    >
      {{ note }}
    </ToggleButton>
  </div>
</template>

<style scoped>
.notes-container {
  display: flex;
}
</style>
