import { computed, reactive } from 'vue';

import {
  CHORD_TYPES,
  HARMONIC_FUNCTIONS,
  type Inversion,
  SCALES,
  type Selection,
  formatNoteName,
  getBoard,
  getChordRootNames,
  getInversions,
  getKeyName,
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
    tonality: 'major',
    chordSize: 'triad',
    keyChord: 0,
    inversion: 'root',
  });

  const board = computed(() => getBoard(selection));

  /** What the twelve keys are called as the root of what is selected. */
  const rootNames = computed(() => {
    const names = {
      scale: () => getRootNames(selection.scale),
      chord: () => getChordRootNames(selection.chordType),
      key: () => getRootNames(selection.tonality),
    }[selection.view]();
    return names.map(formatNoteName);
  });

  const keyName = computed(() =>
    formatNoteName(getKeyName(selection.root, selection.tonality)),
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

  /** The selected chord of the key, or its last one if it has fewer. */
  const keyChord = computed<number>({
    get: () =>
      Math.min(
        Math.max(0, selection.keyChord),
        board.value.keyChords.length - 1,
      ),
    set: (value) => {
      selection.keyChord = value;
    },
  });

  const summary = computed(() => {
    const { chord, keyChord, tones } = board.value;
    if (selection.view === 'key' && chord && keyChord) {
      return {
        overline: `${keyName.value} · ${HARMONIC_FUNCTIONS[keyChord.function]}`,
        title: formatNoteName(chord.name),
        detail: `${keyChord.numeral} · ${INVERSION_LABELS[inversion.value]}`,
      };
    }
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

  return {
    selection,
    board,
    rootNames,
    keyName,
    inversions,
    inversion,
    keyChord,
    summary,
  };
}
