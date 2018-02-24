import piano from './piano';

describe('piano major scale', () => {
  [
    {
      key: 'C',
      index: 0,
      expect: [0, 2, 4, 5, 7, 9, 11, 12]
    },
    {
      key: 'G',
      index: 7,
      expect: [7, 9, 11, 12, 14, 16, 18, 19]
    }
  ].forEach(t => {
    test(`piano ${t.key} major scale key indexes`, () => {
      const majorScale = piano.scales['major'];
      const keyIndexes = piano.getScaleKeyIndexes(t.index, majorScale);
      expect(keyIndexes).toEqual(t.expect);
    });
  });
});

describe('piano major chords', () => {
  [
    {
      chord: 'C',
      index: 0,
      expect: [0, 4, 7]
    },
    {
      chord: 'Dm',
      index: 2,
      expect: [2, 5, 9]
    }
  ].forEach(t => {
    test(`piano ${t.chord} chord`, () => {
      const majorScale = piano.scales['major'];
      const scaleKeys = piano.getScaleKeyIndexes(0, majorScale);
      const keyIndexes = piano.getChordKeyIndexes(scaleKeys, t.index);
      expect(keyIndexes).toEqual(t.expect);
    });
  });
});

describe('piano scale has every key', () => {
  [7, 9, 11, 12, 14, 16, 18, 19].forEach(key => {
    test(`keyIndex ${key} is in scale G major`, () => {
      const majorScale = piano.scales['major'];
      const scaleKeys = piano.getScaleKeyIndexes(7, majorScale);
      const isInScale = piano.findScaleKeyIndex(scaleKeys, key);
      expect(isInScale).not.toEqual(-1);
    });
  });
});
