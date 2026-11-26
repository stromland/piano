export const NOTES_PER_OCTAVE = 12;

/** The seven note letters, in scale order, and the pitch class of each. */
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const LETTER_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11] as const;

const SHARP = '#';
const FLAT = 'b';

/** Maps any key index to its pitch class: 0 = C, 1 = C♯/D♭ … 11 = B. */
export function toPitchClass(index: number): number {
  return ((index % NOTES_PER_OCTAVE) + NOTES_PER_OCTAVE) % NOTES_PER_OCTAVE;
}

export function isBlackKey(index: number): boolean {
  return naturalNoteName(index) === undefined;
}

/** The letter of a white key, or `undefined` for a black key. */
export function naturalNoteName(index: number): string | undefined {
  const letter = LETTER_PITCH_CLASSES.findIndex(
    (pitchClass) => pitchClass === toPitchClass(index),
  );
  return LETTERS[letter];
}

/**
 * How many semitones `pitchClass` lies above (+) or below (−) the natural
 * note of the given letter, picking the nearest direction.
 */
export function accidentalFor(pitchClass: number, letter: number): number {
  const natural = LETTER_PITCH_CLASSES[letter % LETTERS.length] ?? 0;
  return toPitchClass(pitchClass - natural + 6) - 6;
}

/** `spellNote(0, 1)` → `'C#'`, `spellNote(6, -1)` → `'Bb'`. */
export function spellNote(letter: number, accidental: number): string {
  const sign = accidental > 0 ? SHARP : FLAT;
  return `${LETTERS[letter % LETTERS.length]}${sign.repeat(Math.abs(accidental))}`;
}

/**
 * Swaps the ASCII accidentals used in note and chord names for the musical
 * symbols: `'Bb'` → `'B♭'`, `'F#m'` → `'F♯m'`.
 */
export function formatNoteName(name: string): string {
  return name.replaceAll(SHARP, '♯').replaceAll(FLAT, '♭');
}
