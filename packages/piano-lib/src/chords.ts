import { NOTES_PER_OCTAVE, toPitchClass } from './notes.js';
import type { ScaleNote } from './scales.js';
import {
  TONALITY_STEPS,
  type Tonality,
  degreeName,
  pickRootLetter,
  spellNotes,
  spellRoot,
} from './spelling.js';

export const CHORD_SIZES = {
  triad: 'Triads',
  seventh: 'Seventh chords',
} as const;

export type ChordSize = keyof typeof CHORD_SIZES;

interface ChordTypeSpec {
  name: string;
  /** Added to the root's name: `'m7'` makes `'Dm7'`. */
  suffix: string;
  size: ChordSize;
  /** Semitones above the root, lowest first. */
  intervals: readonly number[];
  /** How many letters above the root's letter each note is spelled. */
  letterSteps: readonly number[];
  /**
   * Whether a black-key root is spelled as in a major or a minor key: D♭7,
   * but C♯m7.
   */
  tonality: Tonality;
  /** What the chord sounds like and how it is built. */
  description: string;
  /** Why no major or minor key has this chord, when none does. */
  outsideKeys?: string;
}

const THIRDS = [0, 2, 4] as const;
const STACKED_THIRDS = [0, 2, 4, 6] as const;

export const CHORD_TYPES = {
  major: {
    name: 'Major',
    suffix: '',
    size: 'triad',
    intervals: [0, 4, 7],
    letterSteps: THIRDS,
    tonality: 'major',
    description: 'A major third with a minor third on top. Bright and stable.',
  },
  minor: {
    name: 'Minor',
    suffix: 'm',
    size: 'triad',
    intervals: [0, 3, 7],
    letterSteps: THIRDS,
    tonality: 'minor',
    description:
      'A minor third with a major third on top. Darker, but still at rest.',
  },
  diminished: {
    name: 'Diminished',
    suffix: 'dim',
    size: 'triad',
    intervals: [0, 3, 6],
    letterSteps: THIRDS,
    tonality: 'minor',
    description:
      'Two minor thirds stacked. Tense and unstable: it wants to move on.',
  },
  augmented: {
    name: 'Augmented',
    suffix: 'aug',
    size: 'triad',
    intervals: [0, 4, 8],
    letterSteps: THIRDS,
    tonality: 'major',
    description:
      'Two major thirds stacked. Unresolved and dreamy; it usually leads on by moving one note a half step.',
    outsideKeys:
      'It is not one of the chords of a major or minor key. It appears as III+ in harmonic minor.',
  },
  sus2: {
    name: 'Sus2',
    suffix: 'sus2',
    size: 'triad',
    intervals: [0, 2, 7],
    letterSteps: [0, 1, 4],
    tonality: 'major',
    description:
      'The 3rd is replaced by the 2nd, so it is neither major nor minor. Open and airy.',
    outsideKeys:
      'Sus chords are not built from a key. With no 3rd they fit in many keys, as a color on top of other chords.',
  },
  sus4: {
    name: 'Sus4',
    suffix: 'sus4',
    size: 'triad',
    intervals: [0, 5, 7],
    letterSteps: [0, 3, 4],
    tonality: 'major',
    description:
      'The 3rd is replaced by the 4th, which wants to fall back down to the 3rd: Csus4 to C.',
    outsideKeys:
      'Sus chords are not built from a key. With no 3rd they fit in many keys, as a color on top of other chords.',
  },
  major7: {
    name: 'Major 7th',
    suffix: 'maj7',
    size: 'seventh',
    intervals: [0, 4, 7, 11],
    letterSteps: STACKED_THIRDS,
    tonality: 'major',
    description:
      'A major triad with a major 7th. Soft and jazzy; the I and IV chords of a major key.',
  },
  dominant7: {
    name: 'Dominant 7th',
    suffix: '7',
    size: 'seventh',
    intervals: [0, 4, 7, 10],
    letterSteps: STACKED_THIRDS,
    tonality: 'major',
    description:
      'A major triad with a minor 7th. The strongest pull in harmony: it wants to resolve a fifth down, G7 to C.',
  },
  minor7: {
    name: 'Minor 7th',
    suffix: 'm7',
    size: 'seventh',
    intervals: [0, 3, 7, 10],
    letterSteps: STACKED_THIRDS,
    tonality: 'minor',
    description: 'A minor triad with a minor 7th. Mellow; the ii in ii–V–I.',
  },
  halfDiminished7: {
    name: 'Half-diminished',
    suffix: 'm7b5',
    size: 'seventh',
    intervals: [0, 3, 6, 10],
    letterSteps: STACKED_THIRDS,
    tonality: 'minor',
    description:
      'A diminished triad with a minor 7th. The vii chord of a major key and the ii chord of a minor key.',
  },
  diminished7: {
    name: 'Diminished 7th',
    suffix: 'dim7',
    size: 'seventh',
    intervals: [0, 3, 6, 9],
    letterSteps: STACKED_THIRDS,
    tonality: 'minor',
    description:
      'Every note a minor third apart, so it sounds the same from any of its notes. Minor keys borrow it as vii°7, where it pulls hard to the tonic.',
  },
} as const satisfies Record<string, ChordTypeSpec>;

