import React from "react";
import { PIANO_NOTES, Note } from "services/Piano";
import { ToggleButton } from "components/button/ToggleButton";

import styles from "./Selector.module.css";

interface NoteSelectorProps {
  selectedNote: Note;
  handleSelectNote: (note: Note) => void;
}

export function NoteSelector({
  handleSelectNote,
  selectedNote
}: NoteSelectorProps) {
  return (
    <div className={styles.container}>
      {PIANO_NOTES.map(note => (
        <ToggleButton
          key={note}
          pressed={note === selectedNote}
          onClick={() => handleSelectNote(note)}
        >
          {note}
        </ToggleButton>
      ))}
    </div>
  );
}
