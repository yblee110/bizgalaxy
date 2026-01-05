"use client";

import React from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProjectStore } from '@/stores/projectStore';

interface GalaxyNavProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
}

export default function GalaxyNav({
  onZoomIn,
  onZoomOut,
  onFitView,
}: GalaxyNavProps) {
  const { openLaunchpad } = useProjectStore();

  return (
    <>
      {/* Logo - Top Left */}
      <div className="fixed top-4 left-4 z-40">
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white text-sm font-bold">BG</span>
          </div>
          <span className="text-white font-tech font-semibold text-lg">
            비즈갤럭시
          </span>
        </div>
      </div>

      {/* User Avatar - Top Right */}
      <div className="fixed top-4 right-4 z-40">
        <Avatar className="h-10 w-10 ring-2 ring-primary/50 hover:ring-primary transition-all cursor-pointer">
          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-medium">
            사용자
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Zoom Controls - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2">
        <Button
          variant="glass"
          size="icon"
          onClick={onZoomIn}
          className="rounded-full"
          title="확대"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={onZoomOut}
          className="rounded-full"
          title="축소"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={onFitView}
          className="rounded-full"
          title="전체 보기"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* New Project FAB - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={openLaunchpad}
          size="lg"
          className="rounded-full h-14 w-14 glow-primary-lg hover:scale-110 transition-transform"
          title="새 프로젝트"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
