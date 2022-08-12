import clsx from 'clsx';
import React, { useCallback, useImperativeHandle } from 'react';
import useStateWithPromise from '../../../hooks/use-state-with-promise';
import TreeViewNode, { generateElementNodeId } from './tree-view-node/TreeViewNode';
import { TreeNode } from './types';

interface Props<T extends { children: T[]; id: string }> {
  className?: string;
  rootNode: T;
  formatNode: (node: T, parents: TreeNode<T>[], children: T[]) => TreeNode<T>;
  formatElement: (node: TreeNode<T>, parents: TreeNode<T>[], children: TreeNode<T>[]) => JSX.Element;
}

export type TreeRef<T extends { children: T[]; id: string }> = { expandTo: { (id: T[]): void } };

function Tree<T extends { children: T[]; id: string }>(
  { rootNode, formatElement, formatNode, className }: Props<T>,
  ref: React.ForwardedRef<TreeRef<T>>
) {
  const FOCUS_NODE_CLASSNAME = ' tree-show-focused-node';
  const root = formatNode(rootNode, [], rootNode.children);
  const [expandedNodes, setExpandedNodes] = useStateWithPromise<T[]>([]);

  useImperativeHandle(ref, () => ({
    expandTo: (path: T[]) => {
      setExpandedNodes(path.slice(0, path.length - 1)).then(() => {
        const nodes = [...path];
        const leafNode = nodes.slice(path.length - 1)[0];

        const elementId = generateElementNodeId(
          leafNode.id,
          path.slice(0, path.length - 1).map(p => p.id)
        );

        const element = document.getElementById(elementId);
        const parentEl = element?.parentElement;
        if (element && parentEl) {
          parentEl.className = parentEl.className + FOCUS_NODE_CLASSNAME;

          setTimeout(() => {
            if (parentEl) {
              parentEl.className = parentEl.className.replace(FOCUS_NODE_CLASSNAME, '');
            }
          }, 1500);

          element.focus();
        }
      });
    },
  }));

  const handleExpanded = useCallback(
    (node: T) => {
      const prev = expandedNodes;
      const foundNodeIndex = prev.findIndex(n => n.id === node.id);

      if (foundNodeIndex !== -1) {
        const newNodes = [...expandedNodes];
        newNodes.splice(foundNodeIndex, 1);
        setExpandedNodes(newNodes);
        return;
      }

      setExpandedNodes([...prev, node]);
    },
    [expandedNodes, setExpandedNodes]
  );

  const isExpanded = useCallback(
    (node: T) => {
      return !!expandedNodes.find(n => n.id === node.id);
    },
    [expandedNodes]
  );

  return (
    <div className={clsx('tree-view', className)}>
      {root.children.map((node, index) => {
        return (
          <TreeViewNode
            key={index}
            node={node}
            parents={[root]}
            formatElement={formatElement}
            formatNode={formatNode}
            isExpanded={isExpanded}
            setExpanded={handleExpanded}
          />
        );
      })}
    </div>
  );
}

export default React.forwardRef(Tree);
