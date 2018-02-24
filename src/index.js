import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import Piano from './views/Piano';
import Scale from './views/Scale';

const MainContainer = styled.div`
  height: 100%;
  display: flex;
  margin: 0;
`;

const Main = () => (
  <MainContainer>
    <Piano>
      <Scale />
    </Piano>
  </MainContainer>
);

ReactDOM.render(<Main />, document.getElementById('root'));
registerServiceWorker();
