import { MIDDLE_C } from './keyboard.js';
import {
  LETTERS,
  LETTER_PITCH_CLASSES,
  NOTES_PER_OCTAVE,
  toPitchClass,
} from './notes.js';
import { pickRootLetter, spellSevenNotes } from './spelling.js';

/** Which staff of the grand staff a note is written on. */
export type Clef = 'treble' | 'bass';

/**
 * The sharps (+1) and flats (−1) of a key signature, one per letter:
 * C = 0 … B = 6.
 */
export type KeySignature = readonly number[];

/** One sharp or flat of a key signature, and where it goes on each staff. */
export interface KeySignatureMark {
  accidental: 1 | -1;
  /** Position on the treble staff; see `staffPosition`. */
  treble: number;
  /** Position on the bass staff. */
  bass: number;
}

export interface StaffNote {
  /** ASCII spelling such as `'F#'`; see `formatNoteName`. */
  name: string;
  clef: Clef;
  /** Where it sits; see `staffPosition`. */
  position: number;
  /**
   * The accidental written in front of it, if its name differs from what the
   * key signature says: sharps (+) or flats (−), and 0 for a natural.
   */
  accidental: number | undefined;
  /**
   * In a chord, the column its accidental is written in, counted leftwards:
   * accidentals that would touch move a column further from the notes.
   */
  accidentalColumn: number;
  /**
   * In a chord, written on the other side of the notes, because it is a
   * second above the note below it.
   */
  shifted: boolean;
  /** The positions of the short lines it needs beyond its staff's five. */
  ledgerLines: number[];
}

export interface Staff {
  keySignature: KeySignatureMark[];
  /** Lowest first. */
  notes: StaffNote[];
  /** Whether the notes sound together, and are written stacked. */
  chord: boolean;
  /** The highest position the notes reach, at the highest octave given. */
  top: number;
}

/** A pressed key and what it is called. */
export interface StaffInput {
  /** Key index on the keyboard, as in `Board.pressed`. */
  key: number;
  /** ASCII spelling such as `'Bb'`. */
  name: string;
}

export interface StaffOptions {
  chord: boolean;
  /** None for a chord on its own. */
  keySignature?: KeySignature;
  /**
   * The same notes at the highest octave they can move to, so the staff can
   * keep its height while they move. Defaults to the notes themselves.
   */
  highest?: readonly StaffInput[];
}

/** Lines of the treble staff, bottom to top; the bass staff's are below 0. */
export const TREBLE_LINES = [2, 4, 6, 8, 10] as const;
export const BASS_LINES = [-10, -8, -6, -4, -2] as const;

/** Sharps go on F C G D A E B, flats on B E A D G C F, at these positions. */
const SHARPS = {
  letters: [3, 0, 4, 1, 5, 2, 6],
  treble: [10, 7, 11, 8, 5, 9, 6],
};
const FLATS = { letters: [6, 2, 5, 1, 4, 0, 3], treble: [6, 9, 5, 8, 4, 7, 3] };

/** The bass staff has its key signature two octaves below the treble's. */
const BASS_OFFSET = -14;

/** Accidentals closer than a seventh would touch. */
const ACCIDENTAL_CLEARANCE = 6;

/** `'F#'` → letter 3, one sharp; `'Bbb'` → letter 6, two flats. */
function parseName(name: string): { letter: number; accidental: number } {
  const letter = Math.max(
    0,
    LETTERS.findIndex((candidate) => candidate === name[0]),
  );
  const marks = name.slice(1);
  const sharps = marks.split('#').length - 1;
  const flats = marks.split('b').length - 1;
  return { letter, accidental: sharps - flats };
}

/**
 * Where a note is written: the letters it lies above middle C, so 0 is middle
 * C, 1 the D above it and −1 the B below it. The treble staff's lines are at
 * 2 to 10, the bass staff's at −10 to −2. A note goes by its name, not the key
 * it sounds on: C♯ and D♭ share a key but not a position.
 */
export function staffPosition(key: number, name: string): number {
  const { letter, accidental } = parseName(name);
  const natural = key - MIDDLE_C - accidental;
  const octave = Math.round(
    (natural - (LETTER_PITCH_CLASSES[letter] ?? 0)) / NOTES_PER_OCTAVE,
  );
  return octave * LETTERS.length + letter;
}

/**
 * The key signature of the seven-note scale with these `steps` from `root`,
 * spelled the way the app names that root. Pass a scale's `spelling` steps:
 * a mode then gets the key signature of the major scale it comes from, and
 * harmonic minor that of natural minor.
 */
export function getKeySignature(
  root: number,
  steps: readonly number[],
): number[] {
  const pitchClass = toPitchClass(root);
  const rootLetter = pickRootLetter(pitchClass, steps);
  const signature = LETTERS.map(() => 0);
  for (const note of spellSevenNotes(pitchClass, rootLetter, steps)) {
    signature[(rootLetter + note.letterStep) % LETTERS.length] =
      note.accidental;
  }
  return signature;
}

/** The sharps or flats of a key signature in the order they are written. */
export function getKeySignatureMarks(
  signature: KeySignature | undefined,
): KeySignatureMark[] {
  if (!signature) return [];
  const sharps = signature.some((accidental) => accidental > 0);
  const order = sharps ? SHARPS : FLATS;
  const count = signature.filter((accidental) => accidental !== 0).length;
  return order.treble.slice(0, count).map((treble) => ({
    accidental: sharps ? 1 : -1,
    treble,
    bass: treble + BASS_OFFSET,
  }));
}

function ledgerLines(position: number): number[] {
  const lines: number[] = [];
  if (position === 0) lines.push(0);
  for (let line = 12; line <= position; line += 2) lines.push(line);
  for (let line = -12; line >= position; line -= 2) lines.push(line);
  return lines;
}

/**
 * The notes of a scale or chord on a grand staff, as whole notes without
 * rhythm. Below middle C goes on the bass staff. A note gets an accidental
 * where its name differs from the key signature: every one, without a key
 * signature.
 */
export function getStaff(
  inputs: readonly StaffInput[],
  { chord, keySignature, highest = inputs }: StaffOptions,
): Staff {
  const signature = keySignature ?? LETTERS.map(() => 0);
  const notes: StaffNote[] = [];
  for (const { key, name } of inputs) {
    const { letter, accidental } = parseName(name);
    const position = staffPosition(key, name);
    const clef: Clef = position >= 0 ? 'treble' : 'bass';
    const below = notes.at(-1);
    notes.push({
      name,
      clef,
      position,
      accidental: accidental === signature[letter] ? undefined : accidental,
      accidentalColumn: 0,
      shifted:
        chord &&
        below !== undefined &&
        !below.shifted &&
        below.clef === clef &&
        position - below.position === 1,
      ledgerLines: ledgerLines(position),
    });
  }

  if (chord) {
    const columns: StaffNote[][] = [];
    const withAccidentals = notes
      .filter((note) => note.accidental !== undefined)
      .sort((a, b) => b.position - a.position);
    for (const note of withAccidentals) {
      let column = 0;
      while (
        columns[column]?.some(
          (other) =>
            other.clef === note.clef &&
            Math.abs(other.position - note.position) < ACCIDENTAL_CLEARANCE,
        )
      ) {
        column++;
      }
      (columns[column] ??= []).push(note);
      note.accidentalColumn = column;
    }
  }

  const positions = highest.map(({ key, name }) => staffPosition(key, name));
  return {
    keySignature: getKeySignatureMarks(keySignature),
    notes,
    chord,
    top: Math.max(...positions, ...notes.map((note) => note.position)),
  };
}
