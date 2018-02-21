import React from 'react';
import ToggleButton from 'components/ToggleButton';

const Selector = ({ onSelect, options, activeKey }) => (
  <div style={{ display: 'flex' }}>
    {options.map(opt => (
      <ToggleButton
        key={opt.key}
        active={opt.value === activeKey}
        onClick={() => onSelect(opt.value)}
      >
        {opt.key}
      </ToggleButton>
    ))}
  </div>
);

export default Selector;
