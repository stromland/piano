import React, { Component } from 'react';
import Keys from '../../components/Keys';
import Button from '../../components/Button';
import { NoteSelector, ScaleSelector } from './components/Selector';
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

const twelveKeys = [
  { note: 'C' },
  { note: 'C#', black: true },
  { note: 'D' },
  { note: 'D#', black: true },
  { note: 'E' },
  { note: 'F' },
  { note: 'F#', black: true },
  { note: 'G' },
  { note: 'G#', black: true },
  { note: 'A' },
  { note: 'Bb', black: true },
  { note: 'B' }
];

class Scale extends Component {
  state = {
    keyIndex: 0,
    scaleIndex: 0,
    selectedKey: 0,
    scale: [2, 2, 1, 2, 2, 2, 1],
    speed: 500,
    showAll: true,
    intervalId: null
  };

  start = () => {
    const intervalId = setInterval(() => {
      this.setState(state => {
        if (state.scaleIndex === state.scale.length) {
          return {
            keyIndex: state.selectedKey,
            scaleIndex: 0
          };
        }
        return {
          keyIndex: state.keyIndex + state.scale[state.scaleIndex],
          scaleIndex: state.scaleIndex + 1
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

  selectScale = e => {
    let nums = e && e.target.value;
    this.setState(() => ({
      scale: nums.split(',').map(n => parseInt(n))
    }));
  };

  selectNote = e => {
    const value = parseInt(e.target.value);
    this.setState(() => ({
      keyIndex: value,
      selectedKey: value
    }));
  };

  changeSpeed = e => {
    const speed = e.target.value;
    this.setState(() => ({
      speed
    }));
  };

  getScaleKeyIndexes = () => {
    const { scale, selectedKey } = this.state;
    return scale.reduce((acc, s, i) => {
      if (i === 0) {
        return [selectedKey, selectedKey + s];
      }
      return [...acc, acc[i] + s];
    }, []);
  };

  pressAllScaleKeys = allKeys => {
    let scaleIndex = 0;
    const scaleKeys = this.getScaleKeyIndexes();
    return allKeys.map((k, i) => {
      if (i !== scaleKeys[scaleIndex]) {
        return k;
      }
      scaleIndex++;
      return { ...k, pressed: true };
    });
  };

  pressOneKey = allKeys => {
    const { keyIndex } = this.state;
    return allKeys.map((k, i) => {
      if (i !== keyIndex) {
        return k;
      }
      return { ...k, pressed: true };
    });
  };

  renderPressedKeys = allKeys => {
    const { intervalId } = this.state;
    if (intervalId === null) {
      return this.pressAllScaleKeys(allKeys);
    }
    return this.pressOneKey(allKeys);
  };

  startOrStop = () => {
    if (this.state.intervalId === null) {
      this.start();
    } else {
      this.stop();
    }
  };

  render() {
    const keys = this.renderPressedKeys([
      ...twelveKeys,
      ...twelveKeys,
      ...twelveKeys
    ]);
    return (
      <ScaleContainer>
        <Keys keys={keys} height="40%" />
        <ControllerContainer>
          <input
            type="number"
            onChange={this.changeSpeed}
            value={this.state.speed}
          />
          <NoteSelector onSelect={this.selectNote} />
          <ScaleSelector onSelect={this.selectScale} />
          <Button success onClick={this.startOrStop}>
            {!this.state.intervalId ? 'Start' : 'Stop'}
          </Button>
        </ControllerContainer>
      </ScaleContainer>
    );
  }
}

export default Scale;
