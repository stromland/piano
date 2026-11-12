import {
  type Chord,
  type ChordSize,
  type ChordType,
  type Inversion,
  getChord,
  invertChord,
} from './chords.js';
import {
  DEFAULT_KEY_COUNT,
  MIDDLE_C,
  type PianoKey,
  createKeyboard,
  pressKeys,
} from './keyboard.js';
import { type KeyChord, getKeyChords } from './keys.js';
import { NOTES_PER_OCTAVE, toPitchClass } from './notes.js';
import {
  SCALES,
  type ScaleNote,
  type ScaleType,
  getScaleKeyIndexes,
  getScaleNotes,
} from './scales.js';
import { TONALITY_STEPS, type Tonality } from './spelling.js';
import {
  type KeySignature,
  type Staff,
  getKeySignature,
  getStaff,
} from './staff.js';

export const VIEWS = ['scale', 'chord', 'key'] as const;

export type View = (typeof VIEWS)[number];

export interface Selection {
  view: View;
  /** Pitch class of the root note, shared by every view: 0 = C … 11 = B. */
  root: number;
  scale: ScaleType;
  chordType: ChordType;
  tonality: Tonality;
  /** Whether the key view shows triads or seventh chords. */
  chordSize: ChordSize;
  /** Position in `Board.keyChords`; clamped if the key has fewer chords. */
  keyChord: number;
  /** Counts as the chord's last inversion if it has fewer. */
  inversion: Inversion;
  /**
   * Octaves to move the notes up (or down, below zero) from middle C, where
   * they start. Counts as the nearest octave that fits on the keyboard.
   */
  octave: number;
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
  /** The selected chord in the chord and key views. */
  chord: Chord | undefined;
  /** The chords of the key, in the key view. */
  keyChords: KeyChord[];
  /** The selected chord of the key, in the key view. */
  keyChord: KeyChord | undefined;
  /** Octaves the notes are moved from middle C: the selected one if it fits. */
  octave: number;
  /** How far the notes can be moved: one octave down, and up while they fit. */
  octaves: { lowest: number; highest: number };
  /** What is pressed, written on a grand staff. */
  staff: Staff;
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
  let keyChords: KeyChord[] = [];
  let keyChord: KeyChord | undefined;
  let rootPitchClass = root;
  let keySignature: KeySignature | undefined;
  if (selection.view === 'chord') {
    chord = getChord(root, selection.chordType);
    tones = chord.notes;
    pressed = invertChord(
      tones.map((note) => root + note.interval),
      selection.inversion,
    );
  } else if (selection.view === 'key') {
    keyChords = getKeyChords(root, selection.tonality, selection.chordSize);
    keySignature = getKeySignature(root, TONALITY_STEPS[selection.tonality]);
    const position = Math.min(
      Math.max(0, selection.keyChord),
      keyChords.length - 1,
    );
    keyChord = keyChords[position];
    chord = keyChord?.chord;
    tones = chord?.notes ?? [];
    const chordRoot = root + (keyChord?.interval ?? 0);
    rootPitchClass = toPitchClass(chordRoot);
    pressed = invertChord(
      tones.map((note) => chordRoot + note.interval),
      selection.inversion,
    );
  } else {
    tones = getScaleNotes(root, selection.scale);
    pressed = getScaleKeyIndexes(root, selection.scale);
    keySignature = getKeySignature(root, SCALES[selection.scale].spelling);
  }

  const octaves = getOctaves(pressed, keyCount);
  const octave = Math.min(
    Math.max(selection.octave, octaves.lowest),
    octaves.highest,
  );
  const atOctave = (moved: number) =>
    pressed.map((index) => index + MIDDLE_C + moved * NOTES_PER_OCTAVE);
  const highest = atOctave(octaves.highest);
  pressed = atOctave(octave);

  const names = new Map(tones.map((note) => [note.pitchClass, note.name]));
  const named = (keys: readonly number[]) =>
    keys
      .filter((index) => index < keyCount)
      .map((key) => ({ key, name: names.get(toPitchClass(key)) ?? '' }));
  const sounding =
    selection.view === 'scale'
      ? tones.map((note) => note.pitchClass)
      : pressed.map(toPitchClass);

  return {
    keys: pressKeys(createKeyboard(keyCount), pressed, {
      names,
      rootPitchClass,
    }),
    pressed: pressed.filter((index) => index < keyCount),
    notes: sounding
      .flatMap((pitchClass) =>
        tones.filter((note) => note.pitchClass === pitchClass),
      )
      .map((note) => ({
        name: note.name,
        degree: note.degree,
        root: note.pitchClass === rootPitchClass,
      })),
    tones,
    chord,
    keyChords,
    keyChord,
    octave,
    octaves,
    staff: getStaff(named(pressed), {
      chord: selection.view !== 'scale',
      keySignature,
      highest: named(highest),
    }),
  };
}

/**
 * How many octaves `pressed`, put at middle C, can move: one down, and up as
 * far as they fit on a keyboard of `keyCount` keys. A keyboard too short for
 * them gets the lowest.
 */
function getOctaves(pressed: readonly number[], keyCount: number) {
  if (pressed.length === 0) return { lowest: 0, highest: 0 };
  const lowestKey = MIDDLE_C + Math.min(...pressed);
  const highestKey = MIDDLE_C + Math.max(...pressed);
  const lowest = Math.max(-1, -Math.floor(lowestKey / NOTES_PER_OCTAVE));
  const highest = Math.floor((keyCount - 1 - highestKey) / NOTES_PER_OCTAVE);
  return { lowest, highest: Math.max(lowest, highest) };
}
