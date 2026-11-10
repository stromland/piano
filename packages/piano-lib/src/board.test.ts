import { describe, expect, it } from 'vitest';

import { type Board, type Selection, getBoard } from './board.js';
import { SCALE_TYPES } from './scales.js';

const selection = (overrides: Partial<Selection> = {}): Selection => ({
  view: 'scale',
  root: 0,
  scale: 'major',
  chordIndex: 0,
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

    it('lists the notes of the scale once each', () => {
      expect(board.notes).toEqual([
        { name: 'Eb', root: true },
        { name: 'F', root: false },
        { name: 'G', root: false },
        { name: 'Ab', root: false },
        { name: 'Bb', root: false },
        { name: 'C', root: false },
        { name: 'D', root: false },
      ]);
    });

    it('still offers the chords of the scale', () => {
      expect(board.chords.map((chord) => chord.name)).toEqual([
        'Eb',
        'Fm',
        'Gm',
        'Ab',
        'Bb',
        'Cm',
        'Ddim',
      ]);
    });
  });

  describe('in the chord view', () => {
    it('presses the selected chord', () => {
      const board = getBoard(selection({ view: 'chord', chordIndex: 1 }));
      expect(board.chord?.name).toBe('Dm');
      expect(pressed(board)).toEqual([2, 5, 9]);
    });

    it('applies the inversion and lists the notes lowest first', () => {
      const board = getBoard(
        selection({
          view: 'chord',
          root: 3,
          chordIndex: 1,
          inversion: 'first',
        }),
      );
      expect(pressed(board)).toEqual([8, 12, 17]);
      expect(board.notes).toEqual([
        { name: 'Ab', root: false },
        { name: 'C', root: false },
        { name: 'F', root: true },
      ]);
    });

    it('flags the root of the chord rather than of the scale', () => {
      const board = getBoard(selection({ view: 'chord', chordIndex: 4 }));
      expect(
        board.keys.filter((key) => key.root).map((key) => key.label),
      ).toEqual(['G']);
    });

    it('falls back to the last chord when the scale has fewer', () => {
      const board = getBoard(
        selection({ view: 'chord', scale: 'pentatonicMajor', chordIndex: 6 }),
      );
      expect(board.chord?.name).toBe('Am');
    });

    it('falls back to the first chord for a negative index', () => {
      const board = getBoard(selection({ view: 'chord', chordIndex: -2 }));
      expect(board.chord?.name).toBe('C');
    });
  });

  it('fits every chord in every inversion on the default keyboard', () => {
    for (const scale of SCALE_TYPES) {
      for (let root = 0; root < 12; root++) {
        const count = getBoard(selection({ root, scale })).chords.length;
        for (let chordIndex = 0; chordIndex < count; chordIndex++) {
          const board = getBoard(
            selection({
              view: 'chord',
              root,
              scale,
              chordIndex,
              inversion: 'second',
            }),
          );
          expect(
            pressed(board),
            `${scale} ${root} #${chordIndex}`,
          ).toHaveLength(3);
        }
      }
    }
  });

  it('copes with a keyboard too short for the selection', () => {
    expect(pressed(getBoard(selection({ root: 11 }), 12))).toEqual([11]);
    expect(getBoard(selection(), 0).keys).toEqual([]);
  });
});
