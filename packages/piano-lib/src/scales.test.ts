import { describe, expect, it } from 'vitest';

import {
  SCALES,
  SCALE_TYPES,
  type ScaleType,
  getRelatedKey,
  getRootNames,
  getScaleKeyIndexes,
  getScaleNotes,
  getScaleSteps,
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
    ['A melodic minor', 9, 'melodicMinor', 'A B C D E F# G#'],
    ['G# melodic minor', 8, 'melodicMinor', 'G# A# B C# D# E# F##'],
    ['D Dorian', 2, 'dorian', 'D E F G A B C'],
    ['C# Dorian', 1, 'dorian', 'C# D# E F# G# A# B'],
    ['E Phrygian', 4, 'phrygian', 'E F G A B C D'],
    ['F Lydian', 5, 'lydian', 'F G A B C D E'],
    ['Gb Lydian', 6, 'lydian', 'Gb Ab Bb C Db Eb F'],
    ['G Mixolydian', 7, 'mixolydian', 'G A B C D E F'],
    ['B Locrian', 11, 'locrian', 'B C D E F G A'],
  ])('spells %s', (_, root, type, expected) => {
    expect(names(root, type)).toBe(expected);
  });

  it('uses every letter exactly once in a seven-note scale', () => {
    const sevenNotes = SCALE_TYPES.filter(
      (type) => !type.startsWith('pentatonic'),
    );
    for (const type of sevenNotes) {
      for (let root = 0; root < 12; root++) {
        const letters = getScaleNotes(root, type).map((note) => note.name[0]);
        expect(new Set(letters).size, `${type} from ${root}`).toBe(7);
      }
    }
  });

  it('reports pitch class and distance from the root', () => {
    expect(getScaleNotes(9, 'pentatonicMinor')).toEqual([
      { pitchClass: 9, interval: 0, name: 'A', degree: '1' },
      { pitchClass: 0, interval: 3, name: 'C', degree: 'b3' },
      { pitchClass: 2, interval: 5, name: 'D', degree: '4' },
      { pitchClass: 4, interval: 7, name: 'E', degree: '5' },
      { pitchClass: 7, interval: 10, name: 'G', degree: 'b7' },
    ]);
  });

  it.each<[ScaleType, string]>([
    ['major', '1 2 3 4 5 6 7'],
    ['harmonicMinor', '1 2 b3 4 5 b6 7'],
    ['dorian', '1 2 b3 4 5 6 b7'],
    ['phrygian', '1 b2 b3 4 5 b6 b7'],
    ['lydian', '1 2 3 #4 5 6 7'],
    ['locrian', '1 b2 b3 4 b5 b6 b7'],
    ['pentatonicMajor', '1 2 3 5 6'],
  ])('names the degrees of %s', (type, expected) => {
    for (let root = 0; root < 12; root++) {
      const degrees = getScaleNotes(root, type).map((note) => note.degree);
      expect(degrees.join(' '), `${type} from ${root}`).toBe(expected);
    }
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

describe('getScaleSteps', () => {
  it.each<[ScaleType, number[]]>([
    ['major', [2, 2, 1, 2, 2, 2, 1]],
    ['dorian', [2, 1, 2, 2, 2, 1, 2]],
    ['harmonicMinor', [2, 1, 2, 2, 1, 3, 1]],
    ['pentatonicMinor', [3, 2, 2, 3, 2]],
  ])('steps through %s', (type, expected) => {
    expect(getScaleSteps(type)).toEqual(expected);
  });

  it('adds up to an octave for every scale', () => {
    for (const type of SCALE_TYPES) {
      expect(getScaleSteps(type).reduce((sum, step) => sum + step, 0)).toBe(12);
    }
  });
});

describe('getRelatedKey', () => {
  it.each<[number, ScaleType, ReturnType<typeof getRelatedKey>]>([
    [0, 'major', { tonic: 9, tonality: 'minor', startsOn: 2 }],
    [9, 'minor', { tonic: 0, tonality: 'major', startsOn: 5 }],
    [2, 'dorian', { tonic: 0, tonality: 'major', startsOn: 1 }],
    [11, 'locrian', { tonic: 0, tonality: 'major', startsOn: 6 }],
    [1, 'mixolydian', { tonic: 6, tonality: 'major', startsOn: 4 }],
    [0, 'harmonicMinor', undefined],
    [0, 'pentatonicMajor', undefined],
  ])('relates %i %s to a key', (root, type, expected) => {
    expect(getRelatedKey(root, type)).toEqual(expected);
  });
});

describe('SCALES', () => {
  it('describes every scale', () => {
    for (const type of SCALE_TYPES) {
      expect(SCALES[type].description.length, type).toBeGreaterThan(20);
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
    [2, 'dorian', [2, 4, 5, 7, 9, 11, 12, 14]],
  ])('from key %i in %s', (root, type, expected) => {
    expect(getScaleKeyIndexes(root, type)).toEqual(expected);
  });
});
