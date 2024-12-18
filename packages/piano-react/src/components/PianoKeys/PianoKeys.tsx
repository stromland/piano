import { PianoKey } from '@stromland/piano-lib';
import classnames from 'classnames';
import { FC } from 'react';

import './PianoKeys.css';

interface KeyProps {
  pianoKey: PianoKey;
}

const Key: FC<KeyProps> = ({ pianoKey }) => {
  const classes = classnames('key', {
    'black-key': pianoKey.black,
    pressed: pianoKey.pressed,
  });

  return (
    <div className={classes}>
      <span>{pianoKey.note}</span>
    </div>
  );
};

interface KeyGroupProps {
  keys: PianoKey[];
  pianoKey: PianoKey;
  keyIndex: number;
}

const KeyGroup: FC<KeyGroupProps> = ({ keys, pianoKey, keyIndex }) => {
  if (pianoKey.black) return null;
  const nextKey = keys.length > keyIndex + 1 ? keys[keyIndex + 1] : null;
  return (
    <div className="key-group">
      <Key pianoKey={pianoKey} />
      {nextKey && nextKey.black && <Key pianoKey={nextKey} />}
    </div>
  );
};

interface PianoKeysProps {
  keys: PianoKey[];
}

export const PianoKeys: FC<PianoKeysProps> = ({ keys }) => {
  return (
    <div className="key-container">
      {keys.map((key, index) => (
        <KeyGroup key={index} keys={keys} pianoKey={key} keyIndex={index} />
      ))}
    </div>
  );
};
