<script setup lang="ts">
import { computed } from 'vue';

import {
  HARMONIC_FUNCTIONS,
  type KeyChord,
  formatNoteName,
} from '@stromland/piano-lib';

import ChoiceChip from './ChoiceChip.vue';

const props = defineProps<{ chords: KeyChord[] }>();

/** Position of the selected chord in `chords`. */
const model = defineModel<number>({ required: true });

const items = computed(() =>
  props.chords.map((keyChord, index) => ({
    index,
    borrowed: keyChord.borrowed,
    numeral: keyChord.numeral,
    name: formatNoteName(keyChord.chord.name),
    role: HARMONIC_FUNCTIONS[keyChord.function],
  })),
);

const groups = computed(() =>
  [
    { title: '', items: items.value.filter((item) => !item.borrowed) },
    {
      title: 'Borrowed from harmonic minor',
      items: items.value.filter((item) => item.borrowed),
    },
  ].filter((group) => group.items.length > 0),
);
</script>

<template>
  <div class="groups">
    <div
      v-for="group in groups"
      :key="group.title"
      class="group"
      role="group"
      :aria-label="group.title || undefined"
    >
      <h3 v-if="group.title" class="title">{{ group.title }}</h3>
      <div class="chords">
        <ChoiceChip
          v-for="item in group.items"
          :key="item.index"
          class="chord"
          :selected="item.index === model"
          :aria-label="`${item.numeral}, ${item.name}, ${item.role}`"
          @click="model = item.index"
        >
          <span class="numeral">{{ item.numeral }}</span>
          <span class="name">{{ item.name }}</span>
          <span class="role">{{ item.role }}</span>
        </ChoiceChip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}

.chords {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 6px;
}

.chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 74px;
  padding: 8px 6px;
}

.numeral {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
}

.role {
  font-size: 11px;
}
</style>
