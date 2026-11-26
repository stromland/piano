import { describe, expect, it } from 'vitest';

import { type Board, VISIBLE_COLUMNS, getBoard } from './board';
import { COLUMN_COUNT, COLUMN_NAMES } from './stradella';

const used = (board: Board) =>
  board.bass.flatMap((row) =>
    row.buttons
      .filter((button) => button.role)
      .map((button) => `${button.name} ${button.role} ${button.beats}`),
  );

const pressedTreble = (board: Board) =>
  board.treble.filter((key) => key.pressed).map((key) => key.label);

const visible = (board: Board) =>
  board.bass[1]?.buttons.map((button) => button.name);

describe('getBoard', () => {
  describe('for G7', () => {
    const board = getBoard({ root: 7, chordType: 'dominant7' });

    it('plays the G bass and the G7 button, alternating with D', () => {
      expect(used(board)).toEqual([
        'G bass 1',
        'D alternate 3',
        'G7 chord 2·4',
      ]);
      expect(board.beats.map((beat) => beat.button.name)).toEqual([
        'G',
        'G7',
        'D',
        'G7',
      ]);
    });

    it('shows the rows from the bellows outwards', () => {
      expect(board.bass.map((row) => row.name)).toEqual([
        'Counterbass',
        'Bass',
        'Major',
        'Minor',
        '7th',
        'Dim',
      ]);
    });

    it('shows the columns around the used buttons', () => {
      expect(visible(board)).toEqual(['F', 'C', 'G', 'D', 'A', 'E', 'B']);
    });

    it('marks the C bass', () => {
      const marked = board.bass.flatMap((row) =>
        row.buttons.filter((button) => button.marked),
      );
      expect(marked.map((button) => `${button.row} ${button.name}`)).toEqual([
        'fundamental C',
      ]);
    });

    it('presses the chord on the treble from middle C', () => {
      expect(pressedTreble(board)).toEqual(['G', 'B', 'D', 'F']);
      expect(
        board.treble.filter((key) => key.pressed).map((key) => key.index),
      ).toEqual([19, 23, 26, 29]);
      expect(board.treble.find((key) => key.root)?.label).toBe('G');
    });
  });

  it('has a treble of 41 keys from F3 to A6', () => {
    const { treble } = getBoard({ root: 0, chordType: 'major' });
    expect(treble).toHaveLength(41);
    expect(treble[0]).toMatchObject({ index: 5, label: 'F' });
    expect(treble.at(-1)).toMatchObject({ index: 45, label: 'A' });
  });

  it('shows a combined chord with the button of its other root', () => {
    const board = getBoard({ root: 0, chordType: 'major7' });
    expect(board.bassChord?.combined).toBe(true);
    expect(used(board)).toEqual(['C bass 1', 'G alternate 3', 'Em chord 2·4']);
    expect(visible(board)).toEqual(['F', 'C', 'G', 'D', 'A', 'E', 'B']);
  });

  it('plays a chord without a fifth with no alternating bass', () => {
    const board = getBoard({ root: 0, chordType: 'diminished7' });
    expect(used(board)).toEqual(['C bass ', 'C° chord ']);
    expect(board.beats).toEqual([]);
  });

  it('leaves a chord without a button to the right hand', () => {
    const board = getBoard({ root: 0, chordType: 'sus4' });
    expect(board.bassChord).toBeUndefined();
    expect(used(board)).toEqual([]);
    expect(pressedTreble(board)).toEqual(['C', 'F', 'G']);
    expect(visible(board)).toContain('C');
  });

  it('keeps the visible columns on the bass at its ends', () => {
    const top = getBoard({ root: 6, chordType: 'sus2' });
    expect(top.chord.name).toBe('Gbsus2');
    expect(visible(top)).toEqual(COLUMN_NAMES.slice(0, VISIBLE_COLUMNS));

    const bottom = getBoard({ root: 8, chordType: 'minor' });
    expect(bottom.chord.name).toBe('G#m');
    expect(visible(bottom)).toEqual(
      COLUMN_NAMES.slice(COLUMN_COUNT - VISIBLE_COLUMNS),
    );
  });
});
