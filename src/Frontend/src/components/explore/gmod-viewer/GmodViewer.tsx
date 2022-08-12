import { Gmod, GmodPath, Pmod, PmodNode } from 'dnv-vista-sdk';
import React, { useCallback } from 'react';
import Tree from '../../shared/tree/Tree';
import { TreeNode } from '../../shared/tree/types';
import GmodViewNode from './gmod-view-node/GmodViewNode';
import './GmodViewer.scss';

interface Props {
  pmod: Pmod;
}

const GmodViewer: React.FC<Props> = ({ pmod }) => {
  const formatNode = useCallback(
    (node: PmodNode, parents: TreeNode<PmodNode>[]) => ({
      parents,
      node,
      children: node.children,
      expanded: false,
      skip: Gmod.isProductSelectionAssignment(parents[parents.length - 1]?.node.node, node.node),
      merge: Gmod.isProductTypeAssignment(parents[parents.length - 1]?.node.node, node.node),
      id: node.node.id,
    }),
    []
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
