<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
Inversion,
  Piano,
  PianoBoard,
  PressType,
  type Chord,
  type Note,
  type PianoKey,
  type ScaleType,
} from '@stromland/piano-lib';

import TheFooter from './components/TheFooter.vue';
import PianoKeys from './components/PianoKeys/PianoKeys.vue';
import NoteSelector from './components/ScaleSelector/NoteSelector.vue';
import ScaleSelector from './components/ScaleSelector/ScaleSelector.vue';
import ChordSelector from './components/ChordSelector/ChordSelector.vue';
import PressTypeSelector from './components/PressTypeSelector.vue';
import InversionSelector from './components/InversionSelector.vue';

type State = {
  note: Note;
  scale: ScaleType;
  keys: PianoKey[];
  inversion: Inversion;
  pressType: PressType;
};

const state = reactive<State>({
  note: 'C',
  scale: 'major',
  keys: Piano.getPianoKeys(49),
  inversion: Inversion.ROOT,
  pressType: PressType.SCALE,
});

const chords = computed(() => {
  return PianoBoard.getAllChords(state.keys, state.note, state.scale);
})

const selectedChord = ref<Chord>(chords.value[0]);

const pressedKeys = computed(() => {
  if (state.pressType === PressType.SCALE) {
    return PianoBoard.pressAllScaleKeys(state.keys, state.note, state.scale);
  } else {
    return PianoBoard.pressChordKeys(state.keys, selectedChord.value, state.inversion);
  }
});

watch(chords, (newChords) => {
  selectedChord.value = newChords[0];
})

const selectNote = (note: Note) => (state.note = note);
const selectScale = (scale: ScaleType) => (state.scale = scale);
const selectChord = (chord: Chord) => (selectedChord.value = chord);
const selectType = (type: PressType) => (state.pressType = type);
const selectInversion = (inversion: Inversion) => (state.inversion = inversion);
</script>

<template>
  <main class="container">
    <PianoKeys :keys="pressedKeys" />
    <div>
      <p class="label">Show</p>
      <PressTypeSelector :select="selectType" :selected="state.pressType" />
      <p class="label">Scale</p>
      <ScaleSelector :select="selectScale" :selected="state.scale" />
      <NoteSelector :select="selectNote" :selected="state.note" />
      <div v-show="state.pressType === PressType.CHORD">
        <p class="label">Chord</p>
        <ChordSelector
          :chords="chords"
          :select="selectChord"
          :selected="selectedChord"
        />
        <InversionSelector
          :select="selectInversion"
          :selected="state.inversion"
        />
      </div>
    </div>
    <TheFooter />
  </main>
</template>

<style>
@import './assets/base.css';

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.label {
  font-weight: bold;
  color: var(--accent);
}
</style>
