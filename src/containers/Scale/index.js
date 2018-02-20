import React, { Component } from 'react';
import Keys from '../../components/Keys';
import Button from '../../components/Button';
import { NoteSelector, ScaleSelector } from './components/Selector';
import piano from '../../service/piano';
import styled from 'styled-components';

const ScaleContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ControllerContainer = styled.div`
  width: 60%;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 30px;
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
        <ControllerContainer>
          <NoteSelector onSelect={this.selectNote} activeKey={selectedKey} />
          <ScaleSelector onSelect={this.selectScale} activeKey={scaleName} />
          <Button success onClick={this.startOrStop}>
            {!this.state.intervalId ? 'Start' : 'Stop'}
          </Button>
        </ControllerContainer>
      </ScaleContainer>
    );
  }
}

export default Scale;
