import { Note, Piano } from './Piano';
import { Scale, ScaleType } from './Scale';
import { PianoKey } from '../models/PianoKey';
import { TriadChord, Chord, Inversion } from './TriadChord';

export enum PressType {
  SCALE,
  CHORD,
}

export class PianoBoard {
  public static getPressedKeys(
    keys: PianoKey[],
    note: Note,
    scale: ScaleType,
    chord: Chord,
    inversion: Inversion,
    type: PressType
  ): PianoKey[] {
    if (type === PressType.SCALE) {
      return this.pressAllScaleKeys(keys, note, scale);
    } else {
      return this.pressChordKeys(keys, chord, inversion);
    }
  }

  public static pressAllScaleKeys(
    keys: PianoKey[],
    note: Note,
    scale: ScaleType
  ): PianoKey[] {
    const keyIndex = Piano.getPianoKeyIndex(note);
    const keysToPress = Scale.getScaleKeyIndexes(keyIndex, scale);
    return Piano.pressKeys(keys, keysToPress);
  }

  public static getAllChords(
    keys: PianoKey[],
    note: Note,
    scale: ScaleType
  ): Chord[] {
    const keyIndex = Piano.getPianoKeyIndex(note);
    const scaleKeys = Scale.getScaleKeyIndexes(keyIndex, scale, 2);
    return scaleKeys
      .slice(0, 7)
      .map((it) => TriadChord.findChord(keys, scaleKeys, it))
      .filter((it) => it !== undefined)
      .map((it) => it as Chord); // TODO: improve
  }

  public static pressChordKeys(
    keys: PianoKey[],
    chord: Chord,
    inversion: Inversion
  ): PianoKey[] {
    const chordKeys = TriadChord.getTriadInversion(chord, inversion);
    return Piano.pressKeys(keys, chordKeys);
  }
}
