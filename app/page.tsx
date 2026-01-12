"use client";

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import GalaxyCanvas from '@/components/galaxy/GalaxyCanvas';
import GalaxyNav from '@/components/galaxy/GalaxyNav';
import ProjectLaunchpad from '@/components/project/ProjectLaunchpad';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { ReactFlowProvider } from '@xyflow/react';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import LoginPage from '@/components/auth/LoginPage';

export default function HomePage() {
  const { projects, isLoggedIn } = useProjectStore();
  const [isMounted, setIsMounted] = useState(false);
  const { loading, error } = useFirestoreData();

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <main className="w-full h-screen overflow-hidden bg-background">
        {/* Galaxy View */}
        <GalaxyCanvas projects={projects} />

        {/* Navigation Overlays */}
        <GalaxyNav />

        {/* Project Launchpad Modal */}
        <ProjectLaunchpad />

        {/* Kanban Board Overlay */}
        <KanbanBoard />
      </main>
    </ReactFlowProvider>
  );
}
