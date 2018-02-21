import React from 'react';
import piano from 'services/piano';
import Selector from './selector';

const NoteSelector = props => {
  const notes = piano.keySet(1).map(k => k.note);
  const options = notes.map((n, i) => ({ key: n, value: i }));
  return <Selector options={options} {...props} />;
};

export default NoteSelector;
