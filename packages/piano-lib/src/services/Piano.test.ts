import { describe, expect, it } from 'vitest';

import { Piano } from './Piano';

describe('Piano', () => {
  describe('getNoteFromIndex', () => {
    it('when given index 0 it should return note C', () => {
      const note = Piano.getNoteFromIndex(0);
      expect(note).toBe('C');
    });

    it('when given index 8 it should return note G#', () => {
      const note = Piano.getNoteFromIndex(8);
      expect(note).toBe('G#');
    });
  });
});
