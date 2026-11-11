import { describe, expect, it } from 'vitest';

import { type Board, type Selection, getBoard } from './board.js';
import { CHORD_TYPE_IDS, INVERSIONS } from './chords.js';

const selection = (overrides: Partial<Selection> = {}): Selection => ({
  view: 'scale',
  root: 0,
  scale: 'major',
  chordType: 'major',
  tonality: 'major',
  chordSize: 'triad',
  keyChord: 0,
  inversion: 'root',
  octave: 0,
  ...overrides,
});

const pressed = (board: Board) =>
  board.keys.filter((key) => key.pressed).map((key) => key.index);

const labels = (board: Board) =>
  board.keys.filter((key) => key.pressed).map((key) => key.label);

describe('getBoard', () => {
  describe('in the scale view', () => {
    const board = getBoard(selection({ root: 3 }));

    it('presses one octave of the scale, from middle C', () => {
      expect(pressed(board)).toEqual([15, 17, 19, 20, 22, 24, 26, 27]);
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
      ).toEqual([15, 27]);
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
      expect(pressed(board)).toEqual([14, 17, 21, 24]);
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
      expect(pressed(board)).toEqual([29, 31, 35, 38]);
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

  describe('in the key view', () => {
    it('presses the selected chord of the key from its own root', () => {
      const board = getBoard(
        selection({
          view: 'key',
          root: 2,
          tonality: 'minor',
          chordSize: 'seventh',
          keyChord: 7,
        }),
      );
      expect(board.keyChords).toHaveLength(9);
      expect(board.keyChord?.numeral).toBe('V7');
      expect(board.chord?.name).toBe('A7');
      expect(pressed(board)).toEqual([21, 25, 28, 31]);
      expect(labels(board)).toEqual(['A', 'C#', 'E', 'G']);
    });

    it('flags the root of the chord rather than the tonic', () => {
      const board = getBoard(selection({ view: 'key', keyChord: 4 }));
      expect(board.notes.filter((note) => note.root)).toEqual([
        { name: 'G', degree: '1', root: true },
      ]);
    });

    it('falls back to the last chord when the key has fewer', () => {
      const board = getBoard(selection({ view: 'key', keyChord: 8 }));
      expect(board.keyChord?.numeral).toBe('vii°');
      expect(
        getBoard(selection({ view: 'key', keyChord: -1 })).chord?.name,
      ).toBe('C');
    });
  });

  it('fits every chord of every key in every inversion', () => {
    for (const tonality of ['major', 'minor'] as const) {
      for (let root = 0; root < 12; root++) {
        for (let keyChord = 0; keyChord < 9; keyChord++) {
          const board = getBoard(
            selection({
              view: 'key',
              root,
              tonality,
              chordSize: 'seventh',
              keyChord,
              inversion: 'third',
            }),
          );
          expect(
            pressed(board),
            `${tonality} ${root} ${keyChord}`,
          ).toHaveLength(4);
        }
      }
    }
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

  describe('moving the notes an octave', () => {
    it('moves them down and up from middle C', () => {
      expect(
        pressed(getBoard(selection({ view: 'chord', octave: -1 }))),
      ).toEqual([0, 4, 7]);
      expect(
        pressed(getBoard(selection({ view: 'chord', octave: 2 }))),
      ).toEqual([36, 40, 43]);
      expect(getBoard(selection({ octave: 1 })).notes[0]?.name).toBe('C');
    });

    it('goes one octave down and up as far as the notes fit', () => {
      expect(getBoard(selection()).octaves).toEqual({ lowest: -1, highest: 2 });
      const high = selection({
        view: 'chord',
        root: 11,
        chordType: 'dominant7',
        inversion: 'third',
      });
      expect(getBoard(high).octaves).toEqual({ lowest: -1, highest: 0 });
    });

    it('shows the nearest octave that fits when the selected one does not', () => {
      const board = getBoard(
        selection({
          view: 'chord',
          root: 11,
          chordType: 'dominant7',
          inversion: 'third',
          octave: 2,
        }),
      );
      expect(board.octave).toBe(0);
      expect(pressed(board)).toEqual([33, 35, 39, 42]);
      expect(getBoard(selection({ octave: -3 })).octave).toBe(-1);
    });
  });

  it('copes with a keyboard too short for the selection', () => {
    expect(pressed(getBoard(selection({ root: 11 }), 12))).toEqual([11]);
    expect(getBoard(selection({ root: 11 }), 12).pressed).toEqual([11]);
    expect(getBoard(selection(), 0).keys).toEqual([]);
  });
});
