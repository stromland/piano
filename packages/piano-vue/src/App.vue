<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue';

import { INVERSIONS, type Mode, formatNoteName } from '@stromland/piano-lib';

import ChordPicker from './components/ChordPicker.vue';
import ChordSelector from './components/ChordSelector.vue';
import ControlSection from './components/ControlSection.vue';
import NoteSelector from './components/NoteSelector.vue';
import PianoKeyboard from './components/PianoKeyboard.vue';
import ProgressionSteps from './components/ProgressionSteps.vue';
import ScaleSelector from './components/ScaleSelector.vue';
import SegmentedControl from './components/SegmentedControl.vue';
import SelectionSummary from './components/SelectionSummary.vue';
import { INVERSION_LABELS, usePiano } from './composables/usePiano';

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'scale', label: 'Scale' },
  { value: 'chord', label: 'Chord' },
  { value: 'progression', label: 'Progression' },
];

const INVERSION_OPTIONS = INVERSIONS.map((value) => ({
  value,
  label: INVERSION_LABELS[value],
}));

const { selection, board, rootNames, summary, addChord, removeChord } =
  usePiano();

// The chord controls appear at the bottom, which is below the fold on a phone.
const chordControls = useTemplateRef('chordControls');
watch(
  () => selection.mode,
  async () => {
    await nextTick();
    chordControls.value?.$el.scrollIntoView({ block: 'nearest' });
  },
);

const keyboardLabel = computed(() => {
  const notes = board.value.notes.map((note) => formatNoteName(note.name));
  const detail = summary.value.detail && `, ${summary.value.detail}`;
  return `Piano keyboard showing ${summary.value.title}${detail}: ${notes.join(' ')}`;
});
</script>

<template>
  <div class="page">
    <header class="container header">
      <span class="wordmark">Piano</span>
      <SegmentedControl
        v-model="selection.mode"
        class="modes"
        label="Show"
        :options="MODE_OPTIONS"
      />
      <a
        class="source"
        href="https://github.com/stromland/piano"
        target="_blank"
        rel="noopener"
        aria-label="Source code on GitHub"
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
          />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      </a>
    </header>

    <main>
      <div class="stage">
        <SelectionSummary
          class="container"
          v-bind="summary"
          :notes="board.notes"
        />
        <PianoKeyboard :keys="board.keys" :label="keyboardLabel" />
      </div>

      <div class="container controls">
        <template v-if="selection.mode === 'progression'">
          <ControlSection title="Progression">
            <ProgressionSteps
              v-model="selection.step"
              :steps="board.progression.steps"
              @remove="removeChord"
            />
          </ControlSection>
          <ControlSection title="Add chord">
            <ChordPicker @add="addChord" />
          </ControlSection>
        </template>
        <template v-else>
          <ControlSection title="Root note">
            <NoteSelector v-model="selection.root" :names="rootNames" />
          </ControlSection>
          <ControlSection title="Scale">
            <ScaleSelector v-model="selection.scale" />
          </ControlSection>
        </template>
        <ControlSection
          v-if="selection.mode === 'chord'"
          ref="chordControls"
          title="Chord"
        >
          <ChordSelector
            v-model="selection.chordIndex"
            :chords="board.chords"
          />
          <SegmentedControl
            v-model="selection.inversion"
            label="Inversion"
            :options="INVERSION_OPTIONS"
          />
        </ControlSection>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block: max(12px, env(safe-area-inset-top)) 12px;
}

/* The three modes need their own row on the narrowest phones. */
@media (max-width: 359px) {
  .header {
    flex-wrap: wrap;
  }

  .modes {
    flex: 1 1 100%;
    order: 1;
  }
}

.wordmark {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.source {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  height: var(--tap-size);
  border-radius: 12px;
  color: var(--text);
}

@media (hover: hover) {
  .source:hover {
    background: var(--surface);
  }
}

/* Keeps the keyboard in view while scrolling through the controls on a phone. */
@media (min-height: 560px) {
  .stage {
    position: sticky;
    z-index: 2;
    top: 0;
    background: var(--background);
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-block: 18px 24px;
}
</style>
