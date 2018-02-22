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
