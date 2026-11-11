import { type ComputedRef, computed } from 'vue';

import {
  type Board,
  CHORD_TYPES,
  SCALES,
  type Selection,
  type Tonality,
  findKeysWithChord,
  formatNoteName,
  getKeyName,
  getRelatedKey,
  getScaleSteps,
  intervalName,
} from '@stromland/piano-lib';

import type { PlayStyle } from './useSound';

export interface Explanation {
  heading: string;
  paragraphs: string[];
  listen: { label: string; style: PlayStyle }[];
  tonesTitle: string;
  tones: { name: string; degree: string; interval: string; root: boolean }[];
  /** Whole and half steps between the notes of a scale. */
  steps: string[];
  /** Chords of the key that commonly follow the selected one. */
  next: { index: number; numeral: string; name: string }[];
  /** Keys that have the selected chord. */
  foundIn: { numeral: string; key: string }[];
  note: string;
}

const STEP_NAMES: Record<number, string> = { 1: 'H', 2: 'W', 3: 'W+H' };

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

const key = (tonic: number, tonality: Tonality) =>
  formatNoteName(getKeyName(tonic, tonality));

/** Explains the selected scale, chord or chord of a key, for learning. */
export function useExplanation(
  selection: Selection,
  board: ComputedRef<Board>,
  title: ComputedRef<string>,
): ComputedRef<Explanation> {
  return computed(() => {
    const { tones, chord, keyChord, keyChords } = board.value;
    const explanation: Explanation = {
      heading: title.value,
      paragraphs: [],
      listen: [
        { label: 'Together', style: 'together' },
        { label: 'One by one', style: 'oneByOne' },
      ],
      tonesTitle: 'How it is built',
      tones: tones.map((note, index) => ({
        name: formatNoteName(note.name),
        degree: formatNoteName(note.degree),
        interval: intervalName(note.degree),
        root: index === 0,
      })),
      steps: [],
      next: [],
      foundIn: [],
      note: '',
    };

    if (selection.view === 'scale') {
      const scale = SCALES[selection.scale];
      explanation.paragraphs = [scale.description];
      explanation.listen = [
        { label: 'Up', style: 'oneByOne' },
        { label: 'Up and down', style: 'upAndDown' },
      ];
      explanation.tonesTitle = 'Notes';
      explanation.steps = getScaleSteps(selection.scale).map(
        (step) => STEP_NAMES[step] ?? String(step),
      );
      const related = getRelatedKey(selection.root, selection.scale);
      if (related && scale.group === 'modes') {
        explanation.note = `Same notes as ${key(related.tonic, related.tonality)}, starting on its ${ORDINALS[related.startsOn] ?? ''} note.`;
      } else if (related) {
        explanation.note = `Relative ${related.tonality}: ${key(related.tonic, related.tonality)}, with the same notes.`;
      }
    }

    if (selection.view === 'chord' && chord) {
      const type = CHORD_TYPES[chord.type];
      explanation.heading = `${title.value} · ${type.name}`;
      explanation.paragraphs = [type.description];
      explanation.foundIn = findKeysWithChord(selection.root, chord.type).map(
        (found) => ({
          numeral: found.numeral,
          key: key(found.tonic, found.tonality),
        }),
      );
      explanation.note =
        explanation.foundIn.length === 0 && 'outsideKeys' in type
          ? type.outsideKeys
          : '';
    }

    if (selection.view === 'key' && chord && keyChord) {
      const type = CHORD_TYPES[chord.type];
      const name = formatNoteName(chord.name);
      explanation.heading = `${keyChord.numeral} in ${key(selection.root, selection.tonality)}`;
      explanation.paragraphs = [
        keyChord.description,
        `${name} is a ${type.name.toLowerCase()} chord. ${type.description}`,
      ];
      explanation.next = keyChord.next.flatMap((index) =>
        keyChords.slice(index, index + 1).map((next) => ({
          index,
          numeral: next.numeral,
          name: formatNoteName(next.chord.name),
        })),
      );
    }

    return explanation;
  });
}
