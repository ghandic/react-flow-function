import { useCallback, useRef } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Connection,
  Background,
  reconnectEdge,
  Edge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../tailwind.config";
import NumberInputNode from "./nodes/input";
import FunctionNode from "./nodes/function";
import ResultNode from "./nodes/result";
import { AppNode } from "./nodes/types";
import { FileDigit, FunctionSquare, Plus, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const initialNodes = [
  {
    id: "number_1",
    type: "number",
    position: { x: 50, y: 100 },
    data: { value: 21, label: "Number 1" }, // Initial value
  },
  {
    id: "number_2",
    type: "number",
    position: { x: 50, y: 200 },
    data: { value: 21, label: "Number 2" }, // Initial value
  },
  {
    id: "function_1",
    type: "function",
    position: { x: 250, y: 150 },
    data: {
      expression: `@number_1 + @number_2`,
      expressionHTML: `<p><span class="mention" data-type="mention" data-valid="true" data-id="number_1">@number_1</span> + <span class="mention" data-valid="true" data-type="mention" data-id="number_2">@number_2</span></p>`,
      value: "",
      label: "Function",
    }, // Default expression
  },
  {
    id: "result_1",
    type: "result",
    position: { x: 550, y: 150 },
    data: { value: "", label: "Result" }, // Initially showing 0 as result
  },
] as AppNode[];

const initialEdges = [
  {
    id: "e1-1",
    source: "number_1",
    target: "function_1",
    animated: true,
  },
  {
    id: "e1-2",
    source: "number_2",
    target: "function_1",
    animated: true,
  },
  {
    id: "e1-3",
    source: "function_1",
    target: "result_1",
    animated: true,
  },
] as Edge[];
const App = () => {
  const edgeReconnectSuccessful = useRef(true);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodesDelete = useCallback(
    (deleted: AppNode[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
              animated: true,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [setEdges, edges, nodes]
  );

  const addNode = (type: string) => {
    setNodes((nds) => {
      const nextNodeNumber = nds.filter((n) => n.type === type).length + 1;
      const newNode = {
        id: `${type}_${nextNodeNumber}`,
        type: type,
        position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random position
        data: {
          label:
            type.charAt(0).toUpperCase() + type.slice(1) + " " + nextNodeNumber,
          ...(type === "number" && { value: 0 }),
          ...(type === "function" && {
            expression: "",
            expressionHTML: "<p></p>",
            value: "",
          }),
          ...(type === "result" && { value: "" }),
        },
      } as AppNode;
      return [...nds, newNode];
    });
  };
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }

      edgeReconnectSuccessful.current = true;
    },
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-full absolute top-10 left-10 z-10"
            size="icon"
          >
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => addNode("number")}
          >
            <FileDigit className="h-4 w-4 mr-2" />
            Number Input
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => addNode("function")}
          >
            <FunctionSquare className="h-4 w-4 mr-2" />
            Function
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => addNode("result")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Result
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={{
          animated: true,
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onNodesDelete={onNodesDelete}
        onReconnectEnd={onReconnectEnd}
        onConnect={onConnect}
        nodeTypes={{
          number: NumberInputNode,
          function: FunctionNode,
          result: ResultNode,
        }}
      >
        <Controls />
        <Background />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export default App;
