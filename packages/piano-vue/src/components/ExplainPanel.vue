<script setup lang="ts">
import { useId } from 'vue';

import type { Explanation } from '../composables/useExplanation';
import type { PlayStyle } from '../composables/useSound';
import OctaveStepper from './OctaveStepper.vue';

defineProps<{
  explanation: Explanation;
  /** How far the notes can be moved down and up. */
  octaves: { lowest: number; highest: number };
}>();

/** Octaves the notes are moved from where they start. */
const octave = defineModel<number>('octave', { required: true });

defineEmits<{
  listen: [style: PlayStyle];
  /** Picks another chord of the key, by its position. */
  select: [index: number];
}>();

const headingId = useId();
</script>

<template>
  <section class="explain" :aria-labelledby="headingId">
    <div class="block">
      <h2 :id="headingId" class="heading">{{ explanation.heading }}</h2>
      <p
        v-for="paragraph in explanation.paragraphs"
        :key="paragraph"
        class="text"
      >
        {{ paragraph }}
      </p>
    </div>

    <div class="block" role="group" aria-label="Listen">
      <h3 class="label">Listen</h3>
      <div class="listen">
        <button
          v-for="option in explanation.listen"
          :key="option.style"
          type="button"
          class="tile play"
          @click="$emit('listen', option.style)"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
            <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
          </svg>
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="block">
      <h3 class="label">Octave</h3>
      <OctaveStepper
        v-model="octave"
        :lowest="octaves.lowest"
        :highest="octaves.highest"
      />
    </div>

    <div class="block">
      <h3 class="label">{{ explanation.tonesTitle }}</h3>
      <ul class="tones">
        <li v-for="tone in explanation.tones" :key="tone.name" class="tone">
          <span class="tone-name" :class="{ root: tone.root }">
            {{ tone.name }}
          </span>
          <span class="tone-degree">{{ tone.degree }}</span>
          <span>{{ tone.interval }}</span>
        </li>
      </ul>
    </div>

    <div v-if="explanation.steps.length > 0" class="block">
      <h3 class="label">Steps</h3>
      <ul class="steps">
        <li
          v-for="(step, index) in explanation.steps"
          :key="index"
          class="step"
        >
          {{ step }}
        </li>
      </ul>
      <p class="note">W = whole step, H = half step</p>
    </div>

    <div v-if="explanation.next.length > 0" class="block">
      <h3 class="label">Where it usually goes</h3>
      <div class="tiles">
        <button
          v-for="next in explanation.next"
          :key="next.index"
          type="button"
          class="tile chord"
          @click="$emit('select', next.index)"
        >
          <span class="numeral">{{ next.numeral }}</span>
          <span class="name">{{ next.name }}</span>
        </button>
      </div>
    </div>

    <div v-if="explanation.foundIn.length > 0" class="block">
      <h3 class="label">Found in these keys</h3>
      <ul class="tiles">
        <li
          v-for="found in explanation.foundIn"
          :key="found.key"
          class="tile chord"
        >
          <span class="numeral">{{ found.numeral }}</span>
          <span class="key">{{ found.key }}</span>
        </li>
      </ul>
    </div>

    <p v-if="explanation.note" class="note">{{ explanation.note }}</p>
  </section>
</template>

<style scoped>
.explain {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.heading {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.label {
  margin: 0;
  color: var(--label);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.text {
  max-width: 62ch;
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
}

.note {
  max-width: 62ch;
  margin: 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.5;
}

.listen {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
}

.play {
  gap: 8px;
  min-height: 48px;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 600;
}

.chord {
  flex-direction: column;
  gap: 2px;
  min-height: 58px;
  padding: 6px;
  text-align: center;
}

@media (hover: hover) {
  button.tile:hover {
    background: var(--surface-hover);
  }
}

.numeral {
  color: var(--label);
  font-size: 13px;
  font-weight: 700;
}

.name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.1;
}

.key {
  font-size: 12px;
  font-weight: 600;
}

.tones {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 10px;
  list-style: none;
}

.tone {
  display: grid;
  grid-template-columns: 56px 48px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-height: 40px;
  padding: 0 12px;
  background: var(--surface);
  font-size: 15px;
}

.tone + .tone {
  border-top: 1px solid var(--line);
}

.tone-name {
  font-family: var(--font-display);
  font-weight: 700;
}

.tone-name.root {
  color: var(--root);
}

.tone-degree {
  color: var(--text-muted);
  font-weight: 600;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  font-size: 14px;
  font-weight: 600;
}
</style>
