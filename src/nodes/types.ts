import type { Node, BuiltInNode } from "@xyflow/react";

export type FunctionNode = Node<
  { expression: string; expressionHTML: string; label: string; value: string },
  "function"
>;
export type NumberInputNode = Node<{ value: number; label: string }, "number">;
export type ResultNode = Node<{ label: string }, "result">;
export type AppNode = BuiltInNode | FunctionNode | NumberInputNode | ResultNode;
