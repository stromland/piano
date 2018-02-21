import React, { Component } from 'react';
import styled from 'styled-components';
import piano from 'services/piano';
import Keys from 'components/Keys';

import { NoteSelector, ScaleSelector } from './components/Selectors';
import { ScaleContainer } from './components/Containers';
import { ToggleButtonGroup } from 'components/ToggleButton';

const Label = styled.p`
  color: var(--label-text);
  font-weight: bold;
  font-size: 1.9em;
  margin: 10px 0 5px 0;
  padding: 0;
`;

class Scale extends Component {
  state = {
    keyIndex: 0,
    scaleIndex: 0,
    selectedKey: 0,
    scaleName: 'major',
    speed: 500,
    intervalId: null
  };

  start = () => {
    const intervalId = setInterval(() => {
      this.setState(state => {
        const { scaleName, scaleIndex, selectedKey, keyIndex } = state;
        const scale = piano.scales[scaleName];
        if (scaleIndex === scale.length) {
          return {
            keyIndex: selectedKey,
            scaleIndex: 0
          };
        }
        return {
          keyIndex: keyIndex + scale[scaleIndex],
          scaleIndex: scaleIndex + 1
        };
      });
    }, this.state.speed || 500);

    this.setState(() => ({
      intervalId
    }));
  };

  stop = () => {
    clearInterval(this.state.intervalId);
    this.setState(() => ({
      keyIndex: this.state.selectedKey,
      scaleIndex: 0,
      intervalId: null
    }));
  };

  startOrStop = () => {
    if (this.state.intervalId === null) {
      this.start();
    } else {
      this.stop();
    }
  };

  selectScale = name => {
    this.setState(() => ({
      scaleName: name
    }));
  };

  selectNote = index => {
    this.setState(() => ({
      keyIndex: index,
      selectedKey: index
    }));
  };

  renderPressedKeys = allKeys => {
    const { intervalId, selectedKey, scaleName, keyIndex } = this.state;
    if (intervalId === null) {
      return piano.pressAllScaleKeys(
        allKeys,
        selectedKey,
        piano.scales[scaleName]
      );
    }
    return piano.pressOneKey(allKeys, keyIndex);
  };

  render() {
    const { selectedKey, scaleName } = this.state;
    const keys = this.renderPressedKeys(piano.keySet(3));
    return (
      <ScaleContainer>
        <Keys keys={keys} height="40%" />
        <ToggleButtonGroup>
          <Label>Key</Label>
          <NoteSelector onSelect={this.selectNote} activeKey={selectedKey} />
          <Label>Scale</Label>
          <ScaleSelector onSelect={this.selectScale} activeKey={scaleName} />
        </ToggleButtonGroup>
      </ScaleContainer>
    );
  }
}

export default Scale;
