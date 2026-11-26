import { describe, expect, it } from 'vitest';

import { MIDDLE_C } from './keyboard.js';
import { SCALES } from './scales.js';
import { MAJOR_STEPS, MINOR_STEPS } from './spelling.js';
import {
  type StaffNote,
  getKeySignature,
  getKeySignatureMarks,
  getStaff,
  staffPosition,
} from './staff.js';

/** Key index of a note `semitones` above middle C. */
const key = (semitones: number) => MIDDLE_C + semitones;

const notes = (...pairs: [number, string][]) =>
  pairs.map(([semitones, name]) => ({ key: key(semitones), name }));

const summary = (note: StaffNote) =>
  `${note.name} ${note.clef} ${note.position}`;

describe('staffPosition', () => {
  it('counts letters from middle C', () => {
    expect(staffPosition(key(0), 'C')).toBe(0);
    expect(staffPosition(key(2), 'D')).toBe(1);
    expect(staffPosition(key(12), 'C')).toBe(7);
    expect(staffPosition(key(-1), 'B')).toBe(-1);
    expect(staffPosition(key(-12), 'C')).toBe(-7);
  });

  it('places a note by its letter, not by the key it sounds on', () => {
    // The same key, spelled three ways.
    expect(staffPosition(key(1), 'C#')).toBe(0);
    expect(staffPosition(key(1), 'Db')).toBe(1);
    // C♭ sounds on the B below it, B♯ on the C above it.
    expect(staffPosition(key(-1), 'Cb')).toBe(0);
    expect(staffPosition(key(0), 'B#')).toBe(-1);
    expect(staffPosition(key(2), 'Ebb')).toBe(2);
  });
});

