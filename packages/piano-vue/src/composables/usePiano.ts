import { computed, reactive, watch } from 'vue';

import {
  type Inversion,
  type ProgressionChord,
  SCALES,
  type Selection,
  formatNoteName,
  getBoard,
  getRootNames,
} from '@stromland/piano-lib';

/** Names an inversion by its number: 0 = root position … 3 = third. */
export const POSITION_LABELS = [
  'Root position',
  '1st inversion',
  '2nd inversion',
  '3rd inversion',
] as const;

export const INVERSION_LABELS: Record<Inversion, string> = {
  root: POSITION_LABELS[0],
  first: POSITION_LABELS[1],
  second: POSITION_LABELS[2],
};

export const semitones = (count: number) =>
  `${count} ${count === 1 ? 'semitone' : 'semitones'}`;

export function usePiano() {
  const selection = reactive<Selection>({
    mode: 'scale',
    root: 0,
    scale: 'major',
    chordIndex: 0,
    inversion: 'root',
    progression: [],
    step: 0,
  });

  // Another scale has other chords, so start again from its first one.
  watch(
    () => [selection.root, selection.scale],
    () => {
      selection.chordIndex = 0;
    },
  );

  const board = computed(() => getBoard(selection));

  /** What the twelve keys are called as the root of the selected scale. */
  const rootNames = computed(() =>
    getRootNames(selection.scale).map(formatNoteName),
  );

  const scaleName = computed(() => {
    const scale = SCALES[selection.scale].name.toLowerCase();
    return `${rootNames.value[selection.root]} ${scale}`;
  });

  const progressionSummary = computed(() => {
    const { progression, step } = board.value;
    if (!step) {
      return {
        overline: 'Progression',
        title: 'No chords yet',
        detail: 'Add one below',
      };
    }

    const index = progression.steps.indexOf(step);
    const previous = progression.steps[index - 1];
    const position = POSITION_LABELS[step.inversion] ?? '';
    return {
      overline: `Step ${index + 1} of ${progression.steps.length} · ${semitones(progression.total)} in total`,
      title: formatNoteName(step.name),
      detail: previous
        ? `${position} · +${semitones(step.movement)} from ${formatNoteName(previous.name)}`
        : position,
    };
  });

  const summary = computed(() => {
    const { chord } = board.value;
    if (selection.mode === 'progression') return progressionSummary.value;
    return selection.mode === 'chord' && chord
      ? {
          overline: `Chord in ${scaleName.value}`,
          title: formatNoteName(chord.name),
          detail: INVERSION_LABELS[selection.inversion],
        }
      : { overline: 'Scale', title: scaleName.value, detail: '' };
  });

  /** Adds the chord at the end of the progression and shows it. */
  function addChord(chord: ProgressionChord) {
    selection.progression.push(chord);
    selection.step = selection.progression.length - 1;
  }

  /** Removes a chord, keeping the same step selected where it still exists. */
  function removeChord(index: number) {
    selection.progression.splice(index, 1);
    if (
      index < selection.step ||
      selection.step >= selection.progression.length
    ) {
      selection.step = Math.max(0, selection.step - 1);
    }
  }

  return { selection, board, rootNames, summary, addChord, removeChord };
}
