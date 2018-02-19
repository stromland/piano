import React from 'react';
import styles from './key.module.css';
import classNames from 'classnames/bind';

const Key = ({ note, black, pressed, ...rest }) => {
  const cx = classNames.bind(styles);
  const keyStyle = cx({
    key: true,
    blackKey: black,
    pressed
  });

  return (
    <div className={keyStyle} {...rest}>
      <span>{note}</span>
    </div>
  );
};

export default Key;
