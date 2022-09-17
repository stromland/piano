import style from './Selector.module.css';
import { PressType } from '@stromland/piano-lib';
import { ToggleButton } from 'components/ToggleButton/ToggleButton';
import React, { FC } from 'react';

interface TypeSelectorProps {
  type: PressType;
  handleSelectType: (type: PressType) => void;
}

export const TypeSelector: FC<TypeSelectorProps> = ({
  type,
  handleSelectType,
}) => {
  return (
    <div className={style.container}>
      <ToggleButton
        pressed={type === PressType.SCALE}
        onClick={() => handleSelectType(PressType.SCALE)}
      >
        Scale
      </ToggleButton>
      <ToggleButton
        pressed={type === PressType.CHORD}
        onClick={() => handleSelectType(PressType.CHORD)}
      >
        Chord
      </ToggleButton>
    </div>
  );
};
