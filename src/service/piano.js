const twelveKeys = [
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

function keySet(sets) {
  let pianoKeys = [];
  for (let i = 1; i <= sets; i++) {
    pianoKeys.push(...twelveKeys);
  }
  return pianoKeys;
}

function getScaleKeyIndexes(startKey, scale) {
  return scale.reduce((acc, s, i) => {
    if (i === 0) {
      return [startKey, startKey + s];
    }
    return [...acc, acc[i] + s];
  }, []);
}

function pressAllScaleKeys(allKeys, startKey, scale) {
  let scaleIndex = 0;
  const scaleKeys = getScaleKeyIndexes(startKey, scale);
  return allKeys.map((k, i) => {
    if (i !== scaleKeys[scaleIndex]) {
      return k;
    }
    scaleIndex++;
    return { ...k, pressed: true };
  });
}

function pressOneKey(allKeys, keyIndex) {
  return allKeys.map((k, i) => {
    if (i !== keyIndex) {
      return k;
    }
    return { ...k, pressed: true };
  });
}

export default {
  keySet,
  scales,
  pressAllScaleKeys,
  pressOneKey
};
