"use client";

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PlanetNode, { getCategoryColor } from './PlanetNode';
import TeamNode from './TeamNode';
import { Project, GalaxyNode } from '@/types';
import { useProjectStore } from '@/stores/projectStore';

const nodeTypes: NodeTypes = {
  project: PlanetNode,
  team: TeamNode,
};

interface GalaxyCanvasProps {
  projects: Project[];
}

export default function GalaxyCanvas({ projects }: GalaxyCanvasProps) {
  const { selectProject, openKanban, deleteProject } = useProjectStore();

  // Generate Nodes: Central Team Node + Project Nodes
  const initialNodes: GalaxyNode[] = useMemo(() => {
    const centerX = 0;
    const centerY = 0;
    const radius = 400; // Distance from center

    const projectNodes: GalaxyNode[] = projects.map((project, index) => {
      // Arrange in a circular pattern around center
      const angle = (index / projects.length) * 2 * Math.PI - (Math.PI / 2); // Start from top

      // Calculate position (center-based)
      // Note: PlanetNode handles its own size, but we position the top-left corner usually.
      // We'll aim for approximate center alignment.
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      return {
        id: project.id,
        type: 'project',
        position: { x, y },
        data: {
          ...project,
          onSelect: (p: Project) => { // Type explicitly
            selectProject(p);
            openKanban(p);
          },
          onDelete: deleteProject,
        },
      };
    });

    const teamNode: GalaxyNode = {
      id: 'team-center',
      type: 'team',
      // Center the 192x192 node
      position: { x: centerX - 96, y: centerY - 96 },
      data: {},
    };

    return [teamNode, ...projectNodes];
  }, [projects, selectProject, openKanban]);

  // Generate Edges: Connect Team Node to All Projects
  const initialEdges: Edge[] = useMemo(() => {
    return projects.map((project) => ({
      id: `e-team-${project.id}`,
      source: 'team-center',
      target: project.id,
      type: 'default', // Bezier curve for mind map feel
      animated: true,
      style: { stroke: 'rgba(236, 72, 153, 0.4)', strokeWidth: 2 }, // Accent color (pink)
    }));
  }, [projects]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes and edges with projects when projects array changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: GalaxyNode) => {
      if (node.type === 'project') {
        const project = projects.find((p) => p.id === node.id);
        if (project) {
          selectProject(project);
          openKanban(project);
        }
      }
    },
    [projects, selectProject, openKanban]
  );

  return (
    <div className="w-full h-full bg-background starfield">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={1}
          color="rgba(255, 255, 255, 0.1)"
        />
        <Controls
          className="!bg-card/80 !border-white/10"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap
          className="!bg-card/80 !border-white/10"
          nodeColor={(node) => {
            if (node.type === 'team') return '#EC4899'; // Accent color
            return getCategoryColor((node.data as Project).category);
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
