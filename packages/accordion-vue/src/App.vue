<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
  CHORD_TYPES,
  formatNoteName,
  getChordRootNames,
} from '@stromland/music-theory';

import { type Selection, getBoard } from './board';
import AlternatingBass from './components/AlternatingBass.vue';
import ChordTypeSelector from './components/ChordTypeSelector.vue';
import ControlSection from './components/ControlSection.vue';
import NoteSelector from './components/NoteSelector.vue';
import PianoKeyboard from './components/PianoKeyboard.vue';
import StradellaBass from './components/StradellaBass.vue';
import { getButton } from './stradella';

const selection = reactive<Selection>({ root: 7, chordType: 'dominant7' });

const board = computed(() => getBoard(selection));

const chordName = computed(() => formatNoteName(board.value.chord.name));

const rootNames = computed(() =>
  getChordRootNames(selection.chordType).map(formatNoteName),
);

const trebleNotes = computed(() =>
  board.value.chord.notes.map((note) => formatNoteName(note.name)).join(' '),
);

/** What the left hand plays, such as "G bass + G7 button". */
const leftHand = computed(() => {
  const { bassChord } = board.value;
  if (!bassChord) return 'No button: play it with the right hand';
  const bass = getButton(bassChord.bass.row, bassChord.bass.column);
  const chord = getButton(bassChord.chord.row, bassChord.chord.column);
  return `${formatNoteName(bass.name)} bass + ${formatNoteName(chord.name)} button`;
});
</script>

<template>
  <div class="page">
    <header class="container header">
      <span class="wordmark">Accordion</span>
    </header>

    <main class="container content">
      <div class="title">
        <h1 class="chord">{{ chordName }}</h1>
        <span class="type">{{ CHORD_TYPES[selection.chordType].name }}</span>
      </div>

      <section class="hand" aria-labelledby="left-hand">
        <div class="hand-header">
          <h2 id="left-hand" class="hand-title">Left hand</h2>
          <span class="hand-summary">{{ leftHand }}</span>
        </div>
        <StradellaBass
          :rows="board.bass"
          :label="`Stradella bass: ${leftHand}`"
        />
        <AlternatingBass v-if="board.beats.length" :beats="board.beats" />
      </section>

      <section class="hand treble" aria-labelledby="right-hand">
        <div class="hand-header">
          <h2 id="right-hand" class="hand-title">Right hand</h2>
          <span class="hand-summary">{{ trebleNotes }}</span>
        </div>
        <PianoKeyboard
          :keys="board.treble"
          :label="`Treble: ${chordName}, ${trebleNotes}`"
        />
      </section>

      <div class="controls">
        <ControlSection title="Root">
          <NoteSelector v-model="selection.root" :names="rootNames" />
        </ControlSection>
        <ControlSection title="Chord">
          <ChordTypeSelector
            v-model="selection.chordType"
            :root="selection.root"
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
  min-height: calc(var(--tap-size) + 20px);
  padding-block: max(12px, env(safe-area-inset-top)) 8px;
}

.wordmark {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}

.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.chord {
  margin: 0;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.type {
  color: var(--text-muted);
  font-size: 15px;
}

.hand {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 16px;
  background: var(--sunken);
}

/* The keyboard reaches the edges of the card, so it can scroll sideways. */
.treble {
  padding-inline: 0;
  padding-bottom: 0;
  overflow: hidden;
}

.treble .hand-header {
  padding-inline: 12px;
}

.hand-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
}

.hand-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
}

.hand-summary {
  color: var(--text-muted);
  font-size: 13px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;
}
</style>
