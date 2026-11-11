import { describe, expect, it } from 'vitest';

import type { ChordSize } from './chords.js';
import {
  findKeysWithChord,
  getKeyChords,
  getKeyName,
  romanNumeral,
} from './keys.js';
import type { Tonality } from './spelling.js';

const describeKey = (tonic: number, tonality: Tonality, size: ChordSize) =>
  getKeyChords(tonic, tonality, size)
    .map((it) => `${it.numeral}=${it.chord.name}`)
    .join(' ');

describe('getKeyChords', () => {
  it.each<[string, number, Tonality, ChordSize, string]>([
    [
      'C major triads',
      0,
      'major',
      'triad',
      'I=C ii=Dm iii=Em IV=F V=G vi=Am vii°=Bdim',
    ],
    [
      'C major sevenths',
      0,
      'major',
      'seventh',
      'Imaj7=Cmaj7 ii7=Dm7 iii7=Em7 IVmaj7=Fmaj7 V7=G7 vi7=Am7 viiø7=Bm7b5',
    ],
    [
      'Eb major triads',
      3,
      'major',
      'triad',
      'I=Eb ii=Fm iii=Gm IV=Ab V=Bb vi=Cm vii°=Ddim',
    ],
    [
      'A minor triads',
      9,
      'minor',
      'triad',
      'i=Am ii°=Bdim III=C iv=Dm v=Em VI=F VII=G V=E vii°=G#dim',
    ],
    [
      'D minor sevenths',
      2,
      'minor',
      'seventh',
      'i7=Dm7 iiø7=Em7b5 IIImaj7=Fmaj7 iv7=Gm7 v7=Am7 VImaj7=Bbmaj7 VII7=C7 V7=A7 vii°7=C#dim7',
    ],
  ])('builds the chords of %s', (_, tonic, tonality, size, expected) => {
    expect(describeKey(tonic, tonality, size)).toBe(expected);
  });

  it('marks the chords a minor key borrows from harmonic minor', () => {
    const chords = getKeyChords(9, 'minor', 'triad');
    expect(chords.filter((it) => it.borrowed).map((it) => it.numeral)).toEqual([
      'V',
      'vii°',
    ]);
    expect(chords.map((it) => it.function)).toEqual([
      'tonic',
      'subdominant',
      'tonic',
      'subdominant',
      'dominant',
      'subdominant',
      'subtonic',
      'dominant',
      'dominant',
    ]);
  });

  it('places each chord by its distance from the tonic', () => {
    const [, ii, , , five] = getKeyChords(2, 'minor', 'seventh');
    expect(ii?.interval).toBe(2);
    expect(five?.interval).toBe(7);
    expect(five?.chord.notes).toEqual([
      { pitchClass: 9, interval: 0, name: 'A', degree: '1' },
      { pitchClass: 0, interval: 3, name: 'C', degree: 'b3' },
      { pitchClass: 4, interval: 7, name: 'E', degree: '5' },
      { pitchClass: 7, interval: 10, name: 'G', degree: 'b7' },
    ]);
  });

  it('spells the chords with the notes of the key', () => {
    const chords = getKeyChords(6, 'major', 'seventh');
    expect(chords.at(-1)?.chord.notes.map((note) => note.name)).toEqual([
      'F',
      'Ab',
      'Cb',
      'Eb',
    ]);
  });
});

describe('romanNumeral', () => {
  it.each([
    [0, 'major', 'I'],
    [1, 'minor', 'ii'],
    [6, 'diminished', 'vii°'],
    [2, 'augmented', 'III+'],
    [4, 'dominant7', 'V7'],
    [6, 'diminished7', 'vii°7'],
  ] as const)('names degree %i of type %s', (degree, type, expected) => {
    expect(romanNumeral(degree, type)).toBe(expected);
  });
});

describe('getKeyName', () => {
  it('spells the tonic the way the key does', () => {
    expect(getKeyName(3, 'major')).toBe('Eb major');
    expect(getKeyName(1, 'minor')).toBe('C# minor');
  });
});

describe('findKeysWithChord', () => {
  const keys = (root: number, type: Parameters<typeof findKeysWithChord>[1]) =>
    findKeysWithChord(root, type).map(
      (it) => `${it.numeral} in ${getKeyName(it.tonic, it.tonality)}`,
    );

  it('finds a dominant seventh as V7 in a major and a minor key', () => {
    expect(keys(7, 'dominant7')).toEqual([
      'V7 in C major',
      'V7 in C minor',
      'VII7 in A minor',
    ]);
  });

  it('finds a minor triad in six keys', () => {
    expect(keys(2, 'minor')).toHaveLength(6);
  });

  it('finds no key for a sus chord', () => {
    expect(keys(0, 'sus4')).toEqual([]);
  });
});
