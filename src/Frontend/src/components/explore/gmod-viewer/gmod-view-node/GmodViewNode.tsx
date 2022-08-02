import clsx from 'clsx';
import { GmodNode, GmodPath } from 'dnv-vista-sdk';
import React, { useMemo } from 'react';
import './GmodViewNode.scss';

export const getBadgeClassNameByNode = (node: GmodNode) => {
  return `${node.metadata.category.toLowerCase().replace(/ /g, '-')}-${node.metadata.type.toLowerCase()}`;
};

interface Props {
  node: GmodNode;
  parents: GmodNode[];
  path: GmodPath;
  mergedChild?: GmodNode;
  skippedParent?: GmodNode;
}

const GmodViewNode: React.FC<Props> = ({ node, mergedChild, skippedParent, parents, path: initPath }) => {
  const path = useMemo(
    () => (mergedChild ? new GmodPath(parents.concat(node), mergedChild) : initPath),
    [initPath, mergedChild, parents, node]
  );

  const items = useMemo(() => {
    const items: { node: GmodNode; parents: GmodNode[] }[] = [];

    // Order matters here
    if (skippedParent) {
      items.push({ node: parents[parents.length - 2], parents: parents.slice(0, parents.length - 3) });
    }
    items.push({ node, parents });
    if (mergedChild) {
      items.push({ node: mergedChild, parents: parents.concat(node) });
    }

    return items;
  }, [node, parents, mergedChild, skippedParent]);

  return (
    <span>
      <span className={clsx('gmod-badge')}>
        {items.map(({ node, parents }) => {
          const cls = getBadgeClassNameByNode(node);

          let pathStr = node.code;

          return (
            <span key={node.code + parents[0].code} className={clsx('badge-item', cls)}>
              {pathStr}
            </span>
          );
        })}
        {node.location && (
          <span key={'location' + node.location + path.node.code} className={clsx('badge-item', 'location')}>
            {node.location}
          </span>
        )}
      </span>
      <span className={clsx('gmodtreeviewitem-value')}>{path.getCurrentCommonName()}</span>
    </span>
  );
};

export default React.memo(GmodViewNode);
