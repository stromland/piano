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

const chords = {
  tripple: [0, 2, 4]
};

function keySet(sets) {
  let pianoKeys = [];
  for (let i = 1; i <= sets; i++) {
    pianoKeys.push(...twelveKeys);
  }
  return pianoKeys;
}

function pressKeys(allKeys, keysToPress) {
  let index = 0;
  return allKeys.map((k, i) => {
    if (i !== keysToPress[index]) {
      return k;
    }
    index++;
    return { ...k, pressed: true };
  });
}

function scaleContainsKey(scaleKeys, key) {
  return scaleKeys.reduce((isInScale, s) => {
    return key === s || isInScale;
  }, false);
}

function findScaleKeyIndex(scaleKeys, key) {
  return scaleKeys.reduce((found, s, i) => {
    if (s === key) {
      return i;
    }
    return found;
  }, -1);
}

function getChordKeyIndexes(scaleKeys, chordStartKey) {
  if (!scaleContainsKey(scaleKeys, chordStartKey)) {
    return [];
  }

  const scaleKeyIndex = findScaleKeyIndex(scaleKeys, chordStartKey);
  if (scaleKeyIndex < 0) {
    return [];
  }

  return chords.tripple.reduce((acc, s) => {
    return [...acc, scaleKeys[scaleKeyIndex + s] || 0];
  }, []);
}

function getScaleKeyIndexes(startKey, scale) {
  return scale.reduce((acc, s, i) => {
    if (i === 0) {
      return [startKey, startKey + s];
    }
    return [...acc, acc[i] + s];
  }, []);
}

function pressChordKeys(allKeys, scale, scaleKey, chordKey) {
  const scaleKeys = getScaleKeyIndexes(scaleKey, [...scale, ...scale]);
  const chordKeys = getChordKeyIndexes(scaleKeys, chordKey);
  return pressKeys(allKeys, chordKeys);
}

function pressAllScaleKeys(allKeys, startKey, scale) {
  const scaleKeys = getScaleKeyIndexes(startKey, scale);
  return pressKeys(allKeys, scaleKeys);
}

function pressOneKey(allKeys, keyIndex) {
  return pressKeys(allKeys, [keyIndex]);
}

export default {
  scales,
  chords,
  keySet,
  scaleContainsKey,
  getChordKeyIndexes,
  getScaleKeyIndexes,
  pressChordKeys,
  pressAllScaleKeys,
  pressOneKey
};
