import { describe, expect, it } from 'vitest';

import {
  formatNoteName,
  isBlackKey,
  naturalNoteName,
  toPitchClass,
} from './notes.js';

describe('toPitchClass', () => {
  it.each([
    [0, 0],
    [11, 11],
    [12, 0],
    [25, 1],
    [-1, 11],
  ])('maps key %i to pitch class %i', (index, expected) => {
    expect(toPitchClass(index)).toBe(expected);
  });
});

describe('isBlackKey', () => {
  it('finds the five black keys of every octave', () => {
    const black = Array.from({ length: 24 }, (_, index) => index).filter(
      isBlackKey,
    );
    expect(black).toEqual([1, 3, 6, 8, 10, 13, 15, 18, 20, 22]);
  });
});

describe('naturalNoteName', () => {
  it('names the white keys', () => {
    expect([0, 2, 4, 5, 7, 9, 11, 12].map(naturalNoteName)).toEqual([
      'C',
      'D',
      'E',
      'F',
      'G',
      'A',
      'B',
      'C',
    ]);
  });

  it('has no name for a black key', () => {
    expect(naturalNoteName(1)).toBeUndefined();
  });
});

describe('formatNoteName', () => {
  it.each([
    ['C', 'C'],
    ['Bb', 'B♭'],
    ['F#', 'F♯'],
    ['F##', 'F♯♯'],
    ['Ebm', 'E♭m'],
    ['Bbdim', 'B♭dim'],
    ['Abaug', 'A♭aug'],
    ['Bdim', 'Bdim'],
  ])('formats %s as %s', (name, expected) => {
    expect(formatNoteName(name)).toBe(expected);
  });
});
