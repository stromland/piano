import React, { Component } from 'react';
import piano from 'services/piano';

import NoteSelector from './components/note-selector';
import ChordSelector from './components/chord-selector';
import ScaleSelector from './components/scale-selector';
import ButtonGroupsContainer from './components/button-groups-container';
import Label from './components/label';

class Scale extends Component {
  state = {
    selectedKey: 0,
    scaleName: 'major'
  };

  componentDidMount() {
    this.pressKeys(this.state);
  }

  pressKeys = state => {
    const { selectedKey, scaleName } = state;
    this.props.updatePianoKeys(keys =>
      piano.pressAllScaleKeys(keys, selectedKey, piano.scales[scaleName])
    );
  };

  updateStateAndPressKeys = partial => {
    this.setState(state => {
      const newState = {
        ...state,
        ...partial
      };
      this.pressKeys(newState);
      return newState;
    });
  };

  selectScale = name => {
    this.updateStateAndPressKeys({
      scaleName: name
    });
  };

  selectNote = index => {
    this.updateStateAndPressKeys({
      selectedKey: index
    });
  };

  render() {
    const { pianoKeys } = this.props;
    const { selectedKey, scaleName } = this.state;
    return (
      <ButtonGroupsContainer>
        <Label>Keys</Label>
        <NoteSelector onSelect={this.selectNote} selected={selectedKey} />
        <Label>Scales</Label>
        <ScaleSelector onSelect={this.selectScale} selected={scaleName} />
        <Label>Chords</Label>
        <ChordSelector
          pianoKeys={pianoKeys}
          selectedKey={selectedKey}
          scaleName={scaleName}
        />
      </ButtonGroupsContainer>
    );
  }
}

export default Scale;
