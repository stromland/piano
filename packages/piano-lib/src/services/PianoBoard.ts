import type { PianoKey } from '@/models/PianoKey';

import { Note, Piano } from './Piano';
import { Scale, ScaleType } from './Scale';
import { Chord, Inversion, TriadChord } from './TriadChord';

export enum PressType {
  SCALE = 'Scale',
  CHORD = 'Chord',
}

export const PianoBoard = {
  getPressedKeys(
    keys: PianoKey[],
    note: Note,
    scale: ScaleType,
    chord: Chord,
    inversion: Inversion,
    type: PressType,
  ): PianoKey[] {
    if (type === PressType.SCALE) {
      return this.pressAllScaleKeys(keys, note, scale);
    } else {
      return this.pressChordKeys(keys, chord, inversion);
    }
  },

  pressAllScaleKeys(
    keys: PianoKey[],
    note: Note,
    scale: ScaleType,
  ): PianoKey[] {
    const keyIndex = Piano.getPianoKeyIndex(note);
    const keysToPress = Scale.getScaleKeyIndexes(keyIndex, scale);
    return Piano.pressKeys(keys, keysToPress);
  },

  getAllChords(keys: PianoKey[], note: Note, scale: ScaleType): Chord[] {
    const keyIndex = Piano.getPianoKeyIndex(note);
    const scaleKeys = Scale.getScaleKeyIndexes(keyIndex, scale, 2);
    return distinctChords(
      scaleKeys
        .slice(0, 7)
        .map((it) => TriadChord.findChord(keys, scaleKeys, it))
        .filter((it) => it !== undefined)
        .map((it) => it as Chord), // TODO: improve
    );
  },

  pressChordKeys(
    keys: PianoKey[],
    chord: Chord,
    inversion: Inversion,
  ): PianoKey[] {
    const chordKeys = TriadChord.getTriadInversion(chord, inversion);
    return Piano.pressKeys(keys, chordKeys);
  },
};

function distinctChords(chords: Chord[]): Chord[] {
  const distinct: Record<string, Chord> = {};
  for (const chord of chords) {
    if (!distinct[chord.note + chord.suffix]) {
      distinct[chord.note + chord.suffix] = chord;
    }
  }
  return Object.values(distinct);
}
