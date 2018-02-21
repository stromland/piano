import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Scale from './views/Scale';
import styled from 'styled-components';
import registerServiceWorker from './registerServiceWorker';

const MainContainer = styled.div`
  height: 100%;
  display: flex;
  margin: 0;
`;

const Main = () => (
  <MainContainer>
    <Scale />
  </MainContainer>
);

ReactDOM.render(<Main />, document.getElementById('root'));
registerServiceWorker();
