import { describe, expect, test } from 'vitest';

import { Note, Piano } from './Piano';
import { Scale, ScaleType } from './Scale';

interface Test {
  note: Note;
  scale: ScaleType;
  expected: number[];
}

describe('Scale', () => {
  describe('getScaleKeyIndexes', () => {
    test.each`
      note   | scale      | expected
      ${'C'} | ${'major'} | ${[0, 2, 4, 5, 7, 9, 11, 12]}
      ${'C'} | ${'minor'} | ${[0, 2, 3, 5, 7, 8, 10, 12]}
      ${'E'} | ${'major'} | ${[4, 6, 8, 9, 11, 13, 15, 16]}
      ${'F'} | ${'major'} | ${[5, 7, 9, 10, 12, 14, 16, 17]}
    `(
      'when given note=$note and scale=$scale it should return $expected',
      ({ note, scale, expected }: Test) => {
        const index = Piano.getPianoKeyIndex(note);
        const keys = Scale.getScaleKeyIndexes(index, scale);
        expect(keys.length).toBe(8);
        expect(keys).toStrictEqual(expected);
      },
    );
  });
});
