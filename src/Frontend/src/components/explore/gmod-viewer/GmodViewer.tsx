import { Gmod, GmodNode, GmodPath, Pmod } from 'dnv-vista-sdk';
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
    (node: GmodNode, parents: TreeNode<GmodNode>[]) => ({
      parents,
      node,
      children: node.children,
      expanded: false,
      skip: Gmod.isProductSelectionAssignment(parents[parents.length - 1]?.node, node),
      merge: Gmod.isProductTypeAssignment(parents[parents.length - 1]?.node, node),
      id: node.id,
    }),
    []
  );

  const formatElement = useCallback(
    (
      treeNode: TreeNode<GmodNode>,
      treeParents: TreeNode<GmodNode>[],
      treeChildren: TreeNode<GmodNode>[]
    ): JSX.Element => {
      const node = treeNode.node;
      const parents = treeParents.map(p => p.node);
      const path = new GmodPath(parents, node);

      const skippedParent: GmodNode | undefined =
        treeParents.length > 0 && treeParents[treeParents.length - 1].skip
          ? treeParents[treeParents.length - 1].node
          : undefined;
      const mergedChild: GmodNode | undefined = treeChildren.find(c => c.merge)?.node;

      return (
        <GmodViewNode
          node={node}
          parents={parents}
          skippedParent={skippedParent}
          mergedChild={mergedChild}
          path={path}
        />
      );
    },
    []
  );

  return (
    <Tree
      rootNode={pmod.model.rootNode}
      formatNode={formatNode}
      formatElement={formatElement}
      className="gmod-tree-view"
    />
  );
};

export default GmodViewer;
