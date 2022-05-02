import { PianoKey } from '../models/PianoKey';

export interface Chord extends ChordSpec {
  note: string;
}

export interface ChordSpec {
  suffix: string;
  keyIndexes: number[];
}

export enum Inversion {
  ROOT = 'Root',
  FIRST = 'First',
  SECOND = 'Second',
}

interface TriadChordSpecs {
  major: ChordSpec;
  minor: ChordSpec;
  diminished: ChordSpec;
  augmented: ChordSpec;
  [key: string]: ChordSpec;
}

export class TriadChord {
  private static triadChordSpecs: TriadChordSpecs = {
    major: { suffix: '', keyIndexes: [0, 4, 7] },
    minor: { suffix: 'm', keyIndexes: [0, 3, 7] },
    diminished: { suffix: 'dim', keyIndexes: [0, 3, 6] },
    augmented: { suffix: 'aug', keyIndexes: [0, 4, 8] },
  };

  public static findChord(
    pianoKeys: PianoKey[],
    scaleKeys: number[],
    startKey: number
  ): Chord | undefined {
    return Object.values<ChordSpec>(this.triadChordSpecs)
      .map(
        (spec): Chord => ({
          note: pianoKeys[startKey].note,
          suffix: spec.suffix,
          keyIndexes: spec.keyIndexes.map((it) => it + startKey),
        })
      )
      .find((chord) =>
        chord.keyIndexes.reduce<boolean>((all, key) => {
          return all && scaleKeys.includes(key);
        }, true)
      );
  }

  public static getTriadInversion(
    chord: Chord,
    inversion: Inversion
  ): number[] {
    const shiftIndexes = (x: number): number[] =>
      Array(x)
        .fill(12)
        .map((v, i) => chord.keyIndexes[i] + v)
        .concat(chord.keyIndexes.slice(x))
        .sort((x, y) => x - y);

    switch (inversion) {
      case Inversion.ROOT:
        return chord.keyIndexes;
      case Inversion.FIRST:
        return shiftIndexes(1);
      case Inversion.SECOND:
        return shiftIndexes(2);
    }
  }
}
