import React from 'react';

const Selector = ({ onSelect, options }) => (
  <select onChange={onSelect}>
    {options.map(opt => (
      <option key={opt.key} value={opt.value}>
        {opt.key}
      </option>
    ))}
  </select>
);

const NoteSelector = ({ onSelect }) => {
  const notes = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'Bb',
    'B'
  ];
  const options = notes.map((n, i) => ({ key: n, value: i }));
  return <Selector onSelect={onSelect} options={options} />;
};

const ScaleSelector = ({ onSelect }) => {
  const majorScale = [2, 2, 1, 2, 2, 2, 1];
  const minorScale = [2, 1, 2, 2, 1, 2, 2];
  const harmonicScale = [2, 1, 2, 2, 1, 3, 1];

  const options = [
    {
      key: 'Major',
      value: majorScale
    },
    {
      key: 'Minor',
      value: minorScale
    },
    {
      key: 'Harmonic',
      value: harmonicScale
    }
  ];
  return <Selector onSelect={onSelect} options={options} />;
};

export { NoteSelector, ScaleSelector };
