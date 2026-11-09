import { CHORD_QUALITIES, type ChordQuality } from './chords.js';
import {
  NOTES_PER_OCTAVE,
  accidentalFor,
  spellNote,
  toPitchClass,
} from './notes.js';

/** A chord of a progression, independent of any scale. */
export interface ProgressionChord {
  /** Pitch class of the root: 0 = C … 11 = B. */
  root: number;
  quality: ChordQuality;
}

export interface SpelledNote {
  pitchClass: number;
  /** ASCII spelling such as `'Eb'`; see `formatNoteName`. */
  name: string;
}

export interface SpelledChord {
  /** ASCII name such as `'Abm7b5'`; see `formatNoteName`. */
  name: string;
  /** The chord tones from the root up: root, third, fifth (and seventh). */
  notes: SpelledNote[];
}

/** The keys a voicing may use, both ends included. */
export interface KeyRange {
  lowest: number;
  highest: number;
}

/** Where the left hand plays: from the C of the second octave to the G above. */
export const LEFT_HAND_RANGE: KeyRange = { lowest: 12, highest: 31 };

/** A close voicing: every chord tone once, within one octave. */
export interface Voicing {
  /** 0 = root position, 1 = first inversion … 3 = third inversion. */
  inversion: number;
  /** Lowest first. */
  keyIndexes: number[];
}

export interface ProgressionStep extends Voicing {
  chord: ProgressionChord;
  name: string;
  notes: SpelledNote[];
  /** Semitones the fingers travel from the previous step; 0 for the first. */
  movement: number;
}

export interface VoicedProgression {
  steps: ProgressionStep[];
  /** Semitones the fingers travel through the whole progression. */
  total: number;
}

/**
 * The letter each root is spelled with. Roots have fixed names, since a
 * progression has no key to take them from: the usual flats, and F♯.
 */
const ROOT_LETTERS = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6] as const;

/** C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B. */
export const PROGRESSION_ROOT_NAMES = ROOT_LETTERS.map((letter, root) =>
  spellNote(letter, accidentalFor(root, letter)),
);

/** Names the chord and spells its notes from its root: Ab → Ab C Eb. */
export function spellChord({ root, quality }: ProgressionChord): SpelledChord {
  const pitchClass = toPitchClass(root);
  const rootLetter = ROOT_LETTERS[pitchClass] ?? 0;
  const { suffix, intervals } = CHORD_QUALITIES[quality];

  const notes = intervals.map((interval, degree) => {
    // Chord tones are stacked thirds, so each one skips a letter.
    const letter = rootLetter + degree * 2;
    const tone = toPitchClass(pitchClass + interval);
    return {
      pitchClass: tone,
      name: spellNote(letter, accidentalFor(tone, letter)),
    };
  });

  return { name: (notes[0]?.name ?? '') + suffix, notes };
}

/** Every close voicing of the chord, in every inversion, that fits `range`. */
export function getVoicings(
  { root, quality }: ProgressionChord,
  range: KeyRange = LEFT_HAND_RANGE,
): Voicing[] {
  const intervals: readonly number[] = CHORD_QUALITIES[quality].intervals;

  return intervals.flatMap((_, inversion) => {
    const shape = [
      ...intervals.slice(inversion),
      ...intervals.slice(0, inversion).map((it) => it + NOTES_PER_OCTAVE),
    ];
    const bottom = shape[0] ?? 0;
    const span = (shape.at(-1) ?? 0) - bottom;
    const firstLowest =
      range.lowest + toPitchClass(root + bottom - range.lowest);

    const voicings: Voicing[] = [];
    for (
      let lowest = firstLowest;
      lowest + span <= range.highest;
      lowest += NOTES_PER_OCTAVE
    ) {
      voicings.push({
        inversion,
        keyIndexes: shape.map((interval) => lowest + interval - bottom),
      });
    }
    return voicings;
  });
}

