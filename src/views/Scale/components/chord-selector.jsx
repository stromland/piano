import React from 'react';
import piano from 'services/piano';
import Selector from 'components/Selector';

const ChordSelector = ({ selectedKey, scaleName, ...rest }) => {
  const chords = piano.getAllChords(selectedKey, scaleName);
  const options = chords.map(c => ({
    key: c.note + c.suffix,
    value: c.indexes
  }));
  return <Selector options={options} {...rest} />;
};

export default ChordSelector;
