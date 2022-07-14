import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';
import Icon from '../../../ui/icons/Icon';
import { IconName } from '../../../ui/icons/icons';
import { TreeNode } from '../types';

export const generateElementNodeId = (node: string, parents: string[]) => {
  return parents.concat(node).join('-');
};

interface Props<T extends { children: T[]; id: string }> {
  node: T;
  parents: TreeNode<T>[];
  formatNode: (node: T, parents: TreeNode<T>[], children: T[]) => TreeNode<T>;
  formatElement: (node: TreeNode<T>, parents: TreeNode<T>[], children: TreeNode<T>[]) => JSX.Element;
  isExpanded: (node: T) => boolean;
  setExpanded: (node: T) => void;
}

function TreeViewNode<T extends { children: T[]; id: string }>({
  node,
  formatNode,
  formatElement,
  parents,
  isExpanded,
  setExpanded,
}: Props<T>) {
  const treeNode = useMemo(() => formatNode(node, parents, node.children), [node, parents, formatNode]);
  const treeParents = treeNode.parents;

  const toggleExpand = useCallback(() => {
    setExpanded(node);
  }, [node, setExpanded]);

  const parent = treeParents.length && treeParents[parents.length - 1];

  const treeChildren = treeNode.children;

  const mergedChild = treeNode.children
    .map(c => formatNode(c, parents.concat(treeNode), c.children))
    .find(c => c.merge);
  const hasMergedChild = !!mergedChild;
  const hasChildren = hasMergedChild ? mergedChild.children.length > 0 : treeChildren.length > 0;

  if (treeNode.merge && treeParents[treeParents.length - 1]) {
    return (
      <>
        {isExpanded(treeParents[treeParents.length - 1].node) &&
          treeChildren.map((childNode, index) => (
            <TreeViewNode
              key={index}
              node={childNode}
              parents={parents.concat(treeNode)}
              formatNode={formatNode}
              formatElement={formatElement}
              isExpanded={isExpanded}
              setExpanded={setExpanded}
            />
          ))}
      </>
    );
  }

  if (treeNode.skip && parent) {
    return (
      <>
        {isExpanded(parent.node) &&
          treeChildren.map((childNode, index) => (
            <TreeViewNode
              key={index}
              node={childNode}
              parents={parents.concat(treeNode)}
              formatNode={formatNode}
              formatElement={formatElement}
              isExpanded={isExpanded}
              setExpanded={setExpanded}
            />
          ))}
      </>
    );
  }

  const { hideExpander } = treeNode;

  return (
    <div key={treeNode.id} className={clsx('tree-node-container', `tree-depth-${treeParents.length}`)}>
      <div className="tree-view-node">
        <div
          id={generateElementNodeId(
            treeNode.id,
            treeParents.map(p => p.id)
          )}
          className={clsx(
            'tree-view-node-expander',
            hasChildren ? 'has-children' : 'no-children',
            hideExpander && 'hide-expander'
          )}
          onClick={toggleExpand}
          tabIndex={0}
        >
          <Icon
            icon={isExpanded(node) ? IconName.CaretDown : IconName.CaretUp}
            className="tree-view-node-expander-icon"
          />
        </div>
        <div className="tree-view-node-value">
          {formatElement(
            treeNode,
            treeParents,
            treeChildren.map(c => formatNode(c, treeParents.concat(treeNode), c.children))
          )}
        </div>
      </div>
      <div className="tree-view-children">
        {isExpanded(node) &&
          treeChildren.map((childNode, index) => {
            return (
              <TreeViewNode
                key={index}
                node={childNode}
                parents={parents.concat(treeNode)}
                formatNode={formatNode}
                formatElement={formatElement}
                isExpanded={isExpanded}
                setExpanded={setExpanded}
              />
            );
          })}
      </div>
    </div>
  );
}

export default TreeViewNode;
