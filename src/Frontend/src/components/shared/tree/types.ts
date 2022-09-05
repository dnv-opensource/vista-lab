export type TreeNode<T extends { children: T[]; id: string }> = {
  id: string;
  parents: TreeNode<T>[];
  node: T;
  children: T[];
  expanded: boolean;
  skip?: boolean;
  merge?: boolean;
  hideExpander?: boolean;
  extra?: { [key: string]: any; }
};
