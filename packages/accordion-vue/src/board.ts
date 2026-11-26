import {
  type Chord,
  type ChordType,
  MIDDLE_C,
  type PianoKey,
  createKeyboard,
  getChord,
  pressKeys,
} from '@stromland/music-theory';

import {
  type BassChord,
  type ButtonPosition,
  COLUMN_COUNT,
  C_COLUMN,
  ROWS,
  ROW_NAMES,
  type Row,
  type StradellaButton,
  findColumn,
  getBassChord,
  getButton,
} from './stradella';

export interface Selection {
  /** Pitch class of the chord's root: 0 = C … 11 = B. */
  root: number;
  chordType: ChordType;
}

/** The treble of a full-size piano accordion: 41 keys, F3 to A6. */
export const TREBLE_KEY_COUNT = 41;

/** Where the treble starts, counted on a keyboard whose middle C is `MIDDLE_C`. */
export const TREBLE_LOWEST_KEY = MIDDLE_C - 7;

/** How many columns of the Stradella bass are shown at a time. */
export const VISIBLE_COLUMNS = 7;

/** What a button does in the chord shown. */
export type ButtonRole = 'bass' | 'chord' | 'alternate';

export interface BassButton extends StradellaButton {
  role: ButtonRole | undefined;
  /** The beats of the alternating bass it is played on, such as `'2·4'`. */
  beats: string;
  /** The C fundamental bass, which has a dimple. */
  marked: boolean;
}

export interface BassRow {
  row: Row;
  name: string;
  /** The visible buttons, top first. */
  buttons: BassButton[];
}

export interface Beat {
  beat: number;
  button: StradellaButton;
  role: ButtonRole;
}

export interface Board {
  chord: Chord;
  /** How the left hand plays the chord, if it can. */
  bassChord: BassChord | undefined;
  /** The rows of the Stradella bass, from the bellows outwards. */
  bass: BassRow[];
  /** The left hand's pattern, one button per beat, if the chord has one. */
  beats: Beat[];
  treble: PianoKey[];
}

/** Everything needed to draw both hands for a selection. */
export function getBoard(selection: Selection): Board {
  const chord = getChord(selection.root, selection.chordType);
  const rootName = chord.notes[0]?.name;
  const bassChord = getBassChord(selection.root, selection.chordType, rootName);

  const roles = new Map<string, ButtonRole>();
  const beats: Beat[] = [];
  if (bassChord) {
    roles.set(key(bassChord.bass), 'bass');
    roles.set(key(bassChord.chord), 'chord');
    if (bassChord.alternate) {
      roles.set(key(bassChord.alternate), 'alternate');
      const pattern: [ButtonPosition, ButtonRole][] = [
        [bassChord.bass, 'bass'],
        [bassChord.chord, 'chord'],
        [bassChord.alternate, 'alternate'],
        [bassChord.chord, 'chord'],
      ];
      pattern.forEach(([position, role], index) =>
        beats.push({
          beat: index + 1,
          button: getButton(position.row, position.column),
          role,
        }),
      );
    }
  }
  const beatsOf = (role: ButtonRole) =>
    beats
      .filter((beat) => beat.role === role)
      .map((beat) => beat.beat)
      .join('·');

  const columns = visibleColumns(
    bassChord
      ? [bassChord.bass, bassChord.chord, bassChord.alternate]
          .filter((position) => position !== undefined)
          .map((position) => position.column)
      : [findColumn(selection.root, { name: rootName })],
  );

  const bass = ROWS.map((row) => ({
    row,
    name: ROW_NAMES[row],
    buttons: columns.map((column) => {
      const role = roles.get(key({ row, column }));
      return {
        ...getButton(row, column),
        role,
        beats: role ? beatsOf(role) : '',
        marked: row === 'fundamental' && column === C_COLUMN,
      };
    }),
  }));

  const names = new Map(
    chord.notes.map((note) => [note.pitchClass, note.name]),
  );
  const pressed = chord.notes.map(
    (note) => MIDDLE_C + selection.root + note.interval,
  );
  const treble = pressKeys(
    createKeyboard(TREBLE_LOWEST_KEY + TREBLE_KEY_COUNT),
    pressed,
    { names, rootPitchClass: chord.notes[0]?.pitchClass },
  ).slice(TREBLE_LOWEST_KEY);

  return { chord, bassChord, bass, beats, treble };
}

const key = ({ row, column }: ButtonPosition) => `${row}:${column}`;

/**
 * `VISIBLE_COLUMNS` neighbouring columns with the used ones in the middle, as
 * far as the bass reaches.
 */
function visibleColumns(used: readonly number[]): number[] {
  const middle = (Math.min(...used) + Math.max(...used)) / 2;
  const first = Math.min(
    Math.max(0, Math.round(middle - (VISIBLE_COLUMNS - 1) / 2)),
    COLUMN_COUNT - VISIBLE_COLUMNS,
  );
  return Array.from({ length: VISIBLE_COLUMNS }, (_, index) => first + index);
}
