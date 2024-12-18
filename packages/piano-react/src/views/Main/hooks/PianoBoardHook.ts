import {
  Chord,
  Inversion,
  Note,
  Piano,
  PianoBoard,
  PianoKey,
  PressType,
  ScaleType,
} from '@stromland/piano-lib';
import { useState } from 'react';

interface PianoBoardState {
  note: Note;
  scale: ScaleType;
  chord: Chord;
  inversion: Inversion;
  type: PressType;
  keys: PianoKey[];
}

export function usePianoBoard(keys = 41) {
  const [state, setState] = useState<PianoBoardState>({
    type: PressType.SCALE,
    note: 'C',
    scale: 'major',
    inversion: Inversion.ROOT,
    chord: { note: 'C', suffix: '', keyIndexes: [0, 4, 7] },
    keys: Piano.getPianoKeys(keys),
  });

  const pressKeys = (): PianoKey[] => {
    const { chord, inversion, keys, note, scale, type } = state;
    return PianoBoard.getPressedKeys(keys, note, scale, chord, inversion, type);
  };

  const findFirstChord = (note: Note, scale: ScaleType): Chord => {
    const chords = PianoBoard.getAllChords(state.keys, note, scale);
    return chords[0];
  };

  return {
    ...state,
    keys: pressKeys(),
    chords: PianoBoard.getAllChords(state.keys, state.note, state.scale),
    selectType: (type: PressType): void => setState({ ...state, type }),
    selectNote: (note: Note): void =>
      setState({ ...state, chord: findFirstChord(note, state.scale), note }),
    selectScale: (scale: ScaleType): void =>
      setState({ ...state, chord: findFirstChord(state.note, scale), scale }),
    selectChord: (chord: Chord): void => setState({ ...state, chord }),
    selectInversion: (inversion: Inversion): void =>
      setState({ ...state, inversion }),
  };
}
