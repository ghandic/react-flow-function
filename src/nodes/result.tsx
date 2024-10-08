import React from "react";
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import type { ResultNode } from "./types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const ResultNode = React.memo(({ data, id }: NodeProps<ResultNode>) => {
  const { getNode } = useReactFlow();
  const thisNode = getNode(id);

  const connections = useHandleConnections({
    type: "target",
  });
  const inputNodeEdges = connections.map((c) => c.source);

  const inputNodes = useNodesData(inputNodeEdges);

  // Find the first node connected that has result attribute
  const value =
    (inputNodes.find((n) => n.data.value)?.data.value as number) ?? "";

  console.log("ResultNode connections:", inputNodes);
  return (
    <div
      className={cn(
        "bg-gray-100 text-gray-800 py-2 px-4 rounded-md ",
        thisNode?.selected && "outline-2 outline-blue-500 outline "
      )}
    >
      <div className="flex flex-row items-center justify-between gap-2  pb-2">
        {data.label}
        <Sparkles className="h-4 w-4" />
      </div>
      <div>{value}</div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={connections.length < 1}
      />
    </div>
  );
});

export default ResultNode;
