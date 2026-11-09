<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  CHORD_QUALITY_TYPES,
  type ChordQuality,
  PROGRESSION_ROOT_NAMES,
  type ProgressionChord,
  formatNoteName,
  spellChord,
} from '@stromland/piano-lib';

import ChoiceChip from './ChoiceChip.vue';
import NoteSelector from './NoteSelector.vue';

const emit = defineEmits<{ add: [chord: ProgressionChord] }>();

const ROOT_NAMES = PROGRESSION_ROOT_NAMES.map(formatNoteName);

const root = ref(0);
const quality = ref<ChordQuality>('major');

/** Each quality as a chord on the selected root: G, Gm … Gdim7. */
const options = computed(() =>
  CHORD_QUALITY_TYPES.map((type) => ({
    type,
    name: formatNoteName(spellChord({ root: root.value, quality: type }).name),
  })),
);

const name = computed(() =>
  formatNoteName(spellChord({ root: root.value, quality: quality.value }).name),
);
</script>

<template>
  <NoteSelector v-model="root" :names="ROOT_NAMES" />
  <div class="qualities" role="group" aria-label="Chord type">
    <ChoiceChip
      v-for="option in options"
      :key="option.type"
      :selected="option.type === quality"
      @click="quality = option.type"
    >
      {{ option.name }}
    </ChoiceChip>
  </div>
  <button type="button" class="add" @click="emit('add', { root, quality })">
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
    Add {{ name }}
  </button>
</template>

<style scoped>
.qualities {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

@media (min-width: 640px) {
  .qualities {
    grid-template-columns: repeat(9, minmax(0, 1fr));
  }
}

.add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  background: var(--root);
  color: var(--root-ink);
  font-size: 16px;
  font-weight: 700;
}

@media (hover: hover) {
  .add:hover {
    background: var(--root-strong);
  }
}
</style>
