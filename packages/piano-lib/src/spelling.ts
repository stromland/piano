import { LETTERS, accidentalFor, spellNote, toPitchClass } from './notes.js';

/** Semitone steps of the major and natural minor scales. */
export const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1] as const;
export const MINOR_STEPS = [2, 1, 2, 2, 1, 2, 2] as const;

/** Whether a key is major or minor. */
export type Tonality = 'major' | 'minor';

export const TONALITY_STEPS: Record<Tonality, readonly number[]> = {
  major: MAJOR_STEPS,
  minor: MINOR_STEPS,
};

export interface SpelledNote {
  /** 0 = C … 11 = B. */
  pitchClass: number;
  /** Semitones above the root. */
  interval: number;
  /** ASCII spelling such as `'Eb'` or `'F#'`; see `formatNoteName`. */
  name: string;
  /** Index of the letter, counted from the root's letter: 0 … 6. */
  letterStep: number;
  /** Sharps (+) or flats (−) on the letter. */
  accidental: number;
}

/**
 * Spells the notes at `intervals` above `root`, giving each one the letter
 * `letterSteps` away from the root's letter.
 */
export function spellNotes(
  root: number,
  rootLetter: number,
  intervals: readonly number[],
  letterSteps: readonly number[],
): SpelledNote[] {
  return intervals.map((interval, position) => {
    const letterStep = letterSteps[position] ?? 0;
    const letter = (rootLetter + letterStep) % LETTERS.length;
    const pitchClass = toPitchClass(root + interval);
    const accidental = accidentalFor(pitchClass, letter);
    return {
      pitchClass,
      interval,
      name: spellNote(letter, accidental),
      letterStep,
      accidental,
    };
  });
}

/** The intervals of a seven-note scale, from its steps. */
export function stepsToIntervals(steps: readonly number[]): number[] {
  let interval = 0;
  return steps.map((step) => {
    const current = interval;
    interval += step;
    return current;
  });
}

const SEVEN_LETTERS = [0, 1, 2, 3, 4, 5, 6] as const;

/** Spells seven notes from `root`, giving each one the next letter. */
export function spellSevenNotes(
  root: number,
  rootLetter: number,
  steps: readonly number[],
): SpelledNote[] {
  return spellNotes(root, rootLetter, stepsToIntervals(steps), SEVEN_LETTERS);
}

/**
 * A black key can be named after the letter below it (sharp) or above it
 * (flat). Picks the name whose key signature – the seven notes of `steps`
 * from that root – needs the fewest accidentals, and flats when it is a tie:
 * E♭ major rather than D♯ major, but C♯ minor rather than D♭ minor.
 */
export function pickRootLetter(root: number, steps: readonly number[]): number {
  const pitchClass = toPitchClass(root);
  const candidates = LETTERS.map((_, letter) => {
    const accidental = accidentalFor(pitchClass, letter);
    const cost = spellSevenNotes(pitchClass, letter, steps)
      .map((note) => Math.abs(note.accidental))
      .reduce((sum, count) => sum + count, 0);
    return { letter, accidental, cost };
  }).filter(({ accidental }) => Math.abs(accidental) <= 1);

  candidates.sort((a, b) => a.cost - b.cost || a.accidental - b.accidental);
  return candidates[0]?.letter ?? 0;
}

/** The name of `root` when it is the root of a scale with these `steps`. */
export function spellRoot(root: number, steps: readonly number[]): string {
  const pitchClass = toPitchClass(root);
  const letter = pickRootLetter(pitchClass, steps);
  return spellNote(letter, accidentalFor(pitchClass, letter));
}

/**
 * Names a note by its degree, compared with the major scale: `'1'`, `'b3'`,
 * `'#4'`, `'bb7'`. ASCII like note names; see `formatNoteName`.
 */
export function degreeName(interval: number, letterStep: number): string {
  const major =
    MAJOR_STEPS.slice(0, letterStep % LETTERS.length).reduce(
      (sum, step) => sum + step,
      0,
    ) +
    Math.floor(letterStep / LETTERS.length) * 12;
  const difference = interval - major;
  const sign = difference > 0 ? '#' : 'b';
  return `${sign.repeat(Math.abs(difference))}${letterStep + 1}`;
}
