import { describe, expect, it } from 'vitest';

import {
  CHORD_TYPES,
  CHORD_TYPE_IDS,
  type ChordType,
  findChordType,
  getChord,
  getChordRootNames,
  getInversions,
  invertChord,
} from './chords.js';

const spell = (root: number, type: ChordType) => {
  const chord = getChord(root, type);
  return `${chord.name}: ${chord.notes.map((note) => note.name).join(' ')}`;
};

describe('getChord', () => {
  it.each<[number, ChordType, string]>([
    [0, 'major', 'C: C E G'],
    [2, 'minor', 'Dm: D F A'],
    [11, 'diminished', 'Bdim: B D F'],
    [0, 'augmented', 'Caug: C E G#'],
    [2, 'sus2', 'Dsus2: D E A'],
    [7, 'sus4', 'Gsus4: G C D'],
    [5, 'major7', 'Fmaj7: F A C E'],
    [7, 'dominant7', 'G7: G B D F'],
    [10, 'minor7', 'Bbm7: Bb Db F Ab'],
    [11, 'halfDiminished7', 'Bm7b5: B D F A'],
    [0, 'diminished7', 'Cdim7: C Eb Gb Bbb'],
    [1, 'dominant7', 'Db7: Db F Ab Cb'],
    [1, 'minor7', 'C#m7: C# E G# B'],
  ])('spells the chord on %i of type %s', (root, type, expected) => {
    expect(spell(root, type)).toBe(expected);
  });

  it('describes each note by its degree in the chord', () => {
    expect(getChord(2, 'minor7').notes).toEqual([
      { pitchClass: 2, interval: 0, name: 'D', degree: '1' },
      { pitchClass: 5, interval: 3, name: 'F', degree: 'b3' },
      { pitchClass: 9, interval: 7, name: 'A', degree: '5' },
      { pitchClass: 0, interval: 10, name: 'C', degree: 'b7' },
    ]);
  });

  it('gives every chord one letter per note', () => {
    for (const type of CHORD_TYPE_IDS) {
      for (let root = 0; root < 12; root++) {
        const letters = getChord(root, type).notes.map((note) => note.name[0]);
        expect(new Set(letters).size, `${type} on ${root}`).toBe(
          letters.length,
        );
      }
    }
  });
});

describe('getChordRootNames', () => {
  it('spells black-key roots the way a major or minor key would', () => {
    expect(getChordRootNames('major').join(' ')).toBe(
      'C Db D Eb E F Gb G Ab A Bb B',
    );
    expect(getChordRootNames('minor').join(' ')).toBe(
      'C C# D Eb E F F# G G# A Bb B',
    );
  });
});

describe('findChordType', () => {
  it('recognises a chord by its intervals', () => {
    expect(findChordType([0, 4, 7, 10])).toBe('dominant7');
    expect(findChordType([0, 3, 6])).toBe('diminished');
  });

  it('knows when it is no chord type it has', () => {
    expect(findChordType([0, 4, 7, 9])).toBeUndefined();
    expect(findChordType([0, 4])).toBeUndefined();
  });
});

describe('getInversions', () => {
  it('gives a chord one inversion fewer than it has notes', () => {
    expect(getInversions(3)).toEqual(['root', 'first', 'second']);
    expect(getInversions(4)).toEqual(['root', 'first', 'second', 'third']);
  });
});

describe('invertChord', () => {
  const cMajor = [0, 4, 7];
  const g7 = [7, 11, 14, 17];

  it.each([
    ['root', [0, 4, 7]],
    ['first', [4, 7, 12]],
    ['second', [7, 12, 16]],
  ] as const)('puts a triad in %s position', (inversion, expected) => {
    expect(invertChord(cMajor, inversion)).toEqual(expected);
  });

  it('puts the seventh at the bottom in the third inversion', () => {
    expect(invertChord(g7, 'third')).toEqual([17, 19, 23, 26]);
  });

  it('uses the last inversion a triad has when asked for the third', () => {
    expect(invertChord(cMajor, 'third')).toEqual([7, 12, 16]);
  });

  it('does not change the chord it was given', () => {
    const result = invertChord(cMajor, 'root');
    expect(result).not.toBe(cMajor);
    expect(cMajor).toEqual([0, 4, 7]);
  });
});

describe('CHORD_TYPES', () => {
  it('describes every chord type', () => {
    for (const type of CHORD_TYPE_IDS) {
      expect(CHORD_TYPES[type].description.length, type).toBeGreaterThan(20);
    }
  });
});
