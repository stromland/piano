export { VIEWS, getBoard } from './board.js';
export type { Board, BoardNote, Selection, View } from './board.js';
export { INVERSIONS, TRIADS, getScaleChords, invertTriad } from './chords.js';
export type { Chord, Inversion, TriadQuality } from './chords.js';
export { DEFAULT_KEY_COUNT, createKeyboard, pressKeys } from './keyboard.js';
export type { PianoKey, PressOptions } from './keyboard.js';
export {
  NOTES_PER_OCTAVE,
  formatNoteName,
  isBlackKey,
  naturalNoteName,
  toPitchClass,
} from './notes.js';
export {
  SCALES,
  SCALE_GROUPS,
  SCALE_TYPES,
  getRootNames,
  getScaleKeyIndexes,
  getScaleNotes,
} from './scales.js';
export type { ScaleGroup, ScaleNote, ScaleType } from './scales.js';
