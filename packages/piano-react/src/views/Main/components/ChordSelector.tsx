import React, { FC } from "react";
import { Chord } from "services/TriadChord";
import { ToggleButton } from "components/ToggleButton/ToggleButton";

import styles from "./Selector.module.css";

interface ChordSelectorProps {
  chords: Chord[];
  selectedChord: Chord;
  handleSelectChord: (chord: Chord) => void;
}

export const ChordSelector: FC<ChordSelectorProps> = ({
  chords,
  handleSelectChord,
  selectedChord,
}) => {
  return (
    <div className={styles.container}>
      {chords.map((chord) => (
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

const ChordButton: FC<ChordButtonProps> = ({
  chord,
  handleSelectChord,
  selectedChord,
}) => {
  const createChordName = (chord: Chord): string => chord.note + chord.suffix;
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
