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
import LicensesPage from './components/LicensesPage.vue';
import NoteSelector from './components/NoteSelector.vue';
import PianoKeyboard from './components/PianoKeyboard.vue';
import ScaleSelector from './components/ScaleSelector.vue';
import SegmentedControl from './components/SegmentedControl.vue';
import SelectionSummary from './components/SelectionSummary.vue';
import SettingsPage from './components/SettingsPage.vue';
import { useExplanation } from './composables/useExplanation';
import { type Page, usePage } from './composables/usePage';
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

const PAGE_TITLES: Record<Page, string> = {
  main: 'Piano',
  settings: 'Settings',
  licenses: 'Licenses',
};

const { page, open, back } = usePage();

// Moves focus along to the page that opens, for keyboards and screen readers.
const pageHeading = useTemplateRef('pageHeading');
const settingsButton = useTemplateRef('settingsButton');
watch(page, async (current, previous) => {
  await nextTick();
  window.scrollTo({ top: 0 });
  if (current !== 'main') pageHeading.value?.focus();
  else if (previous === 'settings') settingsButton.value?.focus();
});

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
// Closing it puts the notes back where they started.
watch(explaining, (open) => {
  if (!open) selection.octave = 0;
});
const explanation = useExplanation(
  selection,
  board,
  computed(() => summary.value.title),
);

const { play } = useSound();
const listen = (style: PlayStyle) => play(board.value.pressed, style);

/** Moves the notes an octave and plays them, so you hear them go up or down. */
const octave = computed({
  get: () => board.value.octave,
  set: (value: number) => {
    selection.octave = value;
    listen(selection.view === 'scale' ? 'oneByOne' : 'together');
  },
});

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
      <template v-if="page === 'main'">
        <span class="wordmark">Piano</span>
        <button
          ref="settingsButton"
          type="button"
          class="icon-button"
          aria-label="Settings"
          @click="open('settings')"
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
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </template>
      <div v-else class="page-title">
        <button
          type="button"
          class="icon-button"
          :aria-label="page === 'licenses' ? 'Back to Settings' : 'Back'"
          @click="back"
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 ref="pageHeading" class="page-heading" tabindex="-1">
          {{ PAGE_TITLES[page] }}
        </h1>
      </div>
    </header>

    <main v-if="page === 'settings'">
      <SettingsPage @licenses="open('licenses')" />
    </main>

    <main v-else-if="page === 'licenses'">
      <LicensesPage />
    </main>

    <template v-else>
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
            v-model:octave="octave"
            :explanation="explanation"
            :staff="board.staff"
            :title="summary.title"
            :octaves="board.octaves"
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
    </template>
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

.icon-button {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  height: var(--tap-size);
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--text);
}

@media (hover: hover) {
  .icon-button:hover {
    background: var(--surface);
  }
}

.page-title {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  /* Lines the arrow up with the content below, not its tap area. */
  margin-left: -10px;
}

.page-heading {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.page-heading:focus {
  outline: none;
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
