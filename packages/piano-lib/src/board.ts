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
  type ProgressionChord,
  type ProgressionStep,
  type VoicedProgression,
  voiceProgression,
} from './progression.js';
import {
  type ScaleNote,
  type ScaleType,
  getScaleKeyIndexes,
  getScaleNotes,
} from './scales.js';

export const MODES = ['scale', 'chord', 'progression'] as const;

export type Mode = (typeof MODES)[number];

export interface Selection {
  mode: Mode;
  /** Pitch class of the root of the scale: 0 = C … 11 = B. */
  root: number;
  scale: ScaleType;
  /** Position in `Board.chords`; clamped if the scale has fewer chords. */
  chordIndex: number;
  inversion: Inversion;
  /** The chords entered in progression mode, in playing order. */
  progression: ProgressionChord[];
  /** Position in `progression`; clamped if there are fewer chords. */
  step: number;
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
  /** The progression, voiced for the least left-hand movement. */
  progression: VoicedProgression;
  /** The selected step of the progression, whichever mode is active. */
  step: ProgressionStep | undefined;
  /** What is pressed, lowest first, without the repeated octave of a scale. */
  notes: BoardNote[];
}

const clamp = (index: number, length: number) =>
  Math.min(Math.max(0, index), length - 1);

/** What the selected mode presses, how it names the keys and which is root. */
function getPressed(
  selection: Selection,
  root: number,
  scaleNames: ReadonlyMap<number, string>,
  chord: Chord | undefined,
  step: ProgressionStep | undefined,
): { pressed: number[]; names: ReadonlyMap<number, string>; root?: number } {
  switch (selection.mode) {
    case 'scale':
      return {
        pressed: getScaleKeyIndexes(root, selection.scale),
        names: scaleNames,
        root,
      };
    case 'chord':
      return {
        pressed: invertTriad(chord?.keyIndexes ?? [], selection.inversion),
        names: scaleNames,
        root: chord?.root.pitchClass,
      };
    case 'progression':
      return {
        pressed: step?.keyIndexes ?? [],
        names: new Map(
          step?.notes.map((note) => [note.pitchClass, note.name]) ?? [],
        ),
        root: step?.chord.root,
      };
  }
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
  const chord = chords[clamp(selection.chordIndex, chords.length)];

  const progression = voiceProgression(selection.progression);
  const step =
    progression.steps[clamp(selection.step, progression.steps.length)];

  const pressing = getPressed(selection, root, names, chord, step);
  const sounding =
    selection.mode === 'scale'
      ? scaleNotes.map((note) => note.pitchClass)
      : pressing.pressed.map(toPitchClass);

  return {
    keys: pressKeys(createKeyboard(keyCount), pressing.pressed, {
      names: pressing.names,
      rootPitchClass: pressing.root,
    }),
    scaleNotes,
    chords,
    chord,
    progression,
    step,
    notes: sounding.map((pitchClass) => ({
      name: pressing.names.get(pitchClass) ?? '',
      root: pitchClass === pressing.root,
    })),
  };
}
