import { NOTES_PER_OCTAVE, toPitchClass } from './notes.js';
import {
  MAJOR_STEPS,
  MINOR_STEPS,
  degreeName,
  pickRootLetter,
  spellRoot,
  spellSevenNotes,
} from './spelling.js';

export const SCALE_GROUPS = {
  majorAndMinor: 'Major and minor',
  modes: 'Modes',
  pentatonic: 'Pentatonic',
} as const;

export type ScaleGroup = keyof typeof SCALE_GROUPS;

interface ScaleSpec {
  name: string;
  group: ScaleGroup;
  /** Semitone steps of the seven-note scale the note names are taken from. */
  steps: readonly number[];
  /** Which of those seven degrees the scale actually contains. */
  degrees: readonly number[];
  /**
   * Steps of the scale whose key signature decides whether a black-key root
   * is spelled as a sharp or a flat.
   */
  spelling: readonly number[];
}

const ALL_DEGREES = [0, 1, 2, 3, 4, 5, 6] as const;

/** The seven-note scale that starts on degree `degree` of the major scale. */
function modeSteps(degree: number): number[] {
  return [...MAJOR_STEPS.slice(degree), ...MAJOR_STEPS.slice(0, degree)];
}

function mode(name: string, degree: number): ScaleSpec {
  const steps = modeSteps(degree);
  return {
    name,
    group: 'modes',
    steps,
    degrees: ALL_DEGREES,
    spelling: steps,
  };
}

export const SCALES = {
  major: {
    name: 'Major',
    group: 'majorAndMinor',
    steps: MAJOR_STEPS,
    degrees: ALL_DEGREES,
    spelling: MAJOR_STEPS,
  },
  minor: {
    name: 'Minor',
    group: 'majorAndMinor',
    steps: MINOR_STEPS,
    degrees: ALL_DEGREES,
    spelling: MINOR_STEPS,
  },
  harmonicMinor: {
    name: 'Harmonic minor',
    group: 'majorAndMinor',
    steps: [2, 1, 2, 2, 1, 3, 1],
    degrees: ALL_DEGREES,
    spelling: MINOR_STEPS,
  },
  melodicMinor: {
    name: 'Melodic minor',
    group: 'majorAndMinor',
    steps: [2, 1, 2, 2, 2, 2, 1],
    degrees: ALL_DEGREES,
    spelling: MINOR_STEPS,
  },
  dorian: mode('Dorian', 1),
  phrygian: mode('Phrygian', 2),
  lydian: mode('Lydian', 3),
  mixolydian: mode('Mixolydian', 4),
  locrian: mode('Locrian', 6),
  pentatonicMajor: {
    name: 'Major pentatonic',
    group: 'pentatonic',
    steps: MAJOR_STEPS,
    degrees: [0, 1, 2, 4, 5],
    spelling: MAJOR_STEPS,
  },
  pentatonicMinor: {
    name: 'Minor pentatonic',
    group: 'pentatonic',
    steps: MINOR_STEPS,
    degrees: [0, 2, 3, 4, 6],
    spelling: MINOR_STEPS,
  },
} as const satisfies Record<string, ScaleSpec>;

export type ScaleType = keyof typeof SCALES;

export const SCALE_TYPES = Object.keys(SCALES) as ScaleType[];

export interface ScaleNote {
  /** 0 = C … 11 = B. */
  pitchClass: number;
  /** Semitones above the root of the scale. */
  interval: number;
  /** ASCII spelling such as `'Eb'` or `'F#'`; see `formatNoteName`. */
  name: string;
  /** Degree compared with the major scale, such as `'b3'`; see `formatNoteName`. */
  degree: string;
}

/** The notes of a scale, from the root upwards, correctly spelled. */
export function getScaleNotes(root: number, type: ScaleType): ScaleNote[] {
  const scale: ScaleSpec = SCALES[type];
  const pitchClass = toPitchClass(root);
  const rootLetter = pickRootLetter(pitchClass, scale.spelling);
  const notes = spellSevenNotes(pitchClass, rootLetter, scale.steps);
  return notes
    .filter((_, degree) => scale.degrees.includes(degree))
    .map((note) => ({
      pitchClass: note.pitchClass,
      interval: note.interval,
      name: note.name,
      degree: degreeName(note.interval, note.letterStep),
    }));
}

/** What each of the twelve keys is called when it is the root of `type`. */
export function getRootNames(type: ScaleType): string[] {
  return Array.from({ length: NOTES_PER_OCTAVE }, (_, root) =>
    spellRoot(root, SCALES[type].spelling),
  );
}

/**
 * Key indexes of one octave of the scale starting at `rootIndex`, ending on
 * the root an octave up.
 */
export function getScaleKeyIndexes(
  rootIndex: number,
  type: ScaleType,
): number[] {
  const intervals = getScaleNotes(rootIndex, type).map((note) => note.interval);
  return [...intervals, NOTES_PER_OCTAVE].map(
    (interval) => rootIndex + interval,
  );
}
