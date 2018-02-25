import React, { Component } from 'react';
import piano from 'services/piano';
import PianoKeys from 'components/PianoKeys';
import Container from 'components/Container';

class Piano extends Component {
  state = {
    pianoKeys: piano.keySet(3)
  };

  updatePianoKeys = fn => {
    this.setState(state => ({
      pianoKeys: fn(piano.keySet(3))
    }));
  };

  render() {
    const { pianoKeys } = this.state;
    const { children } = this.props;
    return (
      <Container>
        <PianoKeys keys={pianoKeys} height="40%" />
        {React.Children.map(children, child =>
          React.cloneElement(child, {
            updatePianoKeys: this.updatePianoKeys
          })
        )}
      </Container>
    );
  }
}

export default Piano;
