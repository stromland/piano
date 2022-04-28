<script setup lang="ts">
import { Piano, PianoBoard } from '@stromland/piano-lib';
import AppFooter from './components/AppFooter/AppFooter.vue';
import PianoKeys from './components/PianoKeys/PianoKeys.vue';
import type { PianoKey } from '@stromland/piano-lib/lib';

let keys: PianoKey[] = Piano.getPianoKeys(41);
keys = PianoBoard.pressAllScaleKeys(keys, 'D#', 'major');
</script>

<template>
  <main class="container">
    <PianoKeys :keys="keys" />
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
