import styled from 'styled-components';

const KeyContainer = styled.div`
  display: flex;
  height: ${props => props.height || '200px'};
  position: relative;
  width: 100%;
`;

export default KeyContainer;
