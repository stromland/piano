import { Inversion, Piano, PianoBoard, PressType } from '@stromland/piano-lib';
import type { Chord, Note, PianoKey, ScaleType } from '@stromland/piano-lib';
import { computed, reactive, watch } from 'vue';

type State = {
  note: Note;
  scale: ScaleType;
  keys: PianoKey[];
  inversion: Inversion;
  pressType: PressType;
  chord?: Chord;
};

export function usePiano() {
  const state = reactive<State>({
    note: 'C',
    scale: 'major',
    keys: Piano.getPianoKeys(49),
    inversion: Inversion.ROOT,
    pressType: PressType.SCALE,
    chord: undefined,
  });

  const chords = computed(() => {
    return PianoBoard.getAllChords(state.keys, state.note, state.scale);
  });

  state.chord = chords.value[0];

  watch(chords, (newChords) => {
    state.chord = newChords[0];
  });

  const pressedKeys = computed(() => {
    if (state.pressType === PressType.SCALE) {
      return PianoBoard.pressAllScaleKeys(state.keys, state.note, state.scale);
    }
    if (state.pressType === PressType.CHORD && state.chord) {
      return PianoBoard.pressChordKeys(
        state.keys,
        state.chord,
        state.inversion
      );
    }
    return state.keys;
  });

  const selectNote = (note: Note) => (state.note = note);
  const selectScale = (scale: ScaleType) => (state.scale = scale);
  const selectChord = (chord: Chord) => (state.chord = chord);
  const selectType = (type: PressType) => (state.pressType = type);
  const selectInversion = (inversion: Inversion) =>
    (state.inversion = inversion);

  return {
    pressedKeys,
    chords,
    state,
    select: {
      note: selectNote,
      scale: selectScale,
      chord: selectChord,
      type: selectType,
      inversion: selectInversion,
    },
  };
}
