import { ToggleButton } from '@/components/ToggleButton/ToggleButton';
import { Scale, ScaleType } from '@stromland/piano-lib';
import { FC } from 'react';

import style from './Selector.module.css';

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
          key={key}
          pressed={scale === key}
          onClick={() => handleSelectScale(key as ScaleType)}
        >
          {key}
        </ToggleButton>
      ))}
    </div>
  );
};
