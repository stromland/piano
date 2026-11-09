import { describe, expect, it } from 'vitest';

import {
  SCALE_TYPES,
  type ScaleType,
  getRootNames,
  getScaleKeyIndexes,
  getScaleNotes,
} from './scales.js';

const names = (root: number, type: ScaleType) =>
  getScaleNotes(root, type)
    .map((note) => note.name)
    .join(' ');

describe('getScaleNotes', () => {
  it.each<[string, number, ScaleType, string]>([
    ['C major', 0, 'major', 'C D E F G A B'],
    ['G major', 7, 'major', 'G A B C D E F#'],
    ['E major', 4, 'major', 'E F# G# A B C# D#'],
    ['F major', 5, 'major', 'F G A Bb C D E'],
    ['Eb major', 3, 'major', 'Eb F G Ab Bb C D'],
    ['Db major', 1, 'major', 'Db Eb F Gb Ab Bb C'],
    ['Gb major', 6, 'major', 'Gb Ab Bb Cb Db Eb F'],
    ['A minor', 9, 'minor', 'A B C D E F G'],
    ['C# minor', 1, 'minor', 'C# D# E F# G# A B'],
    ['Eb minor', 3, 'minor', 'Eb F Gb Ab Bb Cb Db'],
    ['Bb minor', 10, 'minor', 'Bb C Db Eb F Gb Ab'],
    ['A harmonic minor', 9, 'harmonicMinor', 'A B C D E F G#'],
    ['D harmonic minor', 2, 'harmonicMinor', 'D E F G A Bb C#'],
    ['G# harmonic minor', 8, 'harmonicMinor', 'G# A# B C# D# E F##'],
    ['C pentatonic major', 0, 'pentatonicMajor', 'C D E G A'],
    ['Eb pentatonic major', 3, 'pentatonicMajor', 'Eb F G Bb C'],
    ['A pentatonic minor', 9, 'pentatonicMinor', 'A C D E G'],
  ])('spells %s', (_, root, type, expected) => {
    expect(names(root, type)).toBe(expected);
  });

  it('uses every letter exactly once in a seven-note scale', () => {
    for (const type of ['major', 'minor', 'harmonicMinor'] as const) {
      for (let root = 0; root < 12; root++) {
        const letters = getScaleNotes(root, type).map((note) => note.name[0]);
        expect(new Set(letters).size, `${type} from ${root}`).toBe(7);
      }
    }
  });

  it('reports pitch class and distance from the root', () => {
    expect(getScaleNotes(9, 'pentatonicMinor')).toEqual([
      { pitchClass: 9, interval: 0, name: 'A' },
      { pitchClass: 0, interval: 3, name: 'C' },
      { pitchClass: 2, interval: 5, name: 'D' },
      { pitchClass: 4, interval: 7, name: 'E' },
      { pitchClass: 7, interval: 10, name: 'G' },
    ]);
  });

  it('treats a key index in any octave as its pitch class', () => {
    expect(names(15, 'major')).toBe(names(3, 'major'));
  });
});

describe('getRootNames', () => {
  it('prefers flats for major keys', () => {
    expect(getRootNames('major').join(' ')).toBe(
      'C Db D Eb E F Gb G Ab A Bb B',
    );
  });

  it('prefers the usual mix of sharps and flats for minor keys', () => {
    expect(getRootNames('minor').join(' ')).toBe(
      'C C# D Eb E F F# G G# A Bb B',
    );
  });

  it('names every root in every scale', () => {
    for (const type of SCALE_TYPES) {
      expect(getRootNames(type).every((name) => name.length > 0)).toBe(true);
    }
  });
});

describe('getScaleKeyIndexes', () => {
  it.each<[number, ScaleType, number[]]>([
    [0, 'major', [0, 2, 4, 5, 7, 9, 11, 12]],
    [0, 'minor', [0, 2, 3, 5, 7, 8, 10, 12]],
    [4, 'major', [4, 6, 8, 9, 11, 13, 15, 16]],
    [5, 'major', [5, 7, 9, 10, 12, 14, 16, 17]],
    [0, 'harmonicMinor', [0, 2, 3, 5, 7, 8, 11, 12]],
    [0, 'pentatonicMajor', [0, 2, 4, 7, 9, 12]],
    [9, 'pentatonicMinor', [9, 12, 14, 16, 19, 21]],
  ])('from key %i in %s', (root, type, expected) => {
    expect(getScaleKeyIndexes(root, type)).toEqual(expected);
  });
});
