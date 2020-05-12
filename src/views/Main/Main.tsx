import React from "react";

import { PianoKeys } from "components/PianoKeys/PianoKeys";
import { Footer } from "components/Footer/Footer";

import { usePianoBoard } from "./hooks/PianoBoardHook";

import styles from "./Main.module.css";
import { ScaleSelector } from "./components/ScaleSelector";
import { TypeSelector } from "./components/TypeSelector";
import { PressType } from "services/PianoBoard";
import { Dropdown } from "components/Dropdown/Dropdown";
import { PIANO_NOTES } from "services/Piano";
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
    selectInversion,
  } = usePianoBoard();

  return (
    <div className={styles.container}>
      <PianoKeys keys={keys} />
      <div>
        <Dropdown
          items={PIANO_NOTES.map((it) => it)}
          onSelect={selectNote}
          selectedOption={note}
          toOption={(option) => ({
            id: option,
            label: option,
            content: option,
          })}
        />
        <TypeSelector type={type} handleSelectType={selectType} />
        <ScaleSelector scale={scale} handleSelectScale={selectScale} />
        {type === PressType.CHORD && (
          <>
            <Dropdown
              items={chords}
              onSelect={selectChord}
              selectedOption={chord}
              toOption={(option) => ({
                id: option.note,
                label: option.note,
                content: option,
              })}
            />
            <Dropdown
              items={[Inversion.ROOT, Inversion.FIRST, Inversion.SECOND]}
              onSelect={selectInversion}
              selectedOption={inversion}
              toOption={(option) => ({
                id: option,
                label: getInversionLabel(option),
                content: option,
              })}
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function getInversionLabel(inversion: Inversion): string {
  switch (inversion) {
    case Inversion.ROOT:
      return "Root";
    case Inversion.FIRST:
      return "First";
    case Inversion.SECOND:
      return "Second";
  }
}
