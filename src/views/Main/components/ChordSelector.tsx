import React from "react";
import { Chord } from "services/TriadChord";
import { ToggleButton } from "components/button/ToggleButton";

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
  const createChordName = (chord: Chord) => chord.note + chord.suffix;
  return (
    <div className={styles.container}>
      {chords.map(chord => (
        <ToggleButton
          key={createChordName(chord)}
          pressed={createChordName(chord) === createChordName(selectedChord)}
          onClick={() => handleSelectChord(chord)}
        >
          {createChordName(chord)}
        </ToggleButton>
      ))}
    </div>
  );
};
