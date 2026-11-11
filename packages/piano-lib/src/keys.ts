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

interface DegreeSpec {
  function: HarmonicFunction;
  description: string;
  /** Common next chords, by position in the key's chord list. */
  next: readonly number[];
}

const DEGREES: Record<Tonality, readonly DegreeSpec[]> = {
  major: [
    {
      function: 'tonic',
      description: 'Home. Most pieces start here and end here.',
      next: [3, 4, 5],
    },
    {
      function: 'subdominant',
      description: 'Leads on to V. ii–V–I is the backbone of jazz harmony.',
      next: [4, 6],
    },
    {
      function: 'tonic',
      description: 'Shares two notes with I: a softer stand-in for home.',
      next: [5, 3],
    },
    {
      function: 'subdominant',
      description:
        'Moves away from home without tension. IV–I is the "amen" ending.',
      next: [4, 0, 1],
    },
    {
      function: 'dominant',
      description:
        'Tension that wants to resolve to I. V–I is the strongest ending there is.',
      next: [0, 5],
    },
    {
      function: 'tonic',
      description:
        'The relative minor. It shares two notes with I and is the third chord of I–V–vi–IV.',
      next: [1, 3],
    },
    {
      function: 'dominant',
      description:
        'Holds the leading tone, so it pulls to I like V does, only more tensely.',
      next: [0],
    },
  ],
  minor: [
    {
      function: 'tonic',
      description: 'Home, in minor. Most pieces start here and end here.',
      next: [3, 5, 7],
    },
    {
      function: 'subdominant',
      description: 'Diminished and tense. It usually moves on to V.',
      next: [7],
    },
    {
      function: 'tonic',
      description: 'The relative major: a minor key often visits it.',
      next: [5, 3],
    },
    {
      function: 'subdominant',
      description: 'Moves away from home. iv–i gives a dark, soft ending.',
      next: [7, 0],
    },
    {
      function: 'dominant',
      description:
        'Built from the natural minor scale it has no leading tone, so it pulls home only weakly. Compare it with the borrowed V.',
      next: [0, 5],
    },
    {
      function: 'subdominant',
      description:
        'Often heads to V or iv. i–VI–VII–i is a common pop and rock move.',
      next: [3, 1, 7],
    },
    {
      function: 'subtonic',
      description:
        'A whole step below the tonic. Often leads to III, or straight back to i.',
      next: [2, 0],
    },
  ],
};

/** The degrees of harmonic minor that minor keys borrow: V and vii°. */
const BORROWED: readonly (DegreeSpec & { degree: number })[] = [
  {
    degree: 4,
    function: 'dominant',
    description:
      'Borrowed from harmonic minor. Its 3rd is the leading tone, a half step below the tonic, so it pulls home strongly. Most minor-key music uses this V rather than v.',
    next: [0, 5],
  },
  {
    degree: 6,
    function: 'dominant',
    description:
      'Borrowed from harmonic minor. Like V it holds the leading tone, and it can stand in for V.',
    next: [0],
  },
];

const HARMONIC_MINOR_STEPS = [2, 1, 2, 2, 1, 3, 1] as const;

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
  /** The chord's role in this key. */
  description: string;
  /** Chords that commonly follow, by position in the key's chord list. */
  next: number[];
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
  spec: DegreeSpec,
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
      function: spec.function,
      borrowed,
      interval: rootInterval,
      description: spec.description,
      next: [...spec.next],
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
  const own = DEGREES[tonality].flatMap((spec, degree) =>
    stackChord(scale, degree, size, spec, false),
  );
  if (tonality === 'major') return own;

  const harmonic = spellSevenNotes(
    pitchClass,
    rootLetter,
    HARMONIC_MINOR_STEPS,
  );
  const borrowed = BORROWED.flatMap((spec) =>
    stackChord(harmonic, spec.degree, size, spec, true),
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
