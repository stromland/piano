<script setup lang="ts">
import { PressType } from '@stromland/piano-lib';

import ChordSelector from './components/ChordSelector/ChordSelector.vue';
import InversionSelector from './components/InversionSelector.vue';
import PianoKeys from './components/PianoKeys/PianoKeys.vue';
import PressTypeSelector from './components/PressTypeSelector.vue';
import NoteSelector from './components/ScaleSelector/NoteSelector.vue';
import ScaleSelector from './components/ScaleSelector/ScaleSelector.vue';
import TheFooter from './components/TheFooter.vue';
import { usePiano } from './service/usePiano';

const { pressedKeys, chords, state, select } = usePiano();
</script>

<template>
  <main class="container">
    <PianoKeys :keys="pressedKeys" />
    <div>
      <p class="label">Show</p>
      <PressTypeSelector :select="select.type" :selected="state.pressType" />
      <p class="label">Scale</p>
      <ScaleSelector :select="select.scale" :selected="state.scale" />
      <NoteSelector :select="select.note" :selected="state.note" />
      <div v-show="state.pressType === PressType.CHORD">
        <p class="label">Chord</p>
        <ChordSelector
          :chords="chords"
          :select="select.chord"
          :selected="state.chord"
        />
        <InversionSelector
          :select="select.inversion"
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
