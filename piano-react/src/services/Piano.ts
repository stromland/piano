import { PianoKey } from "../models/PianoKey";

export const PIANO_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "B"
] as const;

export type Note = typeof PIANO_NOTES[number];

export class Piano {
  public static keys: PianoKey[] = PIANO_NOTES.map(note => ({
    note,
    black: note.length === 2,
    pressed: false
  }));

  public static getPianoKeyIndex(note: Note): number {
    return this.keys.findIndex(it => it.note === note);
  }

  public static getNoteFromIndex(index: number): Note {
    return PIANO_NOTES[index % 12];
  }

  public static getPianoKeySets(sets: number): PianoKey[] {
    return Array(sets)
      .fill(this.keys)
      .reduce((allKeys, keys) => [...allKeys, ...keys]);
  }

  public static getPianoKeys(keys: number): PianoKey[] {
    const sets = Math.ceil(keys / this.keys.length);
    return this.getPianoKeySets(sets).slice(0, keys);
  }

  public static pressKeys(keys: PianoKey[], keysToPress: number[]): PianoKey[] {
    return keys.map((key, index) =>
      keysToPress.includes(index) ? { ...key, pressed: true } : key
    );
  }
}
