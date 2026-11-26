import { describe, expect, it } from 'vitest';

import { DEFAULT_KEY_COUNT, createKeyboard, pressKeys } from './keyboard.js';

describe('createKeyboard', () => {
  it('builds four octaves from C to C by default', () => {
    const keys = createKeyboard();
    expect(keys).toHaveLength(DEFAULT_KEY_COUNT);
    expect(keys.at(0)).toEqual({
      index: 0,
      pitchClass: 0,
      black: false,
      label: 'C',
      pressed: false,
      root: false,
    });
    expect(keys.at(-1)).toMatchObject({ index: 48, pitchClass: 0, label: 'C' });
  });

  it('marks the black keys and leaves them unlabelled', () => {
    expect(createKeyboard(3).at(1)).toMatchObject({ black: true, label: '' });
  });

  it.each([0, -3])('returns no keys for a count of %i', (count) => {
    expect(createKeyboard(count)).toEqual([]);
  });
});

describe('pressKeys', () => {
  const keys = createKeyboard(13);

  it('presses the given keys and leaves the rest alone', () => {
    const pressed = pressKeys(keys, [0, 4, 7]);
    expect(
      pressed.filter((key) => key.pressed).map((key) => key.index),
    ).toEqual([0, 4, 7]);
    expect(pressed[1]).toBe(keys[1]);
  });

  it('does not change the keyboard it was given', () => {
    pressKeys(keys, [0]);
    expect(keys.some((key) => key.pressed)).toBe(false);
  });

  it('labels pressed keys with the names it is given', () => {
    const pressed = pressKeys(keys, [3, 5], { names: new Map([[3, 'Eb']]) });
    expect(pressed[3]?.label).toBe('Eb');
    expect(pressed[5]?.label).toBe('F');
    expect(pressed[1]?.label).toBe('');
  });

  it('flags the root in every octave it is pressed', () => {
    const pressed = pressKeys(keys, [0, 4, 12], { rootPitchClass: 0 });
    expect(pressed.filter((key) => key.root).map((key) => key.index)).toEqual([
      0, 12,
    ]);
  });

  it('ignores indexes outside the keyboard', () => {
    expect(pressKeys(keys, [40]).some((key) => key.pressed)).toBe(false);
  });
});
