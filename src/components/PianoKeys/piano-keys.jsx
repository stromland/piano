import React from 'react';
import Key from './key';
import KeyContainer from './key-container';
import KeyGroup from './key-group';

const renderBlackKey = (keys, index) => {
  if (keys.length <= index) {
    return false;
  }
  const key = keys[index];
  return key.black && <Key {...key} />;
};

const Keys = ({ height, keys }) => (
  <KeyContainer height={height}>
    {keys.map((k, i) => {
      if (k.black) {
        return false;
      }
      return (
        <KeyGroup key={i}>
          <Key {...k} />
          {renderBlackKey(keys, i + 1)}
        </KeyGroup>
      );
    })}
  </KeyContainer>
);

export default Keys;
