// @flow

type PianoKey = {
  note: string,
  black?: boolean
};

type Chord = {
  note?: string,
  suffix: string,
  indexes: number[]
};

type Scales = { [string]: number[] };

type TriadChords = { [string]: Chord };

const basePianoKeys: PianoKey[] = [
  { note: 'C' },
  { note: 'C#', black: true },
  { note: 'D' },
  { note: 'D#', black: true },
  { note: 'E' },
  { note: 'F' },
  { note: 'F#', black: true },
  { note: 'G' },
  { note: 'G#', black: true },
  { note: 'A' },
  { note: 'Bb', black: true },
  { note: 'B' }
];

const scales: Scales = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  harmonicMinor: [2, 1, 2, 2, 1, 3, 1],
  pentatonicMajor: [2, 2, 3, 2, 3],
  pentatonicMinor: [3, 2, 2, 3, 2]
};

const triadChords: TriadChords = {
  major: {
    suffix: '',
    indexes: [0, 4, 7]
  },
  minor: {
    suffix: 'm',
    indexes: [0, 3, 7]
  },
  diminished: {
    suffix: 'dim',
    indexes: [0, 3, 6]
  },
  augmented: {
    suffix: 'aug',
    indexes: [0, 4, 8]
  }
};

function keySet(sets: number): PianoKey[] {
  return Array(sets)
    .fill(basePianoKeys)
    .reduce((allKeys, keys) => [...allKeys, ...keys]);
}

function getScaleKeyIndexes(startKey: number, scale: number[]): number[] {
  return scale.reduce((acc, s, i) => {
    if (i === 0) {
      return [startKey, startKey + s];
    }
    return [...acc, acc[i] + s];
  }, []);
}

function isChordInScale(chordKeys: number[], scaleKeys: number[]): boolean {
  return chordKeys.reduce((acc, i) => acc && scaleKeys.indexOf(i) !== -1, true);
}

function findChord(
  pianoKeys: PianoKey[],
  startKey: number,
  scaleKeys: number[]
): Chord {
  return Object.keys(triadChords).reduce(
    (acc, name) => {
      const chordIndexes = triadChords[name].indexes.map(i => i + startKey);
      const chord = {
        note: pianoKeys[startKey].note,
        suffix: triadChords[name].suffix,
        indexes: chordIndexes
      };
      return isChordInScale(chordIndexes, scaleKeys) && !acc ? chord : acc;
    },
    { indexes: [], suffix: '' }
  );
}

function getAllChords(
  pianoKeys: PianoKey[],
  keyIndex: number,
  scaleName: string
): Chord[] {
  const scale = scales[scaleName];
  const scaleKeys = getScaleKeyIndexes(keyIndex, [...scale, ...scale]);

  return scaleKeys.slice(0, 7).map(s => findChord(pianoKeys, s, scaleKeys));
}

function getTriadInversions(chordIndexes: number[]): number[][] {
  const shiftIndexes = x => {
    return Array(x)
      .fill(12)
      .map((v, i) => chordIndexes[i] + v)
      .concat(chordIndexes.slice(x))
      .sort((x, y) => x - y);
  };
  return [chordIndexes, shiftIndexes(1), shiftIndexes(2)];
}

function pressKeys(pianoKeys: PianoKey[], keysToPress: number[]): PianoKey[] {
  let index = 0;
  return pianoKeys.map((k, i) => {
    if (i !== keysToPress[index]) {
      return k;
    }
    index++;
    return { ...k, pressed: true };
  });
}

function pressAllScaleKeys(
  pianoKeys: PianoKey[],
  startKey: number,
  scale: number[]
): PianoKey[] {
  const scaleKeys = getScaleKeyIndexes(startKey, scale);
  return pressKeys(pianoKeys, scaleKeys);
}

export default {
  scales,
  triadChords,
  keySet,
  getScaleKeyIndexes,
  getTriadInversions,
  findChord,
  getAllChords,
  pressKeys,
  pressAllScaleKeys
};
