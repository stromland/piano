import React from "react";
import classnames from "classnames";

import { PianoKey } from "models/PianoKey";

import "./PianoKeys.css";

interface KeyProps {
  pianoKey: PianoKey;
}

function Key({ pianoKey }: KeyProps) {
  const classes = classnames("key", {
    "black-key": pianoKey.black,
    pressed: pianoKey.pressed,
  });

  return (
    <div className={classes}>
      <span>{pianoKey.note}</span>
    </div>
  );
}

interface KeyGroupProps {
  keys: PianoKey[];
  pianoKey: PianoKey;
  keyIndex: number;
}

function KeyGroup({ keys, pianoKey, keyIndex }: KeyGroupProps) {
  if (pianoKey.black) return null;
  const nextKey = keys.length > keyIndex + 1 ? keys[keyIndex + 1] : null;
  return (
    <div className="key-group">
      <Key pianoKey={pianoKey} />
      {nextKey && nextKey.black && <Key pianoKey={nextKey} />}
    </div>
  );
}

interface PianoKeysProps {
  keys: PianoKey[];
}

export function PianoKeys({ keys }: PianoKeysProps) {
  return (
    <div className="key-container">
      {keys.map((key, index) => (
        <KeyGroup key={index} keys={keys} pianoKey={key} keyIndex={index} />
      ))}
    </div>
  );
}
