"use client";

import React, { useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useProjectStore } from '@/stores/projectStore';
import { useToast } from '@/components/ui/toast';

interface KanbanHeaderProps {
  project: Project;
  onClose: () => void;
  onAddTask: () => void;
}

export default function KanbanHeader({ project, onClose, onAddTask }: KanbanHeaderProps) {
  const { deleteProject } = useProjectStore();
  const { showToast } = useToast();

  const handleDeleteProject = useCallback(async () => {
    if (confirm(`'${project.title}' 프로젝트를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await apiClient.delete(`/api/projects/${project.id}`);
        deleteProject(project.id);
        onClose();
        showToast('프로젝트가 삭제되었습니다', 'success');
      } catch (error) {
        console.error('Error deleting project:', error);
        showToast('프로젝트 삭제 중 오류가 발생했습니다', 'error');
      }
    }
  }, [project, deleteProject, onClose, showToast]);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-tech text-white">
          {project.title}
        </h2>
        {project.summary && (
          <p className="text-sm text-muted-foreground mt-1">
            {project.summary}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="glass"
          size="sm"
          onClick={handleDeleteProject}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-500/30"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          프로젝트 삭제
        </Button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <Button
          variant="glass"
          size="sm"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4 mr-2" />
          태스크 추가
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
