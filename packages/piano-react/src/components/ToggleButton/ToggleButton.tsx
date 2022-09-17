import './ToggleButton.css';
import classnames from 'classnames';
import React, { FC } from 'react';

interface ToggleButtonProps {
  pressed: boolean;
}

type Props = ToggleButtonProps & JSX.IntrinsicElements['button'];

export const ToggleButton: FC<Props> = (props) => {
  const { pressed, ...rest } = props;
  const classes = classnames('btn', props.className, {
    'btn-active': props.pressed,
  });

  return <button className={classes} {...rest} />;
};
