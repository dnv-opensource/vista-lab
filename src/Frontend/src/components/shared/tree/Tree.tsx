import clsx from 'clsx';
import React, { useCallback, useMemo, useState } from 'react';
import useBus, { dispatch } from 'use-bus';
import useStateWithPromise from '../../../hooks/use-state-with-promise';
import { BusEvents, TreeAllNodesStatus, TreeAllNodesStatusEvent } from '../events';
import TreeViewNode from './tree-view-node/TreeViewNode';
import { TreeNode } from './types';

export type TreeNodeType<T> = { children: T[]; id: string };

interface Props<T extends TreeNodeType<T>> {
  className?: string;
  rootNode: T;
  formatNode: (node: T, parents: TreeNode<T>[], children: T[]) => TreeNode<T>;
  formatElement: (node: TreeNode<T>, parents: TreeNode<T>[], children: TreeNode<T>[]) => JSX.Element;
}

function getAllNodes<T extends TreeNodeType<T>>(rootNode: T, nodes: T[]) {
  nodes.push(rootNode);

  if (!rootNode.children.length) return;

  rootNode.children.forEach(c => getAllNodes(c, nodes));
}

function Tree<T extends TreeNodeType<T>>({ rootNode, formatElement, formatNode, className }: Props<T>) {
  const root = formatNode(rootNode, [], rootNode.children);
  const [expandedNodes, setExpandedNodes] = useStateWithPromise<T[]>([]);
  const [allNodesStatus, setAllNodesStatus] = useState<TreeAllNodesStatus>(null);

  const allNodes = useMemo(() => {
    const nodes: T[] = [];
    getAllNodes(rootNode, nodes);
    return nodes;
  }, [rootNode]);

  useBus(
    BusEvents.TreeAllNodesStatus,
    e => {
      const event = e as TreeAllNodesStatusEvent;
      const newStatus = event.action;
      setAllNodesStatus(newStatus);
      if (newStatus === 'expanded') {
        setExpandedNodes(allNodes);
      } else if (newStatus === 'collapsed') {
        setExpandedNodes([]);
      }
    },
    []
  );

  const setExpanded = useCallback(
    (node: T) => {
      const prev = expandedNodes;
      const foundNodeIndex = prev.findIndex(n => n.id === node.id);

      if (foundNodeIndex !== -1) {
        // Already expanded, collapse node
        const newNodes = [...expandedNodes];
        newNodes.splice(foundNodeIndex, 1);
        if (newNodes.length === 0) dispatch({ type: BusEvents.TreeAllNodesStatus, action: 'collapsed' });
        else {
          if (allNodesStatus !== null) dispatch({ type: BusEvents.TreeAllNodesStatus, action: null });
          setExpandedNodes(newNodes);
        }
      } else {
        // Collapsed, expand node
        const newNodes = [...prev, node];
        if (prev.length + 1 === allNodes.length) dispatch({ type: BusEvents.TreeAllNodesStatus, action: 'expanded' });
        else {
          if (allNodesStatus !== null) dispatch({ type: BusEvents.TreeAllNodesStatus, action: null });
          setExpandedNodes(newNodes);
        }
      }
    },
    [allNodes, expandedNodes, setExpandedNodes, allNodesStatus]
  );

  const isExpanded = useCallback((node: T) => !!expandedNodes.find(n => n.id === node.id), [expandedNodes]);

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
            setExpanded={setExpanded}
          />
        );
      })}
    </div>
  );
}

export default Tree;
