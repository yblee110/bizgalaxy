"use client";

import { useState, useCallback } from 'react';
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types';
import { apiClient } from '@/lib/api/client';

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'GOAL', title: '사업 목표', color: '#A855F7' },
  { id: 'TODO', title: '할 일', color: '#EF4444' },
  { id: 'IN_PROGRESS', title: '진행 중', color: '#EAB308' },
  { id: 'DONE', title: '완료', color: '#22C55E' },
];

interface UseKanbanDragDropProps {
  projectId: string | undefined;
  projectTasks: Task[];
  updateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  reorderTasks: (projectId: string, tasks: Task[]) => void;
}

interface DragState {
  activeId: string | null;
  activeTask: Task | null;
}

export function useKanbanDragDrop({
  projectId,
  projectTasks,
  updateTaskStatus,
  reorderTasks,
}: UseKanbanDragDropProps) {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeTask: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setDragState({
      activeId: active.id as string,
      activeTask: projectTasks.find((t) => t.id === active.id) || null,
    });
  }, [projectTasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;

    // Reset drag state
    setDragState({ activeId: null, activeTask: null });

    if (!over || !projectId) return;

    const overId = over.id as string;
    const activeTask = projectTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column && activeTask.status !== column.id) {
      // Optimistic update
      updateTaskStatus(projectId, activeId, column.id);

      // Sync with Firestore
      try {
        await apiClient.patch('/api/tasks', {
          updates: [{ id: activeId, status: column.id }],
        });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
      return;
    }

    // Handle reordering within the same column
    if (activeId !== overId) {
      const { arrayMove } = await import('@dnd-kit/sortable');
      const oldIndex = projectTasks.findIndex((t) => t.id === activeId);
      const newIndex = projectTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(projectTasks, oldIndex, newIndex);

        // Update order values
        const tasksWithOrder = reorderedTasks.map((task, index) => ({
          ...task,
          order: index,
        }));

        // Optimistic update
        reorderTasks(projectId, tasksWithOrder);

        // Sync with Firestore
        try {
          const updates = reorderedTasks.map((task, index) => ({
            id: task.id,
            order: index,
          }));
          await apiClient.patch('/api/tasks', { updates });
        } catch (error) {
          console.error('Error reordering tasks:', error);
        }
      }
    }
  }, [projectId, projectTasks, updateTaskStatus, reorderTasks]);

  return {
    dragState,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
}
