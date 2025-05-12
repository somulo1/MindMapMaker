import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

interface MindMapProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const MindMap: React.FC<MindMapProps> = ({ initialNodes = [], initialEdges = [] }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: 'New Node' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={addNewNode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Node
          </button>
          <button
            onClick={deleteSelectedNodes}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete Selected
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindMap; 