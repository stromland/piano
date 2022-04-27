import React, { FC } from "react";
import { ScaleType, Scale } from "services/Scale";
import { ToggleButton } from "components/ToggleButton/ToggleButton";

import style from "./Selector.module.css";

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
