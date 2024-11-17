import type { PianoKey } from '@/models/PianoKey';

export const PIANO_NOTES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'Bb',
  'B',
] as const;

export type Note = (typeof PIANO_NOTES)[number];

export const Piano = {
  keys: PIANO_NOTES.map(
    (note): PianoKey => ({
      note,
      black: note.length === 2,
      pressed: false,
    }),
  ),

  getPianoKeyIndex(note: Note): number {
    return this.keys.findIndex((it) => it.note === note);
  },

  getNoteFromIndex(index: number): Note {
    return PIANO_NOTES[index % 12];
  },

  getPianoKeySets(sets: number): PianoKey[] {
    return Array(sets)
      .fill(this.keys)
      .reduce((allKeys, keys) => [...allKeys, ...keys]);
  },

  getPianoKeys(keys: number): PianoKey[] {
    const sets = Math.ceil(keys / this.keys.length);
    return this.getPianoKeySets(sets).slice(0, keys);
  },

  pressKeys(keys: PianoKey[], keysToPress: number[]): PianoKey[] {
    return keys.map((key, index) =>
      keysToPress.includes(index) ? { ...key, pressed: true } : key,
    );
  },
};
