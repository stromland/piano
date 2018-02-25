import React from 'react';
import piano from 'services/piano';
import Selector from 'components/Selector';

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

const ScaleSelector = props => {
  const options = Object.keys(piano.scales).map(k => ({
    key: capitalize(k),
    value: k
  }));
  return <Selector options={options} {...props} />;
};

export default ScaleSelector;
