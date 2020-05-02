import React from "react";

import { ToggleButton } from "components/ToggleButton/ToggleButton";
import { Inversion } from "services/TriadChord";

import style from "./Selector.module.css";

interface InversionSelectorProps {
  inversion: Inversion;
  handleSelectInversion: (inversion: Inversion) => void;
}

export const InversionSelector = ({
  inversion,
  handleSelectInversion,
}: InversionSelectorProps) => {
  return (
    <div className={style.container}>
      <ToggleButton
        pressed={inversion === Inversion.ROOT}
        onClick={() => handleSelectInversion(Inversion.ROOT)}
      >
        Root
      </ToggleButton>
      <ToggleButton
        pressed={inversion === Inversion.FIRST}
        onClick={() => handleSelectInversion(Inversion.FIRST)}
      >
        First
      </ToggleButton>
      <ToggleButton
        pressed={inversion === Inversion.SECOND}
        onClick={() => handleSelectInversion(Inversion.SECOND)}
      >
        Second
      </ToggleButton>
    </div>
  );
};
