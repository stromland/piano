import { useState } from "react";

import { PianoKey } from "models/PianoKey";
import { Note, Piano } from "services/Piano";
import { ScaleType } from "services/Scale";
import { PianoBoard } from "services/PianoBoard";

interface PianoBoardState {
  note: Note;
  scale: ScaleType;
  keys: PianoKey[];
}

export function usePianoBoard(keys: number = 41) {
  const [state, setState] = useState<PianoBoardState>({
    note: "C",
    scale: "major",
    keys: Piano.getPianoKeys(keys)
  });

  return {
    ...state,
    keys: PianoBoard.pressAllScaleKeys(state.keys, state.note, state.scale),
    selectNote: (note: Note) => setState({ ...state, note }),
    selectScale: (scale: ScaleType) => setState({ ...state, scale })
  };
}
