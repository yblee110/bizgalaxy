"use client";

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import GalaxyCanvas from '@/components/galaxy/GalaxyCanvas';
import GalaxyNav from '@/components/galaxy/GalaxyNav';
import ProjectLaunchpad from '@/components/project/ProjectLaunchpad';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { ReactFlowProvider } from '@xyflow/react';
import { Project } from '@/types';
import { getUserId } from '@/lib/auth';

import LoginPage from '@/components/auth/LoginPage';

export default function HomePage() {
  const { projects, setProjects, isLoggedIn } = useProjectStore();
  const [isMounted, setIsMounted] = useState(false);
  const initialized = React.useRef(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize with demo projects on first load
  useEffect(() => {
    if (!isMounted) return;
    if (initialized.current) return;

    // Only load demo data if store is empty
    if (projects.length === 0) {
      const userId = getUserId();
      const demoProjects: Project[] = [
        {
          id: 'project_demo_1',
          uid: userId,
          title: '비즈갤럭시',
          scale: 9,
          category: 'Software',
          summary: 'AI 기반 시각적 생산성 플랫폼',
          created_at: new Date(),
        },
        {
          id: 'project_demo_2',
          uid: userId,
          title: '이커머스 스토어',
          scale: 7,
          category: 'Business',
          summary: '수제품 온라인 판매 플랫폼',
          created_at: new Date(),
        },
        {
          id: 'project_demo_3',
          uid: userId,
          title: '브랜드 디자인',
          scale: 4,
          category: 'Design',
          summary: '비주얼 아이덴티티 및 마케팅 자료',
          created_at: new Date(),
        },
        {
          id: 'project_demo_4',
          uid: userId,
          title: '콘텐츠 전략',
          scale: 3,
          category: 'Marketing',
          summary: '소셜 미디어 및 블로그 콘텐츠 계획',
          created_at: new Date(),
        },
        {
          id: 'project_demo_5',
          uid: userId,
          title: '재무 기획',
          scale: 5,
          category: 'Finance',
          summary: '1분기 예산 및 수익 예측',
          created_at: new Date(),
        },
      ];
      setProjects(demoProjects);
    }

    initialized.current = true;
  }, [isMounted, projects.length, setProjects]);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
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
