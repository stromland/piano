import { describe, expect, it } from 'vitest';

import { CHORD_QUALITY_TYPES, type ChordQuality } from './chords.js';
import {
  LEFT_HAND_RANGE,
  PROGRESSION_ROOT_NAMES,
  type ProgressionChord,
  getMovement,
  getVoicings,
  spellChord,
  voiceProgression,
} from './progression.js';

const chord = (root: number, quality: ChordQuality): ProgressionChord => ({
  root,
  quality,
});

describe('PROGRESSION_ROOT_NAMES', () => {
  it('gives the twelve roots their usual names', () => {
    expect(PROGRESSION_ROOT_NAMES.join(' ')).toBe(
      'C Db D Eb E F F# G Ab A Bb B',
    );
  });
});

describe('spellChord', () => {
  it.each<[number, ChordQuality, string, string]>([
    [0, 'major', 'C', 'C E G'],
    [8, 'major', 'Ab', 'Ab C Eb'],
    [6, 'minor', 'F#m', 'F# A C#'],
    [11, 'diminished', 'Bdim', 'B D F'],
    [0, 'augmented', 'Caug', 'C E G#'],
    [7, 'dominant7', 'G7', 'G B D F'],
    [3, 'major7', 'Ebmaj7', 'Eb G Bb D'],
    [9, 'minor7', 'Am7', 'A C E G'],
    [8, 'halfDiminished7', 'Abm7b5', 'Ab Cb Ebb Gb'],
    [0, 'diminished7', 'Cdim7', 'C Eb Gb Bbb'],
  ])('spells %i %s as %s', (root, quality, name, notes) => {
    const spelled = spellChord(chord(root, quality));
    expect(spelled.name).toBe(name);
    expect(spelled.notes.map((note) => note.name).join(' ')).toBe(notes);
  });

  it('gives each note its pitch class', () => {
    expect(spellChord(chord(9, 'minor')).notes).toEqual([
      { pitchClass: 9, name: 'A' },
      { pitchClass: 0, name: 'C' },
      { pitchClass: 4, name: 'E' },
    ]);
  });
});

describe('getVoicings', () => {
  it('places every inversion at every octave that fits', () => {
    expect(getVoicings(chord(0, 'major'))).toEqual([
      { inversion: 0, keyIndexes: [12, 16, 19] },
      { inversion: 0, keyIndexes: [24, 28, 31] },
      { inversion: 1, keyIndexes: [16, 19, 24] },
      { inversion: 2, keyIndexes: [19, 24, 28] },
    ]);
  });

  it('has four inversions for a seventh chord', () => {
    const inversions = getVoicings(chord(7, 'dominant7')).map(
      (voicing) => voicing.inversion,
    );
    expect(new Set(inversions)).toEqual(new Set([0, 1, 2, 3]));
  });

  it('keeps every voicing within the range', () => {
    for (let root = 0; root < 12; root++) {
      for (const quality of CHORD_QUALITY_TYPES) {
        const voicings = getVoicings(chord(root, quality));
        expect(voicings.length, `${root} ${quality}`).toBeGreaterThan(0);
        for (const { keyIndexes } of voicings) {
          expect(keyIndexes[0]).toBeGreaterThanOrEqual(LEFT_HAND_RANGE.lowest);
          expect(keyIndexes.at(-1)).toBeLessThanOrEqual(
            LEFT_HAND_RANGE.highest,
          );
          expect((keyIndexes.at(-1) ?? 0) - (keyIndexes[0] ?? 0)).toBeLessThan(
            12,
          );
        }
      }
    }
  });

  it('finds nothing in a range too narrow for the chord', () => {
    expect(getVoicings(chord(0, 'major'), { lowest: 0, highest: 5 })).toEqual(
      [],
    );
  });
});

describe('getMovement', () => {
  it('costs nothing to stay put', () => {
    expect(getMovement([12, 16, 19], [12, 16, 19])).toBe(0);
  });

  it('adds up how far each finger moves', () => {
    // C E G → C F A: E to F, G to A.
    expect(getMovement([12, 16, 19], [12, 17, 21])).toBe(3);
  });

  it('pairs the notes so the fingers travel least', () => {
    // E G C → F G B D: E to F, G stays, C splits to B and D.
    expect(getMovement([16, 19, 24], [17, 19, 23, 26])).toBe(4);
    expect(getMovement([17, 19, 23, 26], [16, 19, 24])).toBe(4);
  });

  it('pairs every note of the larger chord with one note only', () => {
    // C D → C D E: the new E pairs with D rather than D moving twice.
    expect(getMovement([0, 2], [0, 2, 4])).toBe(2);
  });

  it('has nothing to move when a chord is empty', () => {
    expect(getMovement([], [0, 4, 7])).toBe(0);
  });
});

describe('voiceProgression', () => {
  const amFCG7 = [
    chord(9, 'minor'),
    chord(5, 'major'),
    chord(0, 'major'),
    chord(7, 'dominant7'),
  ];

  it('voices each chord for the least movement', () => {
    const { steps, total } = voiceProgression(amFCG7);
    expect(
      steps.map(({ name, inversion, keyIndexes, movement }) => ({
        name,
        inversion,
        keyIndexes,
        movement,
      })),
    ).toEqual([
      { name: 'Am', inversion: 2, keyIndexes: [16, 21, 24], movement: 0 },
      { name: 'F', inversion: 0, keyIndexes: [17, 21, 24], movement: 1 },
      { name: 'C', inversion: 1, keyIndexes: [16, 19, 24], movement: 3 },
      { name: 'G7', inversion: 3, keyIndexes: [17, 19, 23, 26], movement: 4 },
    ]);
    expect(total).toBe(8);
  });

  it('keeps the chord and its spelling on each step', () => {
    const [first] = voiceProgression(amFCG7).steps;
    expect(first?.chord).toEqual(chord(9, 'minor'));
    expect(first?.notes.map((note) => note.name)).toEqual(['A', 'C', 'E']);
  });

  it('beats voicing every chord in root position', () => {
    const { total } = voiceProgression(amFCG7);
    const rootPositions = amFCG7.map(
      (it) =>
        getVoicings(it).find((voicing) => voicing.inversion === 0)
          ?.keyIndexes ?? [],
    );
    const naive = rootPositions
      .slice(1)
      .reduce(
        (sum, keys, index) =>
          sum + getMovement(rootPositions[index] ?? [], keys),
        0,
      );
    expect(total).toBeLessThan(naive);
  });

  it('places a lone chord closest to the middle of the range', () => {
    // The middle is 21.5; E G C averages 19.7, G C E 23.7.
    const [step] = voiceProgression([chord(0, 'major')]).steps;
    expect(step?.keyIndexes).toEqual([16, 19, 24]);
  });

  it('settles ties by staying closest to the middle', () => {
    // Repeating a chord costs nothing wherever it is played.
    const { steps, total } = voiceProgression([
      chord(0, 'major'),
      chord(0, 'major'),
    ]);
    expect(total).toBe(0);
    expect(steps.map((step) => step.keyIndexes)).toEqual([
      [16, 19, 24],
      [16, 19, 24],
    ]);
  });

  it('copes with an empty progression', () => {
    expect(voiceProgression([])).toEqual({ steps: [], total: 0 });
  });

  it('refuses a range the chords do not fit in', () => {
    expect(() =>
      voiceProgression([chord(0, 'major7')], { lowest: 0, highest: 8 }),
    ).toThrow(new RangeError('Cmaj7 has no voicing between keys 0 and 8'));
  });
});
