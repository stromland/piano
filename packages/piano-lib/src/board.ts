import {
  type Chord,
  type ChordType,
  type Inversion,
  getChord,
  invertChord,
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

export const VIEWS = ['scale', 'chord'] as const;

export type View = (typeof VIEWS)[number];

export interface Selection {
  view: View;
  /** Pitch class of the root note, shared by every view: 0 = C … 11 = B. */
  root: number;
  scale: ScaleType;
  chordType: ChordType;
  /** Counts as the chord's last inversion if it has fewer. */
  inversion: Inversion;
}

export interface BoardNote {
  name: string;
  /** Degree in the scale or chord, such as `'b3'`; see `formatNoteName`. */
  degree: string;
  root: boolean;
}

export interface Board {
  keys: PianoKey[];
  /** The pressed key indexes, lowest first. */
  pressed: number[];
  /** What is pressed, lowest first, without the repeated octave of a scale. */
  notes: BoardNote[];
  /** The notes of the scale, or of the chord in root position. */
  tones: ScaleNote[];
  /** The selected chord in the chord view. */
  chord: Chord | undefined;
}

/** Everything needed to draw the keyboard and its controls for a selection. */
export function getBoard(
  selection: Selection,
  keyCount = DEFAULT_KEY_COUNT,
): Board {
  const root = toPitchClass(selection.root);

  let tones: ScaleNote[];
  let chord: Chord | undefined;
  let pressed: number[];
  if (selection.view === 'chord') {
    chord = getChord(root, selection.chordType);
    tones = chord.notes;
    pressed = invertChord(
      tones.map((note) => root + note.interval),
      selection.inversion,
    );
  } else {
    tones = getScaleNotes(root, selection.scale);
    pressed = getScaleKeyIndexes(root, selection.scale);
  }

  const names = new Map(tones.map((note) => [note.pitchClass, note.name]));
  const sounding =
    selection.view === 'chord'
      ? pressed.map(toPitchClass)
      : tones.map((note) => note.pitchClass);

  return {
    keys: pressKeys(createKeyboard(keyCount), pressed, {
      names,
      rootPitchClass: root,
    }),
    pressed: pressed.filter((index) => index < keyCount),
    notes: sounding
      .flatMap((pitchClass) =>
        tones.filter((note) => note.pitchClass === pitchClass),
      )
      .map((note) => ({
        name: note.name,
        degree: note.degree,
        root: note.pitchClass === root,
      })),
    tones,
    chord,
  };
}
