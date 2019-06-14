import { useState } from "react";

import { PianoKey } from "models/PianoKey";
import { Note, Piano } from "services/Piano";
import { ScaleType } from "services/Scale";
import { PianoBoard, PressType } from "services/PianoBoard";
import { Chord, Inversion } from "services/TriadChord";

interface PianoBoardState {
  note: Note;
  scale: ScaleType;
  chord: Chord;
  inversion: Inversion;
  type: PressType;
  keys: PianoKey[];
}

export function usePianoBoard(keys: number = 41) {
  const [state, setState] = useState<PianoBoardState>({
    type: PressType.SCALE,
    note: "C",
    scale: "major",
    inversion: Inversion.ROOT,
    chord: { note: "C", suffix: "", keyIndexes: [0, 4, 7] },
    keys: Piano.getPianoKeys(keys)
  });

  const pressKeys = (): PianoKey[] => {
    const { chord, inversion, keys, note, scale, type } = state;
    return PianoBoard.getPressedKeys(keys, note, scale, chord, inversion, type);
  };

  return {
    ...state,
    keys: pressKeys(),
    chords: PianoBoard.getAllChords(state.keys, state.note, state.scale),
    selectType: (type: PressType): void => setState({ ...state, type }),
    selectNote: (note: Note): void => setState({ ...state, note }),
    selectScale: (scale: ScaleType): void => setState({ ...state, scale }),
    selectChord: (chord: Chord): void => setState({ ...state, chord }),
    selectInversion: (inversion: Inversion): void =>
      setState({ ...state, inversion })
  };
}
