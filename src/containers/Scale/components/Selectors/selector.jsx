import React from 'react';
import styled from 'styled-components';
import ToggleButton from 'components/ToggleButton';

const NoteContainer = styled.div`
  display: flex;
`;

const Selector = ({ onSelect, options, activeKey }) => (
  <NoteContainer>
    {options.map(opt => (
      <ToggleButton
        key={opt.key}
        active={opt.value === activeKey}
        onClick={() => onSelect(opt.value)}
      >
        {opt.key}
      </ToggleButton>
    ))}
  </NoteContainer>
);

export default Selector;
