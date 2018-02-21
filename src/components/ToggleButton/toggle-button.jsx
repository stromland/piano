import styled from 'styled-components';

const ToggleButton = styled.button`
  flex: 1;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  border-bottom: ${({ active }) =>
    active
      ? '3px solid var(--primary-dark)'
      : '3px solid var(--secondary-dark)'};
  background: ${({ active }) =>
    active ? 'var(--primary)' : 'var(--secondary)'};
  padding: 5px 10px;
  margin: 10px;

  &:hover {
    background: ${({ active }) =>
      active ? 'var(--primary-hover)' : 'var(--secondary-hover)'};
  }

  &:active {
    background: ${({ active }) =>
      active ? 'var(--primary-dark)' : 'var(--secondary-dark)'};
  }

  &:focus {
    outline: 0 !important;
  }
`;

export default ToggleButton;
