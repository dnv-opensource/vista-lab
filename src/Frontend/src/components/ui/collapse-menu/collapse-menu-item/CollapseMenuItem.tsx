import clsx from 'clsx';
import { useMemo, useRef, useState } from 'react';
import Icon from '../../icons/Icon';
import { IconName } from '../../icons/icons';
import { COLLAPSE_MENU_IDENTIFIER } from '../CollapseMenu';
import { useCollapseMenuContext } from '../context/CollapseMenuContext';
import './CollapseMenuItem.scss';

export type CollapseItem = {
  title: string;
};

interface Props extends CollapseItem {
  className?: string;
}

const COLLAPSE_MENU_ITEM_IDENTIFIER = 'ui-collapse-menu-item';

/**@description Must be wrapped by a the CollapseMenu component */
const CollapseMenuItem: React.FC<React.PropsWithChildren<Props>> = ({ children, className, ...item }) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const { title } = item;
  const { direction, expandItem, isExpanded } = useCollapseMenuContext();

  const depth = useMemo(() => {
    if (!itemRef.current || !mounted) return 0;
    let parent = itemRef.current.parentElement;

    const maxIter = 20;
    let depth = 0;
    let i = 0;
    while (i < maxIter && parent && parent.id !== COLLAPSE_MENU_IDENTIFIER) {
      if (parent.id === COLLAPSE_MENU_IDENTIFIER || parent.id === COLLAPSE_MENU_ITEM_IDENTIFIER) {
        depth++;
      }

      parent = parent.parentElement;
      i++;
    }

    if (!parent) throw new Error('Couldnt find CollapseMenu parent');

    return depth;
  }, [mounted, itemRef]);

  const expanded = useMemo(() => isExpanded(item, depth), [isExpanded, item, depth]);

  return (
    <div
      ref={ref => {
        itemRef.current = ref;
        setMounted(true);
      }}
      className={clsx('ui-collapse-menu-item', className, direction)}
      id={COLLAPSE_MENU_ITEM_IDENTIFIER}
    >
      <span className={'title-wrapper'} onClick={() => expandItem(item, depth)}>
        <p>{title}</p>
        <Icon icon={direction === 'horizontal' ? IconName.AngleRight : IconName.AnglesDown} />
      </span>
      {expanded && children}
    </div>
  );
};

export default CollapseMenuItem;
