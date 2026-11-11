import { computed, reactive } from 'vue';

import {
  CHORD_TYPES,
  type Inversion,
  SCALES,
  type Selection,
  formatNoteName,
  getBoard,
  getChordRootNames,
  getInversions,
  getRootNames,
} from '@stromland/piano-lib';

export const INVERSION_LABELS: Record<Inversion, string> = {
  root: 'Root position',
  first: '1st inversion',
  second: '2nd inversion',
  third: '3rd inversion',
};

/** Short enough for four of them side by side on a phone. */
export const INVERSION_SHORT_LABELS: Record<Inversion, string> = {
  root: 'Root',
  first: '1st',
  second: '2nd',
  third: '3rd',
};

export function usePiano() {
  const selection = reactive<Selection>({
    view: 'scale',
    root: 0,
    scale: 'major',
    chordType: 'major',
    inversion: 'root',
  });

  const board = computed(() => getBoard(selection));

  /** What the twelve keys are called as the root of what is selected. */
  const rootNames = computed(() =>
    (selection.view === 'chord'
      ? getChordRootNames(selection.chordType)
      : getRootNames(selection.scale)
    ).map(formatNoteName),
  );

  /** The inversions the selected chord has, as it may have fewer than asked for. */
  const inversions = computed(() => getInversions(board.value.tones.length));

  /** The selected inversion, or the chord's last one if it has fewer. */
  const inversion = computed<Inversion>({
    get: () =>
      inversions.value.includes(selection.inversion)
        ? selection.inversion
        : (inversions.value.at(-1) ?? 'root'),
    set: (value) => {
      selection.inversion = value;
    },
  });

  const summary = computed(() => {
    const { chord, tones } = board.value;
    if (selection.view === 'chord' && chord) {
      return {
        overline: `Chord · ${CHORD_TYPES[chord.type].name}`,
        title: formatNoteName(chord.name),
        detail: INVERSION_LABELS[inversion.value],
      };
    }
    const { name, group } = SCALES[selection.scale];
    // Modes are proper names: D Dorian, but D minor.
    const scale = group === 'modes' ? name : name.toLowerCase();
    const root = formatNoteName(tones[0]?.name ?? '');
    return { overline: 'Scale', title: `${root} ${scale}`, detail: '' };
  });

  return { selection, board, rootNames, inversions, inversion, summary };
}
