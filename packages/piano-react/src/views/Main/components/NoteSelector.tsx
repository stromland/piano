import React, { FC } from 'react';
import { PIANO_NOTES, Note } from '@stromland/piano-lib';
import { ToggleButton } from 'components/ToggleButton/ToggleButton';

import styles from './Selector.module.css';

interface NoteSelectorProps {
  selectedNote: Note;
  handleSelectNote: (note: Note) => void;
}

export const NoteSelector: FC<NoteSelectorProps> = ({
  handleSelectNote,
  selectedNote,
}) => {
  return (
    <div className={styles.container}>
      {PIANO_NOTES.map((note) => (
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
};
