import React from 'react';
import styled from 'styled-components';
import Key from '../Key';

const KeyContainer = styled.div`
  display: flex;
  height: ${props => props.height || '200px'};
  position: relative;
  width: 100%;
`;

const KeyGroup = styled.div`
  flex: 1;
  display: flex;
  position: relative;
`;

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
