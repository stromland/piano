import style from './Selector.module.css';
import { ScaleType, Scale } from '@stromland/piano-lib';
import { ToggleButton } from 'components/ToggleButton/ToggleButton';
import React, { FC } from 'react';

interface ScaleSelectorProps {
  scale: ScaleType;
  handleSelectScale: (scale: ScaleType) => void;
}

export const ScaleSelector: FC<ScaleSelectorProps> = ({
  handleSelectScale,
  scale,
}) => {
  return (
    <div className={style.container}>
      {Object.keys(Scale.scales).map((key) => (
        <ToggleButton
          pressed={scale === key}
          onClick={() => handleSelectScale(key as ScaleType)}
        >
          {key}
        </ToggleButton>
      ))}
    </div>
  );
};
