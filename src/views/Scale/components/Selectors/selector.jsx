import React from 'react';
import ToggleButton from 'components/ToggleButton';

const Selector = ({ onSelect, options, selected }) => (
  <div style={{ display: 'flex' }}>
    {options.map(opt => (
      <ToggleButton
        key={opt.key}
        active={opt.value === selected}
        onClick={() => onSelect(opt.value)}
      >
        {opt.key}
      </ToggleButton>
    ))}
  </div>
);

export default Selector;