describe('getKeySignature', () => {
  it('has no sharps or flats in C major and A minor', () => {
    expect(getKeySignature(0, MAJOR_STEPS)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(getKeySignature(9, MINOR_STEPS)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('lists the sharps or flats by letter, C first', () => {
    // D major: F♯ and C♯.
    expect(getKeySignature(2, MAJOR_STEPS)).toEqual([1, 0, 0, 1, 0, 0, 0]);
    // F minor: B♭, E♭, A♭ and D♭.
    expect(getKeySignature(5, MINOR_STEPS)).toEqual([0, -1, -1, 0, 0, -1, -1]);
  });

  it('spells a black-key root the way the app names it', () => {
    // E♭ major, not D♯ major.
    expect(getKeySignature(3, MAJOR_STEPS)).toEqual([0, 0, -1, 0, 0, -1, -1]);
  });

  it('gives a mode the key signature of the major scale it comes from', () => {
    expect(getKeySignature(2, SCALES.dorian.spelling)).toEqual(
      getKeySignature(0, MAJOR_STEPS),
    );
    expect(getKeySignature(7, SCALES.mixolydian.spelling)).toEqual(
      getKeySignature(0, MAJOR_STEPS),
    );
  });

  it('gives harmonic minor the key signature of natural minor', () => {
    expect(getKeySignature(2, SCALES.harmonicMinor.spelling)).toEqual(
      getKeySignature(2, MINOR_STEPS),
    );
  });
});

describe('getKeySignatureMarks', () => {
  it('has none without sharps or flats', () => {
    expect(getKeySignatureMarks(undefined)).toEqual([]);
    expect(getKeySignatureMarks([0, 0, 0, 0, 0, 0, 0])).toEqual([]);
  });

  it('writes sharps in their order, on both staves', () => {
    // A major: F♯, C♯, G♯.
    expect(getKeySignatureMarks(getKeySignature(9, MAJOR_STEPS))).toEqual([
      { accidental: 1, treble: 10, bass: -4 },
      { accidental: 1, treble: 7, bass: -7 },
      { accidental: 1, treble: 11, bass: -3 },
    ]);
  });

  it('writes flats in their order, on both staves', () => {
    // E♭ major: B♭, E♭, A♭.
    expect(getKeySignatureMarks(getKeySignature(3, MAJOR_STEPS))).toEqual([
      { accidental: -1, treble: 6, bass: -8 },
      { accidental: -1, treble: 9, bass: -5 },
      { accidental: -1, treble: 5, bass: -9 },
    ]);
  });

  it('has room for all seven', () => {
    // C♯ major and C♭ major are not keys the app names, but the order holds.
    expect(getKeySignatureMarks([1, 1, 1, 1, 1, 1, 1])).toHaveLength(7);
    expect(
      getKeySignatureMarks([-1, -1, -1, -1, -1, -1, -1]).map(
        (mark) => mark.treble,
      ),
    ).toEqual([6, 9, 5, 8, 4, 7, 3]);
  });
});

describe('getStaff', () => {
  it('puts middle C and up on the treble staff, the rest on the bass staff', () => {
    const staff = getStaff(notes([-2, 'Bb'], [0, 'C'], [4, 'E']), {
      chord: true,
    });
    expect(staff.notes.map(summary)).toEqual([
      'Bb bass -1',
      'C treble 0',
      'E treble 2',
    ]);
  });

  it('writes the accidental of every note without a key signature', () => {
    const staff = getStaff(notes([9, 'A'], [13, 'C#'], [16, 'E'], [19, 'G']), {
      chord: true,
    });
    expect(staff.keySignature).toEqual([]);
    expect(staff.notes.map((note) => note.accidental)).toEqual([
      undefined,
      1,
      undefined,
      undefined,
    ]);
  });

  it('leaves out what the key signature already says', () => {
    // A7 in D minor: B♭ in the key signature, C♯ borrowed.
    const staff = getStaff(notes([9, 'A'], [13, 'C#'], [16, 'E'], [19, 'G']), {
      chord: true,
      keySignature: getKeySignature(2, MINOR_STEPS),
    });
    expect(staff.keySignature).toHaveLength(1);
    expect(staff.notes.map((note) => note.accidental)).toEqual([
      undefined,
      1,
      undefined,
      undefined,
    ]);
  });

  it('writes a natural where a note goes against the key signature', () => {
    // F harmonic minor: four flats, and E natural.
    const scale = notes(
      [5, 'F'],
      [7, 'G'],
      [8, 'Ab'],
      [10, 'Bb'],
      [12, 'C'],
      [13, 'Db'],
      [16, 'E'],
      [17, 'F'],
    );
    const staff = getStaff(scale, {
      chord: false,
      keySignature: getKeySignature(5, MINOR_STEPS),
    });
    expect(staff.notes.map((note) => note.accidental)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      0,
      undefined,
    ]);
  });

  it('writes a double sharp against a sharp in the key signature', () => {
    // D♯, the V of G♯ minor, has F double sharp.
    const staff = getStaff(notes([3, 'D#'], [7, 'F##'], [10, 'A#']), {
      chord: true,
      keySignature: getKeySignature(8, MINOR_STEPS),
    });
    expect(staff.notes.map((note) => note.accidental)).toEqual([
      undefined,
      2,
      undefined,
    ]);
  });

  it('draws ledger lines for middle C and above the treble staff', () => {
    const staff = getStaff(notes([0, 'C'], [21, 'A'], [24, 'C'], [36, 'C']), {
      chord: false,
    });
    expect(staff.notes.map((note) => note.ledgerLines)).toEqual([
      [0],
      [12],
      [12, 14],
      [12, 14, 16, 18, 20],
    ]);
  });

  it('needs no ledger lines on the bass staff down to C an octave below middle C', () => {
    const staff = getStaff(notes([-12, 'C'], [-1, 'B']), { chord: false });
    expect(staff.notes.map((note) => note.ledgerLines)).toEqual([[], []]);
  });

  it('draws ledger lines below the bass staff', () => {
    const staff = getStaff(notes([-24, 'C']), { chord: false });
    expect(staff.notes[0]?.ledgerLines).toEqual([-12, -14]);
  });

  it('moves the upper note of a second in a chord to the other side', () => {
    // Csus2: C, D, G.
    const sus2 = getStaff(notes([0, 'C'], [2, 'D'], [7, 'G']), {
      chord: true,
    });
    expect(sus2.notes.map((note) => note.shifted)).toEqual([
      false,
      true,
      false,
    ]);
    // C7 in third inversion: B♭, C, E, G – only the C moves.
    const third = getStaff(
      notes([-2, 'Bb'], [0, 'C'], [4, 'E'], [7, 'G']).map((note) => ({
        ...note,
        key: note.key + 12,
      })),
      { chord: true },
    );
    expect(third.notes.map((note) => note.shifted)).toEqual([
      false,
      true,
      false,
      false,
    ]);
  });

  it('never moves a note in a scale, nor across the two staves', () => {
    const scale = getStaff(notes([0, 'C'], [2, 'D'], [4, 'E']), {
      chord: false,
    });
    expect(scale.notes.some((note) => note.shifted)).toBe(false);
    const across = getStaff(notes([-1, 'B'], [0, 'C']), { chord: true });
    expect(across.notes.some((note) => note.shifted)).toBe(false);
  });

  it('moves accidentals that would touch further left, top first', () => {
    // C diminished 7th: C, E♭, G♭, B𝄫.
    const staff = getStaff(notes([0, 'C'], [3, 'Eb'], [6, 'Gb'], [9, 'Bbb']), {
      chord: true,
    });
    expect(
      staff.notes.map((note) => [note.accidental, note.accidentalColumn]),
    ).toEqual([
      [undefined, 0],
      [-1, 2],
      [-1, 1],
      [-2, 0],
    ]);
  });

  it('keeps accidentals a seventh or more apart in one column', () => {
    const staff = getStaff(notes([1, 'C#'], [13, 'C#']), { chord: true });
    expect(staff.notes.map((note) => note.accidentalColumn)).toEqual([0, 0]);
  });

  it('reaches as high as the highest notes it is given', () => {
    const at = notes([0, 'C'], [12, 'C']);
    expect(getStaff(at, { chord: false }).top).toBe(7);
    const highest = notes([24, 'C'], [36, 'C']);
    expect(getStaff(at, { chord: false, highest }).top).toBe(21);
  });
});
