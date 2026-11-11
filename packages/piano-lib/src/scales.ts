import { NOTES_PER_OCTAVE, toPitchClass } from './notes.js';
import {
  MAJOR_STEPS,
  MINOR_STEPS,
  type Tonality,
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
  /** What the scale sounds like and how it differs from its neighbors. */
  description: string;
  /** For a mode: the degree of the major scale it starts on. */
  modeDegree?: number;
}

const ALL_DEGREES = [0, 1, 2, 3, 4, 5, 6] as const;

/** The seven-note scale that starts on degree `degree` of the major scale. */
function modeSteps(degree: number): number[] {
  return [...MAJOR_STEPS.slice(degree), ...MAJOR_STEPS.slice(0, degree)];
}

function mode(name: string, degree: number, description: string): ScaleSpec {
  const steps = modeSteps(degree);
  return {
    name,
    group: 'modes',
    steps,
    degrees: ALL_DEGREES,
    spelling: steps,
    description,
    modeDegree: degree,
  };
}

export const SCALES = {
  major: {
    name: 'Major',
    group: 'majorAndMinor',
    steps: MAJOR_STEPS,
    degrees: ALL_DEGREES,
    spelling: MAJOR_STEPS,
    description:
      'The bright, stable starting point of Western music, built from whole and half steps in the pattern W W H W W W H.',
  },
  minor: {
    name: 'Minor',
    group: 'majorAndMinor',
    steps: MINOR_STEPS,
    degrees: ALL_DEGREES,
    spelling: MINOR_STEPS,
    description:
      'Natural minor: the darker sibling of major, with a lowered 3rd, 6th and 7th. Every major key has a relative minor with the same notes, starting on its 6th note.',
  },
  harmonicMinor: {
    name: 'Harmonic minor',
    group: 'majorAndMinor',
    steps: [2, 1, 2, 2, 1, 3, 1],
    degrees: ALL_DEGREES,
    spelling: MINOR_STEPS,
    description:
      'Minor with a raised 7th. That note sits a half step below the root and pulls up to it, which is why minor keys use a major V chord.',
  },
  melodicMinor: {
    name: 'Melodic minor',
    group: 'majorAndMinor',
    steps: [2, 1, 2, 2, 2, 2, 1],
    degrees: ALL_DEGREES,
    spelling: MINOR_STEPS,
    description:
      'Minor with a raised 6th and 7th, smoothing out the big step in harmonic minor. Classical music uses it going up; jazz uses it both ways.',
  },
  dorian: mode(
    'Dorian',
    1,
    'Minor with a raised 6th: a brighter, cooler minor. Heard in "So What" and "Scarborough Fair".',
  ),
  phrygian: mode(
    'Phrygian',
    2,
    'Minor with a lowered 2nd. The half step just above the root gives it a Spanish, flamenco color.',
  ),
  lydian: mode(
    'Lydian',
    3,
    'Major with a raised 4th: dreamy and floating. A favorite of film music.',
  ),
  mixolydian: mode(
    'Mixolydian',
    4,
    'Major with a lowered 7th: bluesy and relaxed. Heard in "Norwegian Wood" and a lot of rock and folk.',
  ),
  locrian: mode(
    'Locrian',
    6,
    'The darkest mode. Its root chord is diminished, so it never quite feels like home, and it is rarely used as a key.',
  ),
  pentatonicMajor: {
    name: 'Major pentatonic',
    group: 'pentatonic',
    steps: MAJOR_STEPS,
    degrees: [0, 1, 2, 4, 5],
    spelling: MAJOR_STEPS,
    description:
      'Major without its 4th and 7th: five notes and no half steps, so nothing clashes. Folk, country and pop melodies live here.',
  },
  pentatonicMinor: {
    name: 'Minor pentatonic',
    group: 'pentatonic',
    steps: MINOR_STEPS,
    degrees: [0, 2, 3, 4, 6],
    spelling: MINOR_STEPS,
    description:
      'Minor without its 2nd and 6th. The backbone of blues and rock solos.',
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
 * The semitones between neighboring notes of the scale, up to the root an
 * octave higher: 2 = whole step, 1 = half step.
 */
export function getScaleSteps(type: ScaleType): number[] {
  const [, ...above] = getScaleNotes(0, type).map((note) => note.interval);
  return [...above, NOTES_PER_OCTAVE].reduce(
    ({ steps, previous }, interval) => ({
      steps: [...steps, interval - previous],
      previous: interval,
    }),
    { steps: [] as number[], previous: 0 },
  ).steps;
}

export interface RelatedKey {
  tonic: number;
  tonality: Tonality;
  /** The degree of that key's scale this scale starts on: 0 = its tonic. */
  startsOn: number;
}

/**
 * The major or minor key with the same notes as this scale, if there is one:
 * the relative minor of a major scale, the relative major of a minor scale,
 * and the major key a mode is taken from.
 */
export function getRelatedKey(
  root: number,
  type: ScaleType,
): RelatedKey | undefined {
  const scale: ScaleSpec = SCALES[type];
  const pitchClass = toPitchClass(root);
  if (type === 'major') {
    return {
      tonic: toPitchClass(pitchClass + 9),
      tonality: 'minor',
      startsOn: 2,
    };
  }
  if (type === 'minor') {
    return {
      tonic: toPitchClass(pitchClass + 3),
      tonality: 'major',
      startsOn: 5,
    };
  }
  if (scale.modeDegree === undefined) return undefined;
  const offset = MAJOR_STEPS.slice(0, scale.modeDegree).reduce(
    (sum, step) => sum + step,
    0,
  );
  return {
    tonic: toPitchClass(pitchClass - offset),
    tonality: 'major',
    startsOn: scale.modeDegree,
  };
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
