import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import type { NumberInputNode } from "./types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileDigit } from "lucide-react";

function NumberInputNode({ id, data }: NodeProps<NumberInputNode>) {
  const { updateNodeData, getNode } = useReactFlow();
  const [number, setNumber] = useState(data.value);
  const thisNode = getNode(id);

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const cappedNumber = Math.min(255, Math.max(0, Number(evt.target.value)));
      setNumber(cappedNumber);
      updateNodeData(id, { value: cappedNumber });
    },
    [id, updateNodeData]
  );

  return (
    <div
      className={cn(
        "bg-gray-100 text-gray-800 py-2 px-4 rounded-md ",
        thisNode?.selected && "outline-2 outline-blue-500 outline "
      )}
    >
      <div className="flex flex-row items-center justify-between gap-2 pb-2">
        {data.label}
        <FileDigit className="h-4 w-4" />
      </div>
      <Input
        id={`number-${id}`}
        name="number"
        type="number"
        min="0"
        max="255"
        onChange={onChange}
        className="nodrag"
        value={number}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default NumberInputNode;