/**
 * Semitones the fingers travel from one voicing to the next. Every note of
 * the larger chord is paired with one note of the smaller, every note of the
 * smaller gets at least one partner, and the pairing with the least travel
 * wins. With as many notes in both, each finger moves to one key; going from
 * three notes to four, one finger's note splits in two, and back it merges.
 */
export function getMovement(
  from: readonly number[],
  to: readonly number[],
): number {
  const [larger, smaller] = from.length >= to.length ? [from, to] : [to, from];
  if (smaller.length === 0) return 0;

  let best = Infinity;
  // Counts through every way of giving each note of `larger` a partner.
  const partners = larger.map(() => 0);
  for (;;) {
    const used = new Set(partners);
    if (used.size === smaller.length) {
      const travel = larger.reduce(
        (sum, key, i) => sum + Math.abs(key - (smaller[partners[i] ?? 0] ?? 0)),
        0,
      );
      best = Math.min(best, travel);
    }

    let digit = 0;
    while (digit < partners.length && partners[digit] === smaller.length - 1) {
      partners[digit] = 0;
      digit++;
    }
    if (digit === partners.length) return best;
    partners[digit] = (partners[digit] ?? 0) + 1;
  }
}

interface Candidate {
  voicing: Voicing;
  /** Total movement of the best way to reach this voicing. */
  movement: number;
  /** Tie-breaker: how far the voicings so far sit from the middle of the range. */
  offCenter: number;
  previous: Candidate | undefined;
}

// Distances from the middle are fractions, so compare them with some slack.
const EPSILON = 1e-9;

function isBetter(a: Candidate, b: Candidate | undefined): boolean {
  if (!b) return true;
  if (a.movement !== b.movement) return a.movement < b.movement;
  return a.offCenter < b.offCenter - EPSILON;
}

/**
 * Picks the voicing of every chord so that the fingers travel as little as
 * possible through the whole progression, the first chord included. When
 * several ways are equally short, the one closest to the middle of `range`
 * wins. Throws a `RangeError` if a chord has no voicing within `range`.
 */
export function voiceProgression(
  chords: readonly ProgressionChord[],
  range: KeyRange = LEFT_HAND_RANGE,
): VoicedProgression {
  const middle = (range.lowest + range.highest) / 2;
  const distanceFromMiddle = (keys: readonly number[]) =>
    Math.abs(keys.reduce((sum, key) => sum + key, 0) / keys.length - middle);

  let layer: Candidate[] = [];
  for (const chord of chords) {
    const voicings = getVoicings(chord, range);
    if (voicings.length === 0) {
      throw new RangeError(
        `${spellChord(chord).name} has no voicing between keys ${range.lowest} and ${range.highest}`,
      );
    }

    layer = voicings.map((voicing) => {
      const offCenter = distanceFromMiddle(voicing.keyIndexes);
      if (layer.length === 0) {
        return { voicing, movement: 0, offCenter, previous: undefined };
      }

      let best: Candidate | undefined;
      for (const previous of layer) {
        const candidate: Candidate = {
          voicing,
          movement:
            previous.movement +
            getMovement(previous.voicing.keyIndexes, voicing.keyIndexes),
          offCenter: previous.offCenter + offCenter,
          previous,
        };
        if (isBetter(candidate, best)) best = candidate;
      }
      return best as Candidate;
    });
  }

  let last: Candidate | undefined;
  for (const candidate of layer) {
    if (isBetter(candidate, last)) last = candidate;
  }

  const voicings: Voicing[] = [];
  for (let at = last; at; at = at.previous) voicings.unshift(at.voicing);

  const steps = voicings.map((voicing, index): ProgressionStep => {
    const chord = chords[index] as ProgressionChord;
    const previous = voicings[index - 1];
    return {
      chord,
      ...spellChord(chord),
      ...voicing,
      movement: previous
        ? getMovement(previous.keyIndexes, voicing.keyIndexes)
        : 0,
    };
  });

  return { steps, total: last?.movement ?? 0 };
}
