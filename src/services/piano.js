const basePianoKeys = [
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

const scales = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  harmonic: [2, 1, 2, 2, 1, 3, 1],
  'Pentatonic Major': [2, 2, 3, 2, 3],
  'Pentatonic Minor': [3, 2, 2, 3, 2]
};

const baseChords = {
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

function keySet(sets) {
  return Array(sets)
    .fill(basePianoKeys)
    .reduce((allKeys, keys) => [...allKeys, ...keys]);
}

function getScaleKeyIndexes(startKey, scale) {
  return scale.reduce((acc, s, i) => {
    if (i === 0) {
      return [startKey, startKey + s];
    }
    return [...acc, acc[i] + s];
  }, []);
}

function isChordInScale(chordKeys, scaleKeys) {
  return chordKeys.reduce((acc, i) => acc && scaleKeys.indexOf(i) !== -1, true);
}

function findChord(pianoKeys, startKey, scaleKeys) {
  return Object.keys(baseChords).reduce((acc, name) => {
    const chordIndexes = baseChords[name].indexes.map(i => i + startKey);
    const chord = {
      note: pianoKeys[startKey].note,
      suffix: baseChords[name].suffix,
      indexes: chordIndexes
    };
    return isChordInScale(chordIndexes, scaleKeys) ? chord : acc;
  }, {});
}

function getAllChords(pianoKeys, keyIndex, scaleName) {
  const scale = scales[scaleName];
  const scaleKeys = getScaleKeyIndexes(keyIndex, [...scale, ...scale]);

  return scaleKeys.slice(0, 7).map(s => findChord(pianoKeys, s, scaleKeys));
}

function pressKeys(pianoKeys, keysToPress) {
  let index = 0;
  return pianoKeys.map((k, i) => {
    if (i !== keysToPress[index]) {
      return k;
    }
    index++;
    return { ...k, pressed: true };
  });
}

function pressAllScaleKeys(pianoKeys, startKey, scale) {
  const scaleKeys = getScaleKeyIndexes(startKey, scale);
  return pressKeys(pianoKeys, scaleKeys);
}

export default {
  scales,
  baseChords,
  keySet,
  findChord,
  getScaleKeyIndexes,
  pressAllScaleKeys,
  getAllChords
};
