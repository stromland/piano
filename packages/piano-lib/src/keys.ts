import {
  CHORD_TYPES,
  type Chord,
  type ChordSize,
  type ChordType,
  findChordType,
} from './chords.js';
import { NOTES_PER_OCTAVE, toPitchClass } from './notes.js';
import {
  type SpelledNote,
  TONALITY_STEPS,
  type Tonality,
  degreeName,
  pickRootLetter,
  spellRoot,
  spellSevenNotes,
} from './spelling.js';

export const TONALITIES = ['major', 'minor'] as const satisfies Tonality[];

export const HARMONIC_FUNCTIONS = {
  tonic: 'Tonic',
  subdominant: 'Subdominant',
  dominant: 'Dominant',
  subtonic: 'Subtonic',
} as const;

export type HarmonicFunction = keyof typeof HARMONIC_FUNCTIONS;

const FUNCTIONS: Record<Tonality, readonly HarmonicFunction[]> = {
  major: [
    'tonic',
    'subdominant',
    'tonic',
    'subdominant',
    'dominant',
    'tonic',
    'dominant',
  ],
  minor: [
    'tonic',
    'subdominant',
    'tonic',
    'subdominant',
    'dominant',
    'subdominant',
    'subtonic',
  ],
};

const HARMONIC_MINOR_STEPS = [2, 1, 2, 2, 1, 3, 1] as const;

/** The degrees of harmonic minor that minor keys borrow: V and vii°. */
const BORROWED_DEGREES = [4, 6] as const;

const CHORD_LETTER_STEPS: Record<ChordSize, readonly number[]> = {
  triad: [0, 2, 4],
  seventh: [0, 2, 4, 6],
};

export interface KeyChord {
  chord: Chord;
  /** Roman numeral such as `'V7'`, `'ii'` or `'viiø7'`. */
  numeral: string;
  function: HarmonicFunction;
  /** Taken from harmonic minor rather than built from the key's own scale. */
  borrowed: boolean;
  /** Semitones from the tonic up to the chord's root. */
  interval: number;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

const NUMERAL_SUFFIXES: Record<ChordType, string> = {
  major: '',
  minor: '',
  diminished: '°',
  augmented: '+',
  sus2: 'sus2',
  sus4: 'sus4',
  major7: 'maj7',
  dominant7: '7',
  minor7: '7',
  halfDiminished7: 'ø7',
  diminished7: '°7',
};

/**
 * `romanNumeral(4, 'dominant7')` → `'V7'`: upper case when the chord has a
 * major third, lower case when it has a minor one.
 */
export function romanNumeral(degree: number, type: ChordType): string {
  const roman = ROMAN[degree % ROMAN.length] ?? '';
  const intervals: readonly number[] = CHORD_TYPES[type].intervals;
  const majorThird = intervals.includes(4);
  return `${majorThird ? roman : roman.toLowerCase()}${NUMERAL_SUFFIXES[type]}`;
}

/** The name of a key, such as `'Eb major'` or `'C# minor'`. */
export function getKeyName(tonic: number, tonality: Tonality): string {
  return `${spellRoot(tonic, TONALITY_STEPS[tonality])} ${tonality}`;
}

/** Builds the chord on `degree` from the seven notes of a scale. */
function stackChord(
  scale: SpelledNote[],
  degree: number,
  size: ChordSize,
  harmonicFunction: HarmonicFunction,
  borrowed: boolean,
): KeyChord[] {
  // The scale from `degree`, going on into the next octave.
  const rotated = [
    ...scale.slice(degree),
    ...scale
      .slice(0, degree)
      .map((note) => ({ ...note, interval: note.interval + NOTES_PER_OCTAVE })),
  ];
  const letterSteps = CHORD_LETTER_STEPS[size];
  const picked = rotated
    .map((note, step) => ({ ...note, step }))
    .filter(({ step }) => letterSteps.includes(step));
  const rootInterval = Math.min(...picked.map((note) => note.interval));
  const type = findChordType(
    picked.map((note) => note.interval - rootInterval),
  );
  if (!type) return [];

  const notes = picked.map((note) => ({
    pitchClass: note.pitchClass,
    interval: note.interval - rootInterval,
    name: note.name,
    degree: degreeName(note.interval - rootInterval, note.step),
  }));
  return [
    {
      chord: {
        name: `${notes[0]?.name ?? ''}${CHORD_TYPES[type].suffix}`,
        type,
        notes,
      },
      numeral: romanNumeral(degree, type),
      function: harmonicFunction,
      borrowed,
      interval: rootInterval,
    },
  ];
}

/**
 * The chords of a key, on each degree of its scale. A minor key also gets
 * the V and vii° of harmonic minor, which most minor-key music uses.
 */
export function getKeyChords(
  tonic: number,
  tonality: Tonality,
  size: ChordSize,
): KeyChord[] {
  const pitchClass = toPitchClass(tonic);
  const steps = TONALITY_STEPS[tonality];
  const rootLetter = pickRootLetter(pitchClass, steps);
  const scale = spellSevenNotes(pitchClass, rootLetter, steps);
  const own = FUNCTIONS[tonality].flatMap((harmonicFunction, degree) =>
    stackChord(scale, degree, size, harmonicFunction, false),
  );
  if (tonality === 'major') return own;

  const harmonic = spellSevenNotes(
    pitchClass,
    rootLetter,
    HARMONIC_MINOR_STEPS,
  );
  const borrowed = BORROWED_DEGREES.flatMap((degree) =>
    stackChord(harmonic, degree, size, 'dominant', true),
  );
  return [...own, ...borrowed];
}

export interface KeyWithChord {
  tonic: number;
  tonality: Tonality;
  /** The chord's roman numeral in that key. */
  numeral: string;
}

/** Every key whose chords include `type` on `root`, major keys first. */
export function findKeysWithChord(
  root: number,
  type: ChordType,
): KeyWithChord[] {
  const pitchClass = toPitchClass(root);
  const size = CHORD_TYPES[type].size;
  return TONALITIES.flatMap((tonality) =>
    Array.from({ length: NOTES_PER_OCTAVE }, (_, tonic) => tonic).flatMap(
      (tonic) =>
        getKeyChords(tonic, tonality, size)
          .filter(
            (keyChord) =>
              keyChord.chord.type === type &&
              toPitchClass(tonic + keyChord.interval) === pitchClass,
          )
          .map((keyChord) => ({ tonic, tonality, numeral: keyChord.numeral })),
    ),
  );
}
