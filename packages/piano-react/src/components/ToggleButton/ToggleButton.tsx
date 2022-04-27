import React, { FC } from "react";
import classnames from "classnames";

import "./ToggleButton.css";

interface ToggleButtonProps {
  pressed: boolean;
}

type Props = ToggleButtonProps & JSX.IntrinsicElements["button"];

export const ToggleButton: FC<Props> = (props) => {
  const { pressed, ...rest } = props;
  const classes = classnames("btn", props.className, {
    "btn-active": props.pressed,
  });

  return <button className={classes} {...rest} />;
};
