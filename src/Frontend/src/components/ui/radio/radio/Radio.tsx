import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import './Radio.scss';

export interface RadioProps {
  checked?: boolean;
  onClick?: (checked: boolean) => void;
  id: string;
}

const Radio: React.FC<RadioProps> = ({ id, checked: inputChecked, onClick: inputOnClick }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(!!inputChecked);
  }, [inputChecked]);

  const onClick = useCallback(
    () => (inputOnClick ? inputOnClick(!checked) : setChecked(prev => !prev)),
    [checked, inputOnClick, setChecked]
  );

  return (
    <div
      className={clsx('ui-radio', checked && 'checked')}
      onClick={onClick}
      tabIndex={0}
      onKeyUp={e => {
        switch (e.code) {
          case 'Space':
          case 'Enter':
            e.target.click();
        }
      }}
      id={id}
    />
  );
};

export default Radio;
