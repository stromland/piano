import React from "react";
import { PressType } from "services/PianoBoard";
import { ToggleButton } from "components/ToggleButton/ToggleButton";

import style from "./Selector.module.css";

interface TypeSelectorProps {
  type: PressType;
  handleSelectType: (type: PressType) => void;
}

export const TypeSelector = ({ type, handleSelectType }: TypeSelectorProps) => {
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
