import classnames from 'classnames';
import { FC } from 'react';

import './ToggleButton.css';

interface ToggleButtonProps {
  pressed: boolean;
}

type Props = ToggleButtonProps & JSX.IntrinsicElements['button'];

export const ToggleButton: FC<Props> = (props) => {
  const { pressed, ...rest } = props;
  const classes = classnames('btn', props.className, {
    'btn-active': pressed,
  });

  return <button className={classes} {...rest} />;
};
