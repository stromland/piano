import {
  type Chord,
  type Inversion,
  getScaleChords,
  invertTriad,
} from './chords.js';
import {
  DEFAULT_KEY_COUNT,
  type PianoKey,
  createKeyboard,
  pressKeys,
} from './keyboard.js';
import { toPitchClass } from './notes.js';
import {
  type ScaleNote,
  type ScaleType,
  getScaleKeyIndexes,
  getScaleNotes,
} from './scales.js';

export const MODES = ['scale', 'chord'] as const;

export type Mode = (typeof MODES)[number];

export interface Selection {
  mode: Mode;
  /** Pitch class of the root of the scale: 0 = C … 11 = B. */
  root: number;
  scale: ScaleType;
  /** Position in `Board.chords`; clamped if the scale has fewer chords. */
  chordIndex: number;
  inversion: Inversion;
}

export interface BoardNote {
  name: string;
  root: boolean;
}

export interface Board {
  keys: PianoKey[];
  scaleNotes: ScaleNote[];
  /** The triads of the scale. */
  chords: Chord[];
  /** The selected triad, whichever mode is active. */
  chord: Chord | undefined;
  /** What is pressed, lowest first, without the repeated octave of a scale. */
  notes: BoardNote[];
}

/** Everything needed to draw the keyboard and its controls for a selection. */
export function getBoard(
  selection: Selection,
  keyCount = DEFAULT_KEY_COUNT,
): Board {
  const root = toPitchClass(selection.root);
  const scaleNotes = getScaleNotes(root, selection.scale);
  const names = new Map(scaleNotes.map((note) => [note.pitchClass, note.name]));

  const chords = getScaleChords(root, selection.scale);
  const chordIndex = Math.min(
    Math.max(0, selection.chordIndex),
    chords.length - 1,
  );
  const chord = chords[chordIndex];

  const showChord = selection.mode === 'chord';
  const rootPitchClass = showChord ? chord?.root.pitchClass : root;
  const pressed = showChord
    ? invertTriad(chord?.keyIndexes ?? [], selection.inversion)
    : getScaleKeyIndexes(root, selection.scale);

  const sounding = showChord
    ? pressed.map(toPitchClass)
    : scaleNotes.map((note) => note.pitchClass);

  return {
    keys: pressKeys(createKeyboard(keyCount), pressed, {
      names,
      rootPitchClass,
    }),
    scaleNotes,
    chords,
    chord,
    notes: sounding.map((pitchClass) => ({
      name: names.get(pitchClass) ?? '',
      root: pitchClass === rootPitchClass,
    })),
  };
}
