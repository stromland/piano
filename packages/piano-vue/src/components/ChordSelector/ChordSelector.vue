<script setup lang="ts">
import type { Chord } from '@stromland/piano-lib';
import { computed } from 'vue';

import ToggleButton from '../ToggleButton.vue';

type Props = {
  chords: Chord[];
  selected?: Chord;
  select: (chord: Chord) => void;
};

const props = defineProps<Props>();

const namedChords = computed(() => {
  return props.chords.reduce(
    (acc, chord) => {
      const name = getChordName(chord);
      if (name) {
        acc[name] = chord;
      }
      return acc;
    },
    {} as Record<string, Chord>,
  );
});

function getChordName(chord?: Chord): string | undefined {
  return chord && `${chord.note}${chord.suffix}`;
}
</script>

<template>
  <div class="chords-container">
    <ToggleButton
      v-for="(chord, name) in namedChords"
      :key="name"
      :pressed="name === getChordName(props.selected)"
      @click="props.select(chord)"
    >
      {{ name }}
    </ToggleButton>
  </div>
</template>

<style scoped>
.chords-container {
  display: flex;
}
</style>
