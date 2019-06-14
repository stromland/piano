import React from "react";

import { PianoKeys } from "components/pianokeys/PianoKeys";
import { ToggleButton } from "components/button/ToggleButton";
import { usePianoBoard } from "views/Main/hooks/PianoBoardHook";

import { NoteSelector } from "./components/NoteSelector";
import { Footer } from "./components/Footer";

import styles from "./Main.module.css";
import { ChordSelector } from "./components/ChordSelector";
import { PressType } from "services/PianoBoard";
import { Inversion } from "services/TriadChord";

export function Main() {
  const {
    note,
    scale,
    keys,
    chord,
    inversion,
    type,
    chords,
    selectType,
    selectNote,
    selectScale,
    selectChord,
    selectInversion
  } = usePianoBoard();

  return (
    <div className={styles.container}>
      <PianoKeys keys={keys} />
      <div>
        <ToggleButton
          pressed={type === PressType.SCALE}
          onClick={() => selectType(PressType.SCALE)}
        >
          Scale
        </ToggleButton>
        <ToggleButton
          pressed={type === PressType.CHORD}
          onClick={() => selectType(PressType.CHORD)}
        >
          Chord
        </ToggleButton>
      </div>
      <NoteSelector handleSelectNote={selectNote} selectedNote={note} />
      <ChordSelector
        chords={chords}
        handleSelectChord={selectChord}
        selectedChord={chord}
      />
      <div>
        <ToggleButton
          pressed={inversion === Inversion.ROOT}
          onClick={() => selectInversion(Inversion.ROOT)}
        >
          Root
        </ToggleButton>
        <ToggleButton
          pressed={inversion === Inversion.FIRST}
          onClick={() => selectInversion(Inversion.FIRST)}
        >
          First
        </ToggleButton>
        <ToggleButton
          pressed={inversion === Inversion.SECOND}
          onClick={() => selectInversion(Inversion.SECOND)}
        >
          Second
        </ToggleButton>
      </div>
      <div>
        <ToggleButton
          pressed={scale === "major"}
          onClick={() => selectScale("major")}
        >
          Major
        </ToggleButton>
        <ToggleButton
          pressed={scale === "minor"}
          onClick={() => selectScale("minor")}
        >
          Minor
        </ToggleButton>
      </div>
      <Footer />
    </div>
  );
}
