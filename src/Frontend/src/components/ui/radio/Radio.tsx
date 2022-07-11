import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import './Radio.scss';

interface Props {
  checked?: boolean;
  onClick?: (checked: boolean) => void;
}

const Radio: React.FC<Props> = ({ checked: inputChecked, onClick: inputOnClick }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(!!inputChecked);
  }, [inputChecked]);

  const onClick = useCallback(() => {
    inputOnClick?.(!checked) ?? setChecked(prev => !prev);
  }, [checked, inputOnClick, setChecked]);

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
    >
      {checked && <div className={clsx('inner')} />}
    </div>
  );
};

export default Radio;
