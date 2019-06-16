import last from "lodash/last";

interface Scales {
  major: number[];
  minor: number[];
}

export type ScaleType = keyof Scales;

export class Scale {
  public static scales: Scales = {
    major: [2, 2, 1, 2, 2, 2, 1],
    minor: [2, 1, 2, 2, 1, 2, 2]
    // harmonicMinor: [2, 1, 2, 2, 1, 3, 1],
    // pentatonicMajor: [2, 2, 3, 2, 3],
    // pentatonicMinor: [3, 2, 2, 3, 2]
  };

  public static getScaleKeyIndexes(
    noteIndex: number,
    scaleType: ScaleType,
    sets: number = 1
  ): number[] {
    const spec = this.getScaleSpec(scaleType);
    return Array<number[]>(sets)
      .fill(spec)
      .reduce((acc, val) => [...acc, ...val])
      .reduce(
        (keys, nextKey) =>
          keys.length === 0
            ? [noteIndex, noteIndex + nextKey]
            : [...keys, last(keys)! + nextKey],
        [] as number[]
      );
  }

  private static getScaleSpec(name: ScaleType): number[] {
    return Scale.scales[name];
  }
}
