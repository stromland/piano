import React, { useState } from "react";
import style from "./Dropdown.module.css";
import classnames from "classnames";

interface DropdownOption<T> {
  id: string | number;
  label: string;
  content: T;
}

interface DropdownProps<T> {
  items: T[];
  toOption: (option: T) => DropdownOption<T>;
  selectedOption: T;
  onSelect: (option: T) => void;
}

export function Dropdown<T>({
  items,
  onSelect,
  selectedOption,
  toOption,
}: DropdownProps<T>) {
  const [isOptionsHidden, hideOptions] = useState(true);

  const handleSelectOption = (it: T) => {
    hideOptions(true);
    onSelect(it);
  };

  const options = items.map((it) => toOption(it));
  const selected = toOption(selectedOption);

  return (
    <div className={style.dropdown}>
      <span
        className={style.selected}
        onClick={() => hideOptions(!isOptionsHidden)}
      >
        {selected.label}
      </span>
      <div
        className={classnames(
          isOptionsHidden && style.optionsHidden,
          style.options
        )}
      >
        {options.map((it) => (
          <p
            className={classnames(
              style.option,
              it.label === selected.label && style.optionSelected
            )}
            key={it.id}
            onClick={() => handleSelectOption(it.content)}
          >
            {it.label}
          </p>
        ))}
      </div>
    </div>
  );
}
