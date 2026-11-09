import { isBlackKey, naturalNoteName, toPitchClass } from './notes.js';

export interface PianoKey {
  index: number;
  pitchClass: number;
  black: boolean;
  /** Letter for a white key; a pressed key gets its name in the current scale. */
  label: string;
  pressed: boolean;
  /** Pressed, and the root of the current scale or chord. */
  root: boolean;
}

/** Four octaves from C to C. */
export const DEFAULT_KEY_COUNT = 49;

/** An unpressed keyboard starting at C. */
export function createKeyboard(keyCount = DEFAULT_KEY_COUNT): PianoKey[] {
  return Array.from({ length: Math.max(0, keyCount) }, (_, index) => ({
    index,
    pitchClass: toPitchClass(index),
    black: isBlackKey(index),
    label: naturalNoteName(index) ?? '',
    pressed: false,
    root: false,
  }));
}

export interface PressOptions {
  /** Pitch class → name, used to label the pressed keys. */
  names?: ReadonlyMap<number, string>;
  rootPitchClass?: number;
}

/** Returns a copy of `keys` with the keys at `indexes` pressed. */
export function pressKeys(
  keys: readonly PianoKey[],
  indexes: readonly number[],
  { names, rootPitchClass }: PressOptions = {},
): PianoKey[] {
  const pressed = new Set(indexes);
  return keys.map((key) =>
    pressed.has(key.index)
      ? {
          ...key,
          pressed: true,
          root: key.pitchClass === rootPitchClass,
          label: names?.get(key.pitchClass) ?? key.label,
        }
      : key,
  );
}
