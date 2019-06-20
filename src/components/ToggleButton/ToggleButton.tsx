import React from "react";
import classnames from "classnames";

import "./ToggleButton.css";

interface ToggleButtonProps {
  pressed: boolean;
}

export function ToggleButton(
  props: ToggleButtonProps & JSX.IntrinsicElements["button"]
) {
  const { pressed, ...rest } = props;
  const classes = classnames("btn", props.className, {
    "btn-active": props.pressed
  });

  return <button className={classes} {...rest} />;
}
