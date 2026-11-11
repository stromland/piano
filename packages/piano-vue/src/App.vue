<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';

import {
  type ChordSize,
  type Tonality,
  type View,
  formatNoteName,
} from '@stromland/piano-lib';

import ChordTypeSelector from './components/ChordTypeSelector.vue';
import ControlSection from './components/ControlSection.vue';
import ExplainPanel from './components/ExplainPanel.vue';
import KeyChordSelector from './components/KeyChordSelector.vue';
import NoteSelector from './components/NoteSelector.vue';
import PianoKeyboard from './components/PianoKeyboard.vue';
import ScaleSelector from './components/ScaleSelector.vue';
import SegmentedControl from './components/SegmentedControl.vue';
import SelectionSummary from './components/SelectionSummary.vue';
import { useExplanation } from './composables/useExplanation';
import { INVERSION_SHORT_LABELS, usePiano } from './composables/usePiano';
import { type PlayStyle, useSound } from './composables/useSound';

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: 'scale', label: 'Scale' },
  { value: 'chord', label: 'Chord' },
  { value: 'key', label: 'Key' },
];

const TONALITY_OPTIONS: { value: Tonality; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
];

const SIZE_OPTIONS: { value: ChordSize; label: string }[] = [
  { value: 'triad', label: 'Triads' },
  { value: 'seventh', label: 'Sevenths' },
];

const {
  selection,
  board,
  rootNames,
  keyName,
  inversions,
  inversion,
  keyChord,
  summary,
} = usePiano();

/** The explanation replaces the controls, and stays open across views. */
const explaining = ref(false);
const explanation = useExplanation(
  selection,
  board,
  computed(() => summary.value.title),
);

const { play } = useSound();
const listen = (style: PlayStyle) => play(board.value.pressed, style);

const inversionOptions = computed(() =>
  inversions.value.map((value) => ({
    value,
    label: INVERSION_SHORT_LABELS[value],
  })),
);

// The controls of a view start below the fold on a phone, so bring them up.
const viewControls = useTemplateRef('viewControls');
watch(
  () => selection.view,
  async () => {
    await nextTick();
    viewControls.value?.$el.scrollIntoView({ block: 'nearest' });
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

    <nav class="container views">
      <SegmentedControl
        v-model="selection.view"
        label="Show"
        :options="VIEW_OPTIONS"
      />
    </nav>

    <main>
      <div class="stage">
        <SelectionSummary
          class="container"
          v-bind="summary"
          :notes="board.notes"
        >
          <button
            type="button"
            class="explain-toggle"
            :aria-pressed="explaining"
            @click="explaining = !explaining"
          >
            <svg
              v-if="explaining"
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            <svg
              v-else
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v6M12 7.5v.5" />
            </svg>
            {{ explaining ? 'Close' : 'Explain' }}
          </button>
        </SelectionSummary>
        <PianoKeyboard :keys="board.keys" :label="keyboardLabel" />
      </div>

      <div v-if="explaining" class="container controls">
        <ExplainPanel
          :explanation="explanation"
          @listen="listen"
          @select="keyChord = $event"
        />
      </div>

      <div v-else class="container controls">
        <ControlSection title="Root note">
          <NoteSelector v-model="selection.root" :names="rootNames" />
        </ControlSection>

        <ControlSection
          v-if="selection.view === 'scale'"
          ref="viewControls"
          title="Scale"
        >
          <ScaleSelector v-model="selection.scale" />
        </ControlSection>

        <ControlSection
          v-if="selection.view === 'chord'"
          ref="viewControls"
          title="Chord type"
        >
          <ChordTypeSelector
            v-model="selection.chordType"
            :root="selection.root"
          />
        </ControlSection>

        <template v-if="selection.view === 'key'">
          <ControlSection ref="viewControls" title="Key">
            <div class="pair">
              <SegmentedControl
                v-model="selection.tonality"
                label="Major or minor"
                :options="TONALITY_OPTIONS"
              />
              <SegmentedControl
                v-model="selection.chordSize"
                label="Chord size"
                :options="SIZE_OPTIONS"
              />
            </div>
          </ControlSection>
          <ControlSection :title="`Chords in ${keyName}`">
            <KeyChordSelector v-model="keyChord" :chords="board.keyChords" />
          </ControlSection>
        </template>

        <ControlSection v-if="selection.view !== 'scale'" title="Inversion">
          <SegmentedControl
            v-model="inversion"
            label="Inversion"
            :options="inversionOptions"
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
  padding-block: max(12px, env(safe-area-inset-top)) 8px;
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

.explain-toggle {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  min-height: var(--tap-size);
  padding: 0 16px 0 12px;
  border: 0;
  border-radius: 22px;
  background: var(--root);
  color: var(--root-ink);
  font-size: 15px;
  font-weight: 700;
}

@media (hover: hover) {
  .explain-toggle:hover {
    background: var(--root-strong);
  }
}

.views {
  padding-bottom: 12px;
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

.pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-block: 18px 24px;
}
</style>
