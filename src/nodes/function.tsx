import { useCallback, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import Mention from "@tiptap/extension-mention";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import type { FunctionNode } from "./types";
import suggestion from "../tiptap/suggestions";
import * as math from "mathjs";
import "../tiptap/tiptap.css";
import { cn } from "@/lib/utils";
import { FunctionSquare } from "lucide-react";

const FunctionNode = ({ id, data }: NodeProps<FunctionNode>) => {
  const { updateNodeData, getNode } = useReactFlow();
  const thisNode = getNode(id);

  const connections = useHandleConnections({
    type: "target",
  });
  const inputNodeEdges = useMemo(
    () => connections.map((c) => c.source),
    [connections]
  );
  const inputNodes = useNodesData(inputNodeEdges);

  // Restucture the inputNodes to a format that mathjs can understand
  const inputNodesMap = inputNodes.reduce(
    (acc: { [key: string]: number }, { id, data }) => {
      acc[id] = data.value as number;
      return acc;
    },
    {}
  );
  const ExtendedMention = Mention.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        valid: {
          default: false,
          parseHTML: (element) => {
            return element.getAttribute("data-valid") === "true";
          },
          renderHTML: (attributes) => {
            if (!inputNodeEdges.includes(attributes.id)) {
              return {};
            }

            return {
              "data-valid": "true",
            };
          },
        },
      };
    },
  });

  const getValue = useCallback(() => {
    console.log("Evaluating expression:", data.expression, inputNodesMap);
    let value = data.value;
    try {
      // replace any variables that arent using the @prefix
      Object.keys(inputNodesMap).forEach((key) => {
        data.expression = data.expression.replace(
          new RegExp(`(?<!@)${key}`, "g"),
          ""
        );
      });
      console.log(
        "Evaluating expression (preprocessed):",
        data.expression,
        inputNodesMap
      );
      // Swap out the @ prefix for mathjs to evaluate
      value = math.evaluate(data.expression.replace(/@/g, ""), inputNodesMap);
    } catch (error) {
      // console.error("Error evaluating expression:", error);
    }
    return value;
  }, [data, inputNodesMap]);

  useEffect(() => {
    const newValue = getValue();
    if (newValue !== data.value) {
      updateNodeData(id, { value: newValue });
    }
  }, [
    data.expression,
    data.value,
    getValue,
    id,
    inputNodesMap,
    updateNodeData,
  ]);

  const editor = useEditor(
    {
      extensions: [
        Document,
        Text,
        Paragraph,
        ExtendedMention.configure({
          suggestion: suggestion(inputNodeEdges),
          HTMLAttributes: {
            class:
              "rounded-sm px-1 py-0.5 data-[valid=true]:bg-purple-200 data-[valid=true]:text-purple-600 bg-red-200",
          },
        }),
      ],
      content: data.expressionHTML,
      onUpdate: ({ editor }) => {
        // only update if changes
        if (editor.getHTML() === data.expressionHTML) return;
        updateNodeData(id, {
          expressionHTML: editor.getHTML(),
          expression: editor.getText(),
          value: getValue(),
        });
      },
    },
    [inputNodeEdges]
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
        <FunctionSquare className="h-4 w-4" />
      </div>
      <EditorContent editor={editor} />
      <Handle id="xyz" type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default FunctionNode;
