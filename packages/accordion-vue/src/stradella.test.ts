import { describe, expect, it } from 'vitest';

import { CHORD_TYPES, type ChordType } from '@stromland/music-theory';

import {
  COLUMN_COUNT,
  COLUMN_NAMES,
  C_COLUMN,
  ROWS,
  bassChordPitchClasses,
  columnPitchClass,
  findColumn,
  getBassChord,
  getButton,
} from './stradella';

const C = 0;
const name = (row: (typeof ROWS)[number], columnName: string) =>
  getButton(row, COLUMN_NAMES.indexOf(columnName)).name;
const notes = (row: (typeof ROWS)[number], columnName: string) =>
  getButton(row, COLUMN_NAMES.indexOf(columnName)).pitchClasses;

describe('the columns', () => {
  it('are the twenty of a 120-bass, from B𝄫 to A♯', () => {
    expect(COLUMN_COUNT).toBe(20);
    expect(COLUMN_NAMES[0]).toBe('Bbb');
    expect(COLUMN_NAMES.at(-1)).toBe('A#');
    expect(COLUMN_COUNT * ROWS.length).toBe(120);
  });

  it('go a fifth down the bass at a time, with C in the tenth', () => {
    expect(C_COLUMN).toBe(9);
    expect(COLUMN_NAMES.slice(C_COLUMN - 3, C_COLUMN + 4)).toEqual([
      'Eb',
      'Bb',
      'F',
      'C',
      'G',
      'D',
      'A',
    ]);
    for (let column = 1; column < COLUMN_COUNT; column++) {
      expect(columnPitchClass(column)).toBe(
        (columnPitchClass(column - 1) + 7) % 12,
      );
    }
  });
});

describe('getButton', () => {
  it('puts the counterbass a major 3rd above the fundamental bass', () => {
    expect(name('counterbass', 'C')).toBe('E');
    expect(name('counterbass', 'Bbb')).toBe('Db');
    expect(name('counterbass', 'A#')).toBe('C##');
    expect(notes('counterbass', 'C')).toEqual([4]);
  });

  it('names and sounds the chord buttons of a column', () => {
    expect(name('fundamental', 'Bb')).toBe('Bb');
    expect(name('major', 'C')).toBe('C');
    expect(notes('major', 'C')).toEqual([0, 4, 7]);
    expect(name('minor', 'A')).toBe('Am');
    expect(notes('minor', 'A')).toEqual([9, 0, 4]);
  });

  it('leaves the 5th out of the seventh and diminished buttons', () => {
    expect(name('seventh', 'G')).toBe('G7');
    expect(notes('seventh', 'G')).toEqual([7, 11, 5]);
    expect(name('diminished', 'C')).toBe('C°');
    expect(notes('diminished', 'C')).toEqual([0, 3, 9]);
  });
});

describe('findColumn', () => {
  it('takes the column a note is spelled like', () => {
    expect(findColumn(6, { name: 'F#' })).toBe(COLUMN_NAMES.indexOf('F#'));
    expect(findColumn(6, { name: 'Gb' })).toBe(COLUMN_NAMES.indexOf('Gb'));
  });

  it('otherwise takes the column nearest the one asked for', () => {
    expect(findColumn(6)).toBe(COLUMN_NAMES.indexOf('Gb'));
    expect(findColumn(6, { near: 15 })).toBe(COLUMN_NAMES.indexOf('F#'));
    expect(findColumn(6, { name: 'C' })).toBe(COLUMN_NAMES.indexOf('Gb'));
  });
});

describe('getBassChord', () => {
  const left = (type: ChordType, root = C, rootName?: string) => {
    const bassChord = getBassChord(root, type, rootName);
    if (!bassChord) return undefined;
    return {
      bass: getButton(bassChord.bass.row, bassChord.bass.column).name,
      chord: getButton(bassChord.chord.row, bassChord.chord.column).name,
      combined: bassChord.combined,
      alternate:
        bassChord.alternate &&
        getButton(bassChord.alternate.row, bassChord.alternate.column).name,
    };
  };

  it('plays a chord with a button of its own with the bass of its column', () => {
    expect(left('major')).toEqual({
      bass: 'C',
      chord: 'C',
      combined: false,
      alternate: 'G',
    });
    expect(left('minor', 9)).toMatchObject({ bass: 'A', chord: 'Am' });
    expect(left('dominant7', 7)).toMatchObject({ bass: 'G', chord: 'G7' });
    expect(left('diminished7')).toMatchObject({ bass: 'C', chord: 'C°' });
  });

  it('combines the bass with the chord button of another root', () => {
    expect(left('major7')).toMatchObject({ chord: 'Em', combined: true });
    expect(left('minor7')).toMatchObject({ chord: 'Eb', combined: true });
    expect(left('halfDiminished7')).toMatchObject({
      chord: 'Ebm',
      combined: true,
    });
    // The E♭ diminished button sounds E♭ G♭ C, so with the C bass it is Cdim.
    expect(left('diminished')).toMatchObject({
      chord: 'Eb°',
      combined: true,
    });
  });

  it('only sounds notes of the chord, with its 3rd and its 7th', () => {
    const playable: ChordType[] = [
      'major',
      'minor',
      'dominant7',
      'diminished7',
      'major7',
      'minor7',
      'halfDiminished7',
      'diminished',
    ];
    for (const type of playable) {
      for (let root = 0; root < 12; root++) {
        const bassChord = getBassChord(root, type);
        expect(bassChord, `${type} on ${root}`).toBeDefined();
        if (!bassChord) continue;
        const chordNotes = CHORD_TYPES[type].intervals.map(
          (interval) => (root + interval) % 12,
        );
        const sounding = bassChordPitchClasses(bassChord);
        expect(sounding[0]).toBe(root);
        expect(chordNotes).toEqual(expect.arrayContaining(sounding));
        expect(sounding).toContain(chordNotes[1]);
        if (chordNotes.length === 4) expect(sounding).toContain(chordNotes[3]);
      }
    }
  });

  it('leaves chords without a button to the right hand', () => {
    expect(left('sus2')).toBeUndefined();
    expect(left('sus4')).toBeUndefined();
    expect(left('augmented')).toBeUndefined();
  });

  it('only alternates with the fifth of a chord that has a perfect 5th', () => {
    expect(left('dominant7', 7)?.alternate).toBe('D');
    expect(left('major7')?.alternate).toBe('G');
    expect(left('halfDiminished7')?.alternate).toBeUndefined();
    expect(left('diminished7')?.alternate).toBeUndefined();
  });

  it('uses the column the root is spelled like', () => {
    const bassChord = getBassChord(6, 'major', 'F#');
    expect(bassChord?.bass.column).toBe(COLUMN_NAMES.indexOf('F#'));
    expect(bassChord?.alternate?.column).toBe(COLUMN_NAMES.indexOf('C#'));
  });

  it('finds the alternating bass above the bottom column', () => {
    const bassChord = getBassChord(10, 'major', 'A#');
    expect(bassChord?.bass.column).toBe(COLUMN_COUNT - 1);
    expect(bassChord?.alternate?.column).toBe(COLUMN_NAMES.indexOf('F'));
  });
});
