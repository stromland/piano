import React from "react";

import { PianoKeys } from "components/pianokeys/PianoKeys";
import { ToggleButton } from "components/button/ToggleButton";
import { usePianoBoard } from "hooks/PianoBoardHook";

import { NoteSelector } from "./components/NoteSelector";
import { Footer } from "./components/footer/Footer";

import styles from "./Main.module.css";

export function Main() {
  const { note, scale, keys, selectNote, selectScale } = usePianoBoard();

  return (
    <div className={styles.container}>
      <PianoKeys keys={keys} />
      <NoteSelector handleSelectNote={selectNote} selectedNote={note} />
      <div>
        <ToggleButton
          active={scale === "major"}
          onClick={() => selectScale("major")}
        >
          Minor
        </ToggleButton>
        <ToggleButton
          active={scale === "minor"}
          onClick={() => selectScale("minor")}
        >
          Minor
        </ToggleButton>
      </div>
      <Footer />
    </div>
  );
}
