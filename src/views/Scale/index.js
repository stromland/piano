import React from 'react';

import { NoteSelector, ScaleSelector } from './components/Selectors';
import ButtonGroupsContainer from './components/ButtonGroupsContainer';
import Label from './components/label';

const Scale = ({ selectNote, selectScale, activeKey, activeScale }) => (
  <ButtonGroupsContainer>
    <Label>Key</Label>
    <NoteSelector onSelect={selectNote} selected={activeKey} />
    <Label>Scale</Label>
    <ScaleSelector onSelect={selectScale} selected={activeScale} />
  </ButtonGroupsContainer>
);

export default Scale;