export type ChordType = keyof typeof CHORD_TYPES;

export const CHORD_TYPE_IDS = Object.keys(CHORD_TYPES) as ChordType[];

/** A note of a chord; its interval and degree are counted from the chord's root. */
export type ChordNote = ScaleNote;

export interface Chord {
  /** ASCII name such as `'Bbm7'`; see `formatNoteName`. */
  name: string;
  type: ChordType;
  /** The notes in root position, lowest first. */
  notes: ChordNote[];
}

/** The chord of `type` on `root`, spelled the way its key would spell it. */
export function getChord(root: number, type: ChordType): Chord {
  const spec: ChordTypeSpec = CHORD_TYPES[type];
  const pitchClass = toPitchClass(root);
  const rootLetter = pickRootLetter(pitchClass, TONALITY_STEPS[spec.tonality]);
  const notes = spellNotes(
    pitchClass,
    rootLetter,
    spec.intervals,
    spec.letterSteps,
  ).map((note) => ({
    pitchClass: note.pitchClass,
    interval: note.interval,
    name: note.name,
    degree: degreeName(note.interval, note.letterStep),
  }));
  const rootName = spellRoot(pitchClass, TONALITY_STEPS[spec.tonality]);
  return { name: `${rootName}${spec.suffix}`, type, notes };
}

/** What each of the twelve keys is called when it is the root of `type`. */
export function getChordRootNames(type: ChordType): string[] {
  return Array.from({ length: NOTES_PER_OCTAVE }, (_, root) =>
    spellRoot(root, TONALITY_STEPS[CHORD_TYPES[type].tonality]),
  );
}

/** The chord type whose intervals these are, if any. */
export function findChordType(
  intervals: readonly number[],
): ChordType | undefined {
  return CHORD_TYPE_IDS.find((type) => {
    const known: readonly number[] = CHORD_TYPES[type].intervals;
    return (
      known.length === intervals.length &&
      known.every((interval, position) => interval === intervals[position])
    );
  });
}

export const INVERSIONS = ['root', 'first', 'second', 'third'] as const;

export type Inversion = (typeof INVERSIONS)[number];

/** The inversions a chord with this many notes has: one fewer than its notes. */
export function getInversions(noteCount: number): Inversion[] {
  return INVERSIONS.slice(0, Math.max(1, noteCount));
}

/**
 * Moves the lowest one (first), two (second) or three (third) notes up an
 * octave. An inversion the chord does not have counts as its last one.
 */
export function invertChord(
  keyIndexes: readonly number[],
  inversion: Inversion,
): number[] {
  const raised = Math.min(
    INVERSIONS.indexOf(inversion),
    Math.max(0, keyIndexes.length - 1),
  );
  return keyIndexes
    .map((key, position) => (position < raised ? key + NOTES_PER_OCTAVE : key))
    .sort((a, b) => a - b);
}
