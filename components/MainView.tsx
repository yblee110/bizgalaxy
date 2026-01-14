"use client";

import React from 'react';
import { useProjectStore } from '@/stores/projectStore';
import GalaxyCanvas from '@/components/galaxy/GalaxyCanvas';
import GalaxyNav from '@/components/galaxy/GalaxyNav';
import ProjectLaunchpad from '@/components/project/ProjectLaunchpad';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { ReactFlowProvider } from '@xyflow/react';
import { useFirestoreData } from '@/hooks/useFirestoreData';

export default function MainView() {
    const { projects } = useProjectStore();

    // Initialize Firestore data syncing when this view mounts
    useFirestoreData();

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

                {/* Debug Info (Normally hidden in production, helpful for verifying ID persistence) */}
                <div className="fixed bottom-1 right-1 z-[99999] text-[10px] text-white/30 pointer-events-none font-mono">
                    ID: {typeof window !== 'undefined' ? localStorage.getItem('bizgalaxy_user_id') : 'unknown'} | Projects: {projects.length}
                </div>
            </main>
        </ReactFlowProvider>
    );
}
