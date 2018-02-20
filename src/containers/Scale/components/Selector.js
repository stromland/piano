import React from 'react';
import styled from 'styled-components';
import piano from '../../../service/piano';

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

const Selector = ({ onSelect, options }) => (
  <select onChange={onSelect}>
    {options.map(opt => (
      <option key={opt.key} value={opt.value}>
        {opt.key}
      </option>
    ))}
  </select>
);

const Button = styled.button`
  flex: 1;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  border-bottom: 3px solid var(--accent-dark);
  background: ${({ active }) =>
    active ? 'var(--accent-dark)' : 'var(--accent)'};
  padding: 5px 10px;
  margin: 10px;

  &:hover {
    background: #d8af4f;
  }

  &:active {
    background: var(--accent-dark);
  }

  &:focus {
    outline: 0 !important;
  }
`;

const NoteContainer = styled.div`
  display: flex;
`;

const NoteSelector = ({ onSelect, activeKey }) => {
  const notes = piano.keySet(1).map(k => k.note);
  const options = notes.map((n, i) => ({ key: n, value: i }));
  return (
    <NoteContainer>
      {options.map(opt => (
        <Button
          key={opt.key}
          active={opt.value === activeKey}
          onClick={() => onSelect(opt.value)}
        >
          {opt.key}
        </Button>
      ))}
    </NoteContainer>
  );
};

const ScaleSelector = ({ onSelect, activeKey }) => {
  const options = Object.keys(piano.scales).map(k => ({
    key: capitalize(k),
    value: k
  }));
  return (
    <NoteContainer>
      {options.map(opt => (
        <Button
          key={opt.key}
          active={opt.value === activeKey}
          onClick={() => onSelect(opt.value)}
        >
          {opt.key}
        </Button>
      ))}
    </NoteContainer>
  );
};

export { NoteSelector, ScaleSelector };
