import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import useBus from 'use-bus';
import useStateWithPromise from '../../../hooks/use-state-with-promise';
import { BusEvents } from '../events';
import TreeViewNode from './tree-view-node/TreeViewNode';
import { TreeNode } from './types';

interface Props<T extends { children: T[]; id: string }> {
  className?: string;
  rootNode: T;
  formatNode: (node: T, parents: TreeNode<T>[], children: T[]) => TreeNode<T>;
  formatElement: (node: TreeNode<T>, parents: TreeNode<T>[], children: TreeNode<T>[]) => JSX.Element;
}

type AllNodesStatus = 'expanded' | 'collapsed' | null;

function Tree<T extends { children: T[]; id: string }>(
  { rootNode, formatElement, formatNode, className }: Props<T>
) {
  const root = formatNode(rootNode, [], rootNode.children);
  const [expandedNodes, setExpandedNodes] = useStateWithPromise<T[]>([]);
  const [allNodesStatus, setAllNodesStatus] = useState<AllNodesStatus>(null);

  const dispatch = useBus(
    BusEvents.TreeAllNodesStatus,
    e => setAllNodesStatus(e.action as AllNodesStatus),
    [],
  );

  const handleExpanded = useCallback(
    (node: T) => {
      const prev = expandedNodes;
      const foundNodeIndex = prev.findIndex(n => n.id === node.id);

      dispatch({ type: BusEvents.TreeAllNodesStatus, action: null });

      if (foundNodeIndex !== -1) {
        const newNodes = [...expandedNodes];
        newNodes.splice(foundNodeIndex, 1);
        setExpandedNodes(newNodes);
        return;
      }

      setExpandedNodes([...prev, node]);
    },
    [expandedNodes, setExpandedNodes, dispatch]
  );

  const isExpanded = useCallback(
    (node: T) => {
      if (allNodesStatus === 'expanded')
        return true;
      else if (allNodesStatus === 'collapsed')
        return false;

      return !!expandedNodes.find(n => n.id === node.id);
    },
    [expandedNodes, allNodesStatus]
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

export default Tree;
