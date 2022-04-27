import React, { FC } from "react";

import { PianoKeys } from "components/PianoKeys/PianoKeys";
import { Footer } from "components/Footer/Footer";

import { NoteSelector } from "./components/NoteSelector";
import { ChordSelector } from "./components/ChordSelector";
import { usePianoBoard } from "./hooks/PianoBoardHook";

import styles from "./Main.module.css";
import { InversionSelector } from "./components/InversionSelector";
import { ScaleSelector } from "./components/ScaleSelector";
import { TypeSelector } from "./components/TypeSelector";

export const Main: FC = () => {
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
    selectInversion,
  } = usePianoBoard();

  return (
    <div className={styles.container}>
      <PianoKeys keys={keys} />
      <div>
        <TypeSelector type={type} handleSelectType={selectType} />
        <ScaleSelector scale={scale} handleSelectScale={selectScale} />
        <NoteSelector handleSelectNote={selectNote} selectedNote={note} />
        <ChordSelector
          chords={chords}
          handleSelectChord={selectChord}
          selectedChord={chord}
        />
        <InversionSelector
          inversion={inversion}
          handleSelectInversion={selectInversion}
        />
      </div>
      <Footer />
    </div>
  );
};
