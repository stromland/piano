import { describe, expect, it } from 'vitest';

import { getScaleChords, invertTriad } from './chords.js';
import type { ScaleType } from './scales.js';

const names = (root: number, type: ScaleType) =>
  getScaleChords(root, type)
    .map((chord) => chord.name)
    .join(' ');

describe('getScaleChords', () => {
  it.each<[string, number, ScaleType, string]>([
    ['C major', 0, 'major', 'C Dm Em F G Am Bdim'],
    ['Eb major', 3, 'major', 'Eb Fm Gm Ab Bb Cm Ddim'],
    ['A minor', 9, 'minor', 'Am Bdim C Dm Em F G'],
    ['C harmonic minor', 0, 'harmonicMinor', 'Cm Ddim Ebaug Fm G Ab Bdim'],
    ['C pentatonic major', 0, 'pentatonicMajor', 'C Am'],
    ['A pentatonic minor', 9, 'pentatonicMinor', 'Am C'],
  ])('finds the triads of %s', (_, root, type, expected) => {
    expect(names(root, type)).toBe(expected);
  });

  it('describes each chord', () => {
    const [, dMinor] = getScaleChords(0, 'major');
    expect(dMinor).toEqual({
      name: 'Dm',
      quality: 'minor',
      root: { pitchClass: 2, interval: 2, name: 'D', degree: '2' },
      keyIndexes: [2, 5, 9],
    });
  });

  it('places the chords going up the keyboard from the root', () => {
    const chords = getScaleChords(11, 'major');
    expect(chords.at(0)?.keyIndexes).toEqual([11, 15, 18]);
    expect(chords.at(-1)?.keyIndexes).toEqual([22, 25, 28]);
  });
});

describe('invertTriad', () => {
  const cMajor = [0, 4, 7];

  it('keeps the root position as it is', () => {
    expect(invertTriad(cMajor, 'root')).toEqual([0, 4, 7]);
  });

  it('moves the root to the top in the first inversion', () => {
    expect(invertTriad(cMajor, 'first')).toEqual([4, 7, 12]);
  });

  it('moves the root and third to the top in the second inversion', () => {
    expect(invertTriad(cMajor, 'second')).toEqual([7, 12, 16]);
  });

  it('does not change the chord it was given', () => {
    const result = invertTriad(cMajor, 'root');
    expect(result).not.toBe(cMajor);
    expect(cMajor).toEqual([0, 4, 7]);
  });
});
