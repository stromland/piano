import {
  LETTERS,
  NOTES_PER_OCTAVE,
  accidentalFor,
  spellNote,
  toPitchClass,
} from './notes.js';

type Tonality = 'major' | 'minor';

interface ScaleSpec {
  name: string;
  /** Semitone steps of the seven-note scale the note names are taken from. */
  steps: readonly number[];
  /** Which of those seven degrees the scale actually contains. */
  degrees: readonly number[];
  /** Decides whether a black-key root is spelled as a sharp or a flat. */
  tonality: Tonality;
}

const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1] as const;
const MINOR_STEPS = [2, 1, 2, 2, 1, 2, 2] as const;
const HARMONIC_MINOR_STEPS = [2, 1, 2, 2, 1, 3, 1] as const;
const ALL_DEGREES = [0, 1, 2, 3, 4, 5, 6] as const;

const TONALITY_STEPS: Record<Tonality, readonly number[]> = {
  major: MAJOR_STEPS,
  minor: MINOR_STEPS,
};

export const SCALES = {
  major: {
    name: 'Major',
    steps: MAJOR_STEPS,
    degrees: ALL_DEGREES,
    tonality: 'major',
  },
  minor: {
    name: 'Minor',
    steps: MINOR_STEPS,
    degrees: ALL_DEGREES,
    tonality: 'minor',
  },
  harmonicMinor: {
    name: 'Harmonic minor',
    steps: HARMONIC_MINOR_STEPS,
    degrees: ALL_DEGREES,
    tonality: 'minor',
  },
  pentatonicMajor: {
    name: 'Pentatonic major',
    steps: MAJOR_STEPS,
    degrees: [0, 1, 2, 4, 5],
    tonality: 'major',
  },
  pentatonicMinor: {
    name: 'Pentatonic minor',
    steps: MINOR_STEPS,
    degrees: [0, 2, 3, 4, 6],
    tonality: 'minor',
  },
} as const satisfies Record<string, ScaleSpec>;

export type ScaleType = keyof typeof SCALES;

export const SCALE_TYPES = Object.keys(SCALES) as ScaleType[];

export interface ScaleNote {
  /** 0 = C … 11 = B. */
  pitchClass: number;
  /** Semitones above the root of the scale. */
  interval: number;
  /** ASCII spelling such as `'Eb'` or `'F#'`; see `formatNoteName`. */
  name: string;
}

interface SpelledNote extends ScaleNote {
  accidental: number;
}

/** Spells seven notes from `root`, giving each one the next letter. */
function spellFrom(
  root: number,
  rootLetter: number,
  steps: readonly number[],
): SpelledNote[] {
  let interval = 0;
  return steps.map((step, degree) => {
    const letter = (rootLetter + degree) % LETTERS.length;
    const pitchClass = toPitchClass(root + interval);
    const accidental = accidentalFor(pitchClass, letter);
    const note: SpelledNote = {
      pitchClass,
      interval,
      accidental,
      name: spellNote(letter, accidental),
    };
    interval += step;
    return note;
  });
}

/**
 * A black key can be named after the letter below it (sharp) or above it
 * (flat). Picks the name whose key signature needs the fewest accidentals,
 * and flats when it is a tie: E♭ major rather than D♯ major, but C♯ minor
 * rather than D♭ minor.
 */
function pickRootLetter(root: number, tonality: Tonality): number {
  const candidates = LETTERS.map((_, letter) => {
    const accidental = accidentalFor(root, letter);
    const cost = spellFrom(root, letter, TONALITY_STEPS[tonality])
      .map((note) => Math.abs(note.accidental))
      .reduce((sum, count) => sum + count, 0);
    return { letter, accidental, cost };
  }).filter(({ accidental }) => Math.abs(accidental) <= 1);

  candidates.sort((a, b) => a.cost - b.cost || a.accidental - b.accidental);
  return candidates[0]?.letter ?? 0;
}

/** The notes of a scale, from the root upwards, correctly spelled. */
export function getScaleNotes(root: number, type: ScaleType): ScaleNote[] {
  const scale: ScaleSpec = SCALES[type];
  const pitchClass = toPitchClass(root);
  const rootLetter = pickRootLetter(pitchClass, scale.tonality);
  const notes = spellFrom(pitchClass, rootLetter, scale.steps);
  return scale.degrees.flatMap((degree) => {
    const note = notes[degree];
    return note
      ? [
          {
            pitchClass: note.pitchClass,
            interval: note.interval,
            name: note.name,
          },
        ]
      : [];
  });
}

/** What each of the twelve keys is called when it is the root of `type`. */
export function getRootNames(type: ScaleType): string[] {
  return Array.from(
    { length: NOTES_PER_OCTAVE },
    (_, root) => getScaleNotes(root, type)[0]?.name ?? '',
  );
}

/**
 * Key indexes of one octave of the scale starting at `rootIndex`, ending on
 * the root an octave up.
 */
export function getScaleKeyIndexes(
  rootIndex: number,
  type: ScaleType,
): number[] {
  const intervals = getScaleNotes(rootIndex, type).map((note) => note.interval);
  return [...intervals, NOTES_PER_OCTAVE].map(
    (interval) => rootIndex + interval,
  );
}
