import React from 'react';
import classNames from 'classnames/bind';
import styles from './button.module.css';

const Button = ({ children, primary, success, ...rest }) => {
  const cx = classNames.bind(styles);
  const buttonStyles = cx({
    base: true,
    primary,
    success
  });

  return (
    <button className={buttonStyles} {...rest}>
      {children}
    </button>
  );
};

export default Button;
