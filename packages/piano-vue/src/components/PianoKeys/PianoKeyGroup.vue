<script setup lang="ts">
import Key from './PianoKey.vue';
import type { PianoKey } from '@stromland/piano-lib';

const props = defineProps<{
  keys: PianoKey[];
  pianoKey: PianoKey;
  keyIndex: number;
}>();

const nextKey =
  props.keys.length > props.keyIndex + 1
    ? props.keys[props.keyIndex + 1]
    : null;
</script>

<template>
  <div v-if="!pianoKey.black" class="key-group">
    <Key :pianoKey="pianoKey" />
    <Key v-if="nextKey && nextKey.black" :pianoKey="nextKey" />
  </div>
</template>

<style scoped>
.key-group {
  flex: 1;
  display: flex;
  position: relative;
}
</style>
