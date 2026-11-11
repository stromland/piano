import { describe, expect, it } from 'vitest';

import { MAJOR_STEPS, MINOR_STEPS, degreeName, spellRoot } from './spelling.js';

describe('spellRoot', () => {
  it.each([
    [1, MAJOR_STEPS, 'Db'],
    [1, MINOR_STEPS, 'C#'],
    [6, MAJOR_STEPS, 'Gb'],
    [6, MINOR_STEPS, 'F#'],
    [8, MINOR_STEPS, 'G#'],
    [10, MINOR_STEPS, 'Bb'],
    [-1, MAJOR_STEPS, 'B'],
  ])('names %i in a scale with these steps', (root, steps, expected) => {
    expect(spellRoot(root, steps)).toBe(expected);
  });
});

describe('degreeName', () => {
  it.each([
    [0, 0, '1'],
    [3, 2, 'b3'],
    [6, 3, '#4'],
    [6, 4, 'b5'],
    [9, 6, 'bb7'],
    [14, 8, '9'],
  ])('names %i semitones on letter step %i', (interval, step, expected) => {
    expect(degreeName(interval, step)).toBe(expected);
  });
});
