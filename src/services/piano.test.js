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
      const chord = piano.findChord(piano.keySet(3), t.index, scaleKeys);
      expect(chord.indexes).toEqual(t.expect);
    });
  });
});

describe('piano scale has every key', () => {
  test(`key indexes in scale G major`, () => {
    const majorScale = piano.scales['major'];
    const scaleKeys = piano.getScaleKeyIndexes(7, majorScale);
    expect([7, 9, 11, 12, 14, 16, 18, 19]).toEqual(scaleKeys);
  });
});

describe('predict chords', () => {
  [
    {
      key: 'C',
      keyIndex: 0,
      scale: 'major',
      expect: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']
    },
    {
      key: 'G',
      keyIndex: 7,
      scale: 'major',
      expect: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim']
    }
  ].forEach(t => {
    test(`predict ${t.key} ${t.scale} chords`, () => {
      const chords = piano.getAllChords(piano.keySet(3), t.keyIndex, t.scale);
      const chordNames = chords.map(c => c.note + c.suffix);
      expect(chordNames).toEqual(t.expect);
    });
  });
});
