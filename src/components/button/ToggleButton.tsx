import React from "react";

import { classNames } from "utils/functions";

import "./ToggleButton.css";

interface ToggleButtonProps {
  pressed: boolean;
}

export function ToggleButton(
  props: ToggleButtonProps & JSX.IntrinsicElements["button"]
) {
  const classes = classNames({
    btn: true,
    "btn-active": props.pressed,
    // TODO: refactor
    [props.className || ""]: !!props.className
  });

  return <button className={classes} {...props} />;
}
