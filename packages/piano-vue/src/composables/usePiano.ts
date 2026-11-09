import { computed, reactive, watch } from 'vue';

import {
  type Inversion,
  SCALES,
  type Selection,
  formatNoteName,
  getBoard,
  getRootNames,
} from '@stromland/piano-lib';

export const INVERSION_LABELS: Record<Inversion, string> = {
  root: 'Root position',
  first: '1st inversion',
  second: '2nd inversion',
};

export function usePiano() {
  const selection = reactive<Selection>({
    mode: 'scale',
    root: 0,
    scale: 'major',
    chordIndex: 0,
    inversion: 'root',
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

  const summary = computed(() => {
    const { chord } = board.value;
    return selection.mode === 'chord' && chord
      ? {
          overline: `Chord in ${scaleName.value}`,
          title: formatNoteName(chord.name),
          detail: INVERSION_LABELS[selection.inversion],
        }
      : { overline: 'Scale', title: scaleName.value, detail: '' };
  });

  return { selection, board, rootNames, summary };
}
