<script setup lang="ts">
import {
  Piano,
  PianoBoard,
  type Note,
  type ScaleType,
} from '@stromland/piano-lib';
import AppFooter from './components/AppFooter/AppFooter.vue';
import PianoKeys from './components/PianoKeys/PianoKeys.vue';
import NoteSelector from './components/ScaleSelector/NoteSelector.vue';
import { computed, reactive } from 'vue';
import ScaleSelector from './components/ScaleSelector/ScaleSelector.vue';

type State = {
  note: Note;
  scale: ScaleType;
};

const state = reactive<State>({
  note: 'C',
  scale: 'major',
});

const keys = computed(() => {
  return PianoBoard.pressAllScaleKeys(
    Piano.getPianoKeys(41),
    state.note,
    state.scale
  );
});

const selectNote = (note: Note) => (state.note = note);
const selectScale = (scale: ScaleType) => (state.scale = scale);
</script>

<template>
  <main class="container">
    <PianoKeys :keys="keys" />
    <div>
      <ScaleSelector :select="selectScale" :selected="state.scale" />
      <NoteSelector :select="selectNote" :selected="state.note" />
    </div>
    <AppFooter />
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
  color: var(--label-text);
}

.label--small {
  font-size: 1em;
}

.label--medium {
  font-size: 2em;
}
</style>
