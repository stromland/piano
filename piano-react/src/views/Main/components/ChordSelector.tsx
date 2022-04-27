import React from "react";
import { Chord } from "services/TriadChord";
import { ToggleButton } from "components/ToggleButton/ToggleButton";

import styles from "./Selector.module.css";

interface ChordSelectorProps {
  chords: Chord[];
  selectedChord: Chord;
  handleSelectChord: (chord: Chord) => void;
}

export const ChordSelector = ({
  chords,
  handleSelectChord,
  selectedChord
}: ChordSelectorProps) => {
  return (
    <div className={styles.container}>
      {chords.map(chord => (
        <ChordButton
          key={chord.note}
          chord={chord}
          selectedChord={selectedChord}
          handleSelectChord={handleSelectChord}
        />
      ))}
    </div>
  );
};

interface ChordButtonProps {
  chord: Chord;
  handleSelectChord: (chord: Chord) => void;
  selectedChord: Chord;
}

const ChordButton = ({
  chord,
  handleSelectChord,
  selectedChord
}: ChordButtonProps) => {
  const createChordName = (chord: Chord) => chord.note + chord.suffix;
  const chordName = createChordName(chord);
  const selectedChordName = createChordName(selectedChord);

  return (
    <ToggleButton
      key={chordName}
      pressed={chordName === selectedChordName}
      onClick={() => handleSelectChord(chord)}
    >
      {chordName}
    </ToggleButton>
  );
};
