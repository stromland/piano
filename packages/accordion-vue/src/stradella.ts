import {
  CHORD_TYPES,
  type ChordType,
  toPitchClass,
} from '@stromland/music-theory';

/**
 * The rows of the Stradella bass, from the bellows outwards: two of bass
 * buttons and four of chord buttons.
 */
export const ROWS = [
  'counterbass',
  'fundamental',
  'major',
  'minor',
  'seventh',
  'diminished',
] as const;

export type Row = (typeof ROWS)[number];

export type BassRow = 'counterbass' | 'fundamental';
export type ChordRow = Exclude<Row, BassRow>;

export const ROW_NAMES: Record<Row, string> = {
  counterbass: 'Counterbass',
  fundamental: 'Bass',
  major: 'Major',
  minor: 'Minor',
  seventh: '7th',
  diminished: 'Dim',
};

/**
 * The notes each chord button sounds, counted from its column's fundamental
 * bass. The seventh and diminished buttons leave a note out: C7 sounds C E B♭
 * without the 5th, C° sounds C E♭ A, a diminished 7th without its ♭5.
 */
export const CHORD_ROW_INTERVALS: Record<ChordRow, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  seventh: [0, 4, 10],
  diminished: [0, 3, 9],
};

const CHORD_ROW_SUFFIXES: Record<ChordRow, string> = {
  major: '',
  minor: 'm',
  seventh: '7',
  diminished: '°',
};

/**
 * The line of fifths the columns follow. A 120-bass has the first twenty, from
 * B𝄫 at the top to A♯ at the bottom; the last four are only reached as the
 * counterbasses of the bottom columns.
 */
const LINE_OF_FIFTHS = [
  'Bbb',
  'Fb',
  'Cb',
  'Gb',
  'Db',
  'Ab',
  'Eb',
  'Bb',
  'F',
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#',
  'G#',
  'D#',
  'A#',
  'E#',
  'B#',
  'F##',
  'C##',
] as const;

/** How many columns a 120-bass has. */
export const COLUMN_COUNT = 20;

/** The column of C, the button with a dimple that the hand finds by touch. */
export const C_COLUMN = LINE_OF_FIFTHS.indexOf('C');

/** A counterbass is a major 3rd up, four fifths along the line of fifths. */
const COUNTERBASS_FIFTHS = 4;

/** What each column's fundamental bass is called, from the top. */
export const COLUMN_NAMES: readonly string[] = LINE_OF_FIFTHS.slice(
  0,
  COLUMN_COUNT,
);

/** Pitch class of a column's fundamental bass: 0 = C … 11 = B. */
export function columnPitchClass(column: number): number {
  return toPitchClass((column - C_COLUMN) * 7);
}

export interface ButtonPosition {
  row: Row;
  column: number;
}

export interface StradellaButton extends ButtonPosition {
  /** ASCII name such as `'Bb'` or `'F#m'`; see `formatNoteName`. */
  name: string;
  /** What the button sounds, lowest first as a chord is written. */
  pitchClasses: number[];
}

export function getButton(row: Row, column: number): StradellaButton {
  const fundamental = columnPitchClass(column);
  if (row === 'counterbass') {
    return {
      row,
      column,
      name: LINE_OF_FIFTHS[column + COUNTERBASS_FIFTHS] ?? '',
      pitchClasses: [toPitchClass(fundamental + 4)],
    };
  }
  const name = COLUMN_NAMES[column] ?? '';
  if (row === 'fundamental') {
    return { row, column, name, pitchClasses: [fundamental] };
  }
  return {
    row,
    column,
    name: `${name}${CHORD_ROW_SUFFIXES[row]}`,
    pitchClasses: CHORD_ROW_INTERVALS[row].map((interval) =>
      toPitchClass(fundamental + interval),
    ),
  };
}

/**
 * The column whose fundamental bass is `pitchClass`. A note spelled the way a
 * column is named gets that column, G♭ the one above and F♯ the one below;
 * otherwise the one nearest `near`.
 */
export function findColumn(
  pitchClass: number,
  { name, near = C_COLUMN }: { name?: string; near?: number } = {},
): number {
  const named = name === undefined ? -1 : COLUMN_NAMES.indexOf(name);
  if (named >= 0 && columnPitchClass(named) === toPitchClass(pitchClass)) {
    return named;
  }
  const columns = COLUMN_NAMES.map((_, column) => column).filter(
    (column) => columnPitchClass(column) === toPitchClass(pitchClass),
  );
  return columns.reduce((best, column) =>
    Math.abs(column - near) < Math.abs(best - near) ? column : best,
  );
}

export interface BassChord {
  /** The fundamental bass of the chord's root. */
  bass: ButtonPosition;
  /** The chord button played with it. */
  chord: ButtonPosition;
  /**
   * Whether the chord button belongs to another root, as with a combined
   * chord: Cmaj7 is the C bass with the Em button.
   */
  combined: boolean;
  /**
   * The fundamental bass a fifth up, for the alternating bass. Only chords
   * with a perfect 5th have one.
   */
  alternate: ButtonPosition | undefined;
}

const CHORD_ROWS = ROWS.filter(
  (row): row is ChordRow => row in CHORD_ROW_INTERVALS,
);

/**
 * How the left hand plays a chord on the Stradella bass: its fundamental bass
 * and the chord button that, with it, sounds only notes of the chord, among
 * them its 3rd and, for a seventh chord, its 7th. A button in the root's own
 * column comes first, then the nearest. Chords without a 3rd (sus), or with
 * no such button (the augmented triad), have none and are played with the
 * right hand alone.
 */
export function getBassChord(
  root: number,
  type: ChordType,
  rootName?: string,
): BassChord | undefined {
  const intervals: readonly number[] = CHORD_TYPES[type].intervals;
  const third = intervals[1];
  if (third !== 3 && third !== 4) return undefined;
  const needed = [third, ...intervals.slice(3)].map((interval) =>
    toPitchClass(root + interval),
  );
  const chordNotes = new Set(
    intervals.map((interval) => toPitchClass(root + interval)),
  );

  const bassColumn = findColumn(root, { name: rootName });
  const candidates = COLUMN_NAMES.flatMap((_, column) =>
    CHORD_ROWS.map((row) => getButton(row, column)),
  )
    .filter((button) => {
      const sounding = [toPitchClass(root), ...button.pitchClasses];
      return (
        sounding.every((note) => chordNotes.has(note)) &&
        needed.every((note) => sounding.includes(note))
      );
    })
    .sort(
      (a, b) =>
        Math.abs(a.column - bassColumn) - Math.abs(b.column - bassColumn),
    );
  const button = candidates[0];
  if (!button) return undefined;

  const fifth = toPitchClass(root + 7);
  return {
    bass: { row: 'fundamental', column: bassColumn },
    chord: { row: button.row, column: button.column },
    combined: button.column !== bassColumn,
    alternate: intervals.includes(7)
      ? {
          row: 'fundamental',
          column: findColumn(fifth, { near: bassColumn + 1 }),
        }
      : undefined,
  };
}

/** Every note the left hand sounds for `bassChord`, the bass first. */
export function bassChordPitchClasses(bassChord: BassChord): number[] {
  const bass = getButton(bassChord.bass.row, bassChord.bass.column);
  const chord = getButton(bassChord.chord.row, bassChord.chord.column);
  return [...bass.pitchClasses, ...chord.pitchClasses].filter(
    (note, position, notes) => notes.indexOf(note) === position,
  );
}
