import { NOTES_PER_OCTAVE, toPitchClass } from './notes.js';
import { type ScaleNote, type ScaleType, getScaleNotes } from './scales.js';

interface TriadSpec {
  suffix: string;
  /** Semitones above the chord root. */
  intervals: readonly [number, number, number];
}

export const TRIADS = {
  major: { suffix: '', intervals: [0, 4, 7] },
  minor: { suffix: 'm', intervals: [0, 3, 7] },
  diminished: { suffix: 'dim', intervals: [0, 3, 6] },
  augmented: { suffix: 'aug', intervals: [0, 4, 8] },
} as const satisfies Record<string, TriadSpec>;

export type TriadQuality = keyof typeof TRIADS;

const TRIAD_QUALITIES = Object.keys(TRIADS) as TriadQuality[];

export interface Chord {
  /** ASCII name such as `'Ebm'`; see `formatNoteName`. */
  name: string;
  root: ScaleNote;
  quality: TriadQuality;
  /** Keys of the chord in root position, lowest first. */
  keyIndexes: number[];
}

export const INVERSIONS = ['root', 'first', 'second'] as const;

export type Inversion = (typeof INVERSIONS)[number];

/**
 * The triads that can be built on each note of the scale using only notes of
 * that scale, placed on the keyboard going up from `rootIndex`.
 */
export function getScaleChords(rootIndex: number, type: ScaleType): Chord[] {
  const notes = getScaleNotes(rootIndex, type);
  const inScale = new Set(notes.map((note) => note.pitchClass));

  return notes.flatMap((note) => {
    const quality = TRIAD_QUALITIES.find((candidate) =>
      TRIADS[candidate].intervals.every((interval) =>
        inScale.has(toPitchClass(note.pitchClass + interval)),
      ),
    );
    if (!quality) return [];

    const { suffix, intervals } = TRIADS[quality];
    return [
      {
        name: note.name + suffix,
        root: note,
        quality,
        keyIndexes: intervals.map(
          (interval) => rootIndex + note.interval + interval,
        ),
      },
    ];
  });
}

/** Moves the lowest one (first) or two (second) notes up an octave. */
export function invertTriad(
  keyIndexes: readonly number[],
  inversion: Inversion,
): number[] {
  const raised = INVERSIONS.indexOf(inversion);
  return keyIndexes
    .map((key, position) => (position < raised ? key + NOTES_PER_OCTAVE : key))
    .sort((a, b) => a - b);
}
