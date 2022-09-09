import { Gmod, GmodNode, GmodPath, Pmod, PmodNode } from 'dnv-vista-sdk';
import React, { useCallback, useMemo, useState } from 'react';
import useBus, { dispatch } from 'use-bus';
import useStateWithPromise from '../../../hooks/use-state-with-promise';
import { BusEvents, TreeAllDataChannelsStatus, TreeAllDataChannelsStatusEvent } from '../../shared/events';
import Tree from '../../shared/tree/Tree';
import { TreeNode } from '../../shared/tree/types';
import GmodViewNode from './gmod-view-node/GmodViewNode';
import './GmodViewer.scss';

interface Props {
  pmod: Pmod;
}

function getAllChannels(rootNode: GmodNode, nodes: GmodNode[]) {
  nodes.push(rootNode);

  if (!rootNode.children.length) return;

  rootNode.children.forEach(c => getAllChannels(c, nodes));
}

export type GmodViewerNodeExtra = {
  isExpanded: { (node: GmodNode): boolean };
  setExpanded: { (node: GmodNode): void };
};

const GmodViewer: React.FC<Props> = ({ pmod }: Props) => {
  const [expandedChannels, setExpandedChannels] = useStateWithPromise<GmodNode[]>([]);
  const [allChannelsStatus, setAllChannelsStatus] = useState<TreeAllDataChannelsStatus>(null);

  const allChannels = useMemo(() => {
    const nodes: GmodNode[] = [];
    getAllChannels(pmod.rootNode.node, nodes);
    return nodes;
  }, [pmod.rootNode]);

  useBus(
    BusEvents.TreeAllDataChannelsStatus,
    e => {
      const event = e as TreeAllDataChannelsStatusEvent;
      const newStatus = event.action;
      setAllChannelsStatus(newStatus);
      if (newStatus === 'expanded') {
        setExpandedChannels(allChannels);
      } else if (newStatus === 'collapsed') {
        setExpandedChannels([]);
      }
    },
    []
  );

  const setExpanded = useCallback(
    (node: GmodNode) => {
      const prev = expandedChannels;
      const foundChannelIndex = prev.findIndex(n => n.id === node.id);

      if (foundChannelIndex !== -1) {
        // Already expanded, collapse node
        const newNodes = [...expandedChannels];
        newNodes.splice(foundChannelIndex, 1);
        if (newNodes.length === 0) dispatch({ type: BusEvents.TreeAllDataChannelsStatus, action: 'collapsed' });
        else {
          if (allChannelsStatus !== null) dispatch({ type: BusEvents.TreeAllDataChannelsStatus, action: null });
          setExpandedChannels(newNodes);
        }
      } else {
        // Collapsed, expand node
        const newNodes = [...prev, node];
        if (prev.length + 1 === allChannels.length)
          dispatch({ type: BusEvents.TreeAllDataChannelsStatus, action: 'expanded' });
        else {
          if (allChannelsStatus !== null) dispatch({ type: BusEvents.TreeAllDataChannelsStatus, action: null });
          setExpandedChannels(newNodes);
        }
      }
    },
    [allChannels, expandedChannels, setExpandedChannels, allChannelsStatus]
  );

  const isExpanded = useCallback(
    (node: GmodNode) => !!expandedChannels.find(n => n.id === node.id),
    [expandedChannels]
  );

  const extra: GmodViewerNodeExtra = useMemo(() => ({ setExpanded, isExpanded }), [setExpanded, isExpanded]);
  const formatNode = useCallback(
    (node: PmodNode, parents: TreeNode<PmodNode>[]) => ({
      parents,
      node,
      children: node.children,
      expanded: false,
      skip: Gmod.isProductSelectionAssignment(parents[parents.length - 1]?.node.node, node.node),
      merge: Gmod.isProductTypeAssignment(parents[parents.length - 1]?.node.node, node.node),
      id: node.node.id,
      extra,
    }),
    [extra]
  );

  const formatElement = useCallback(
    (
      treeNode: TreeNode<PmodNode>,
      treeParents: TreeNode<PmodNode>[],
      treeChildren: TreeNode<PmodNode>[]
    ): JSX.Element => {
      const node = treeNode.node;
      const parents = treeParents.map(p => p.node);
      const path = new GmodPath(
        parents.map(p => p.node),
        node.node
      );

      const skippedParent: PmodNode | undefined =
        treeParents.length > 0 && treeParents[treeParents.length - 1].skip
          ? treeParents[treeParents.length - 1].node
          : undefined;
      const mergedChild: PmodNode | undefined = treeChildren.find(c => c.merge)?.node;

      return (
        <GmodViewNode
          node={node.node}
          parents={parents.map(p => p.node)}
          skippedParent={skippedParent?.node}
          mergedChild={mergedChild?.node}
          path={path}
          extra={treeNode.extra as GmodViewerNodeExtra}
        />
      );
    },
    []
  );

  return (
    <Tree rootNode={pmod.rootNode} formatNode={formatNode} formatElement={formatElement} className="gmod-tree-view" />
  );
};

export default GmodViewer;
