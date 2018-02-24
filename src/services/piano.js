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

function findScaleKeyIndex(scaleKeys, key) {
  return scaleKeys.reduce((num, s, i) => {
    return s === key ? i : num;
  }, -1);
}

function getChordKeyIndexes(scaleKeys, chordStartKey) {
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

function predictMajorOrMinorChord(allKeys, chordKeys) {
  if (chordKeys.length <= 0) {
    return '';
  }
  const firstKeyIndex = chordKeys[0];
  const scaleKeys = getScaleKeyIndexes(firstKeyIndex, scales['major']);
  const note = allKeys[firstKeyIndex] && allKeys[firstKeyIndex].note;

  const isMajor = chordKeys
    .map(k => findScaleKeyIndex(scaleKeys, k) !== -1)
    .reduce((acc, b) => acc && b, true);

  // TODO: Check minor scale too
  return isMajor ? note : `${note}m`;
}

function getAllChords(allKeys, keyIndex, scaleName) {
  const scale = scales[scaleName];
  const scaleKeys = getScaleKeyIndexes(keyIndex, [...scale, ...scale]);
  return scaleKeys.slice(0, 7).map(s => {
    const chordKeys = getChordKeyIndexes(scaleKeys, s);
    return predictMajorOrMinorChord(allKeys, chordKeys);
  });
}

export default {
  scales,
  chords,
  keySet,
  findScaleKeyIndex,
  getChordKeyIndexes,
  getScaleKeyIndexes,
  pressChordKeys,
  pressAllScaleKeys,
  pressOneKey,
  predictMajorOrMinorChord,
  getAllChords
};
