import React, { Component } from 'react';
import piano from '../../services/piano';
import PianoKeys from 'components/PianoKeys';
import Container from 'components/Container';

class Piano extends Component {
  state = {
    selectedKey: 0,
    scaleName: 'major',
    pianoKeys: []
  };

  componentDidMount() {
    this.setState(state => ({
      pianoKeys: piano.keySet(3)
    }));
  }

  selectScale = name => {
    this.setState(() => ({
      scaleName: name
    }));
  };

  selectNote = index => {
    console.log(index);
    this.setState(() => ({
      selectedKey: index
    }));
  };

  render() {
    const { pianoKeys, selectedKey, scaleName } = this.state;
    const { children } = this.props;
    const pressedKeys = piano.pressAllScaleKeys(
      pianoKeys,
      selectedKey,
      piano.scales[scaleName]
    );
    return (
      <Container>
        <PianoKeys keys={pressedKeys} height="40%" />
        {React.Children.map(children, child =>
          React.cloneElement(child, {
            selectScale: this.selectScale,
            selectNote: this.selectNote,
            activeKey: selectedKey,
            activeScale: scaleName
          })
        )}
      </Container>
    );
  }
}

export default Piano;
