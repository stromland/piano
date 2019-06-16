import React from "react";
import { ScaleType } from "services/Scale";
import { ToggleButton } from "components/ToggleButton/ToggleButton";

import style from "./Selector.module.css";

interface ScaleSelectorProps {
  scale: ScaleType;
  handleSelectScale: (scale: ScaleType) => void;
}

export const ScaleSelector = ({
  handleSelectScale,
  scale
}: ScaleSelectorProps) => {
  return (
    <div className={style.container}>
      <ToggleButton
        pressed={scale === "major"}
        onClick={() => handleSelectScale("major")}
      >
        Major
      </ToggleButton>
      <ToggleButton
        pressed={scale === "minor"}
        onClick={() => handleSelectScale("minor")}
      >
        Minor
      </ToggleButton>
    </div>
  );
};
