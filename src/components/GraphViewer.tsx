import React, { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { NodeChat } from './NodeChat';
import { KnowledgeGraph, GraphNode, GraphEdge, ChatSession, AIService } from '../types';
import { generateId } from '../utils/helpers';
import './GraphViewer.css';

interface GraphViewerProps {
  graph: KnowledgeGraph;
  selectedNode: GraphNode | null;
  onGraphUpdate: (graph: KnowledgeGraph) => void;
  onNodeSelect: (node: GraphNode | null) => void;
  onChatSession: (session: ChatSession) => void;
  aiServices: AIService[];
  defaultService: 'openai' | 'gemini';
}

export const GraphViewer: React.FC<GraphViewerProps> = ({
  graph,
  selectedNode,
  onGraphUpdate,
  onNodeSelect,
  onChatSession,
  aiServices,
  defaultService
}) => {
  const [graphData, setGraphData] = useState<KnowledgeGraph>(graph);
  const [showChat, setShowChat] = useState(false);
  const [newNodeInput, setNewNodeInput] = useState('');
  const graphRef = useRef<any>(null);

  // Update local state when prop changes
  useEffect(() => {
    setGraphData(graph);
  }, [graph]);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const graphNode = graphData.nodes.find(n => n.id === node.id);
    if (graphNode) {
      onNodeSelect(graphNode);
      setShowChat(true);
      
      // Bring node to front
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2, 1000);
      }
    }
  }, [graphData.nodes, onNodeSelect]);

  // Handle background click to deselect node
  const handleBackgroundClick = useCallback(() => {
    onNodeSelect(null);
    setShowChat(false);
  }, [onNodeSelect]);

  // Handle node drag
  const handleNodeDrag = useCallback((node: any, translate: any) => {
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === node.id 
          ? { ...n, x: node.x, y: node.y }
          : n
      )
    }));
  }, []);

  // Add new node
  const handleAddNode = () => {
    if (!newNodeInput.trim()) return;

    const newNode: GraphNode = {
      id: generateId(),
      label: newNodeInput.trim(),
      x: Math.random() * 800 - 400,
      y: Math.random() * 600 - 300,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      size: 20
    };

    let newGraph = {
      ...graphData,
      nodes: [...graphData.nodes, newNode]
    };

    // If a node is selected, connect the new node to it
    if (selectedNode) {
      const newEdge: GraphEdge = {
        id: generateId(),
        source: selectedNode.id,
        target: newNode.id,
        strength: 1
      };
      
      newGraph = {
        ...newGraph,
        edges: [...newGraph.edges, newEdge]
      };
    }

    setGraphData(newGraph);
    onGraphUpdate(newGraph);
    setNewNodeInput('');
  };

  // Add edge between nodes
  const handleAddEdge = (sourceId: string, targetId: string) => {
    const newEdge: GraphEdge = {
      id: generateId(),
      source: sourceId,
      target: targetId,
      strength: 1
    };

    const newGraph = {
      ...graphData,
      edges: [...graphData.edges, newEdge]
    };

    setGraphData(newGraph);
    onGraphUpdate(newGraph);
  };

  // Remove node
  const handleRemoveNode = (nodeId: string) => {
    const newGraph = {
      nodes: graphData.nodes.filter(n => n.id !== nodeId),
      edges: graphData.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    };

    setGraphData(newGraph);
    onGraphUpdate(newGraph);
    
    if (selectedNode?.id === nodeId) {
      onNodeSelect(null);
      setShowChat(false);
    }
  };

  // Close chat
  const handleCloseChat = () => {
    setShowChat(false);
    onNodeSelect(null);
  };

  // Get enabled AI service
  const getEnabledAIService = () => {
    return aiServices.find(service => service.isEnabled) || 
           aiServices.find(service => service.name === defaultService);
  };

  return (
    <div className="graph-viewer">
      <div className="graph-controls">
        <div className="add-node-section">
          <input
            type="text"
            className="input"
            placeholder={selectedNode ? `Connect to "${selectedNode.label}"...` : "Enter new topic/node name..."}
            value={newNodeInput}
            onChange={(e) => setNewNodeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
          />
          <button className="button" onClick={handleAddNode}>
            {selectedNode ? 'Add Connected Node' : 'Add Node'}
          </button>
        </div>
        
        {selectedNode && (
          <div className="selected-node-info">
            <h3>Selected: {selectedNode.label}</h3>
            <p className="connection-hint">New nodes will be connected to this node</p>
            <button 
              className="button secondary" 
              onClick={() => handleRemoveNode(selectedNode.id)}
            >
              Remove Node
            </button>
          </div>
        )}
      </div>

      <div className="graph-container">
        <ForceGraph2D
          ref={graphRef}
          graphData={{
            nodes: graphData.nodes,
            links: graphData.edges
          }}
          nodeLabel="label"
          nodeColor="color"
          nodeRelSize={6}
          linkColor={() => '#999'}
          linkWidth={1}
          onNodeClick={handleNodeClick}
          onNodeDrag={handleNodeDrag}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={100}
          nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
            const label = node.label;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);
          }}
        />
      </div>

      {showChat && selectedNode && (
        <div className="chat-overlay">
          <NodeChat
            node={selectedNode}
            onClose={handleCloseChat}
            onChatSession={onChatSession}
            aiService={getEnabledAIService()}
            onAddRelatedNode={(topic) => {
              const newNode: GraphNode = {
                id: generateId(),
                label: topic,
                x: selectedNode.x! + (Math.random() - 0.5) * 200,
                y: selectedNode.y! + (Math.random() - 0.5) * 200,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                size: 20
              };

              const newGraph = {
                ...graphData,
                nodes: [...graphData.nodes, newNode],
                edges: [...graphData.edges, {
                  id: generateId(),
                  source: selectedNode.id,
                  target: newNode.id,
                  strength: 1
                }]
              };

              setGraphData(newGraph);
              onGraphUpdate(newGraph);
            }}
          />
        </div>
      )}
    </div>
  );
};
