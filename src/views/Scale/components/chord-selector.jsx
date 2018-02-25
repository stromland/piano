import React from 'react';
import piano from 'services/piano';
import Selector from 'components/Selector';

const ChordSelector = ({ pianoKeys, selectedKey, scaleName }) => {
  const chords = piano.getAllChords(pianoKeys, selectedKey, scaleName);
  const options = chords.map(c => ({ key: c.key, value: c.chordKeys }));
  return <Selector options={options} />;
};

export default ChordSelector;
