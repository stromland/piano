import { describe, expect, it } from 'vitest';

import { type Board, type Selection, getBoard } from './board.js';
import { CHORD_TYPE_IDS, INVERSIONS } from './chords.js';

const selection = (overrides: Partial<Selection> = {}): Selection => ({
  view: 'scale',
  root: 0,
  scale: 'major',
  chordType: 'major',
  inversion: 'root',
  ...overrides,
});

const pressed = (board: Board) =>
  board.keys.filter((key) => key.pressed).map((key) => key.index);

const labels = (board: Board) =>
  board.keys.filter((key) => key.pressed).map((key) => key.label);

describe('getBoard', () => {
  describe('in the scale view', () => {
    const board = getBoard(selection({ root: 3 }));

    it('presses one octave of the scale', () => {
      expect(pressed(board)).toEqual([3, 5, 7, 8, 10, 12, 14, 15]);
      expect(board.pressed).toEqual(pressed(board));
    });

    it('labels the pressed keys the way the scale spells them', () => {
      expect(labels(board)).toEqual([
        'Eb',
        'F',
        'G',
        'Ab',
        'Bb',
        'C',
        'D',
        'Eb',
      ]);
    });

    it('flags the root at both ends of the octave', () => {
      expect(
        board.keys.filter((key) => key.root).map((key) => key.index),
      ).toEqual([3, 15]);
    });

    it('lists the notes of the scale once each, with their degrees', () => {
      expect(board.notes.map((note) => `${note.name} ${note.degree}`)).toEqual([
        'Eb 1',
        'F 2',
        'G 3',
        'Ab 4',
        'Bb 5',
        'C 6',
        'D 7',
      ]);
      expect(board.notes.map((note) => note.root)).toEqual([
        true,
        false,
        false,
        false,
        false,
        false,
        false,
      ]);
      expect(board.chord).toBeUndefined();
    });
  });

  describe('in the chord view', () => {
    it('presses the selected chord on the root note', () => {
      const board = getBoard(
        selection({ view: 'chord', root: 2, chordType: 'minor7' }),
      );
      expect(board.chord?.name).toBe('Dm7');
      expect(pressed(board)).toEqual([2, 5, 9, 12]);
    });

    it('applies the inversion and lists the notes lowest first', () => {
      const board = getBoard(
        selection({
          view: 'chord',
          root: 7,
          chordType: 'dominant7',
          inversion: 'third',
        }),
      );
      expect(pressed(board)).toEqual([17, 19, 23, 26]);
      expect(board.notes).toEqual([
        { name: 'F', degree: 'b7', root: false },
        { name: 'G', degree: '1', root: true },
        { name: 'B', degree: '3', root: false },
        { name: 'D', degree: '5', root: false },
      ]);
    });

    it('lists the chord in root position as its tones', () => {
      const board = getBoard(
        selection({ view: 'chord', chordType: 'major', inversion: 'second' }),
      );
      expect(board.tones.map((note) => note.name)).toEqual(['C', 'E', 'G']);
    });

    it('flags the root of the chord', () => {
      const board = getBoard(
        selection({ view: 'chord', root: 9, chordType: 'minor' }),
      );
      expect(
        board.keys.filter((key) => key.root).map((key) => key.label),
      ).toEqual(['A']);
    });
  });

  it('fits every chord in every inversion on the default keyboard', () => {
    for (const chordType of CHORD_TYPE_IDS) {
      for (let root = 0; root < 12; root++) {
        for (const inversion of INVERSIONS) {
          const board = getBoard(
            selection({ view: 'chord', root, chordType, inversion }),
          );
          expect(
            pressed(board),
            `${chordType} ${root} ${inversion}`,
          ).toHaveLength(board.tones.length);
        }
      }
    }
  });

  it('copes with a keyboard too short for the selection', () => {
    expect(pressed(getBoard(selection({ root: 11 }), 12))).toEqual([11]);
    expect(getBoard(selection({ root: 11 }), 12).pressed).toEqual([11]);
    expect(getBoard(selection(), 0).keys).toEqual([]);
  });
});
