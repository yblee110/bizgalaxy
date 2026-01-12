"use client";

import React, { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useKanbanTasks } from '@/hooks/useKanbanTasks';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import KanbanHeader from './KanbanHeader';
import TaskCreationModal from './TaskCreationModal';
import TaskDetailModal from './TaskDetailModal';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/lib/api/client';

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'GOAL', title: '사업 목표', color: '#A855F7' },
  { id: 'TODO', title: '할 일', color: '#EF4444' },
  { id: 'IN_PROGRESS', title: '진행 중', color: '#EAB308' },
  { id: 'DONE', title: '완료', color: '#22C55E' },
];

export default function KanbanBoard() {
  const { selectedProject, closeKanban, isKanbanOpen } = useProjectStore();
  const { tasks, getTasks, updateTaskStatus, reorderTasks, addTask, setTasks, updateTask } = useTaskStore();
  const { showToast } = useToast();

  // Load tasks
  const { isLoading: isLoadingTasks } = useKanbanTasks(
    selectedProject?.id,
    useCallback((loadedTasks) => {
      if (selectedProject) {
        setTasks(selectedProject.id, loadedTasks);
      }
    }, [selectedProject, setTasks])
  );

  // Modal states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get tasks for current project
  const projectTasks = useMemo(() => {
    return selectedProject ? getTasks(selectedProject.id) : [];
  }, [selectedProject, getTasks, tasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      GOAL: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    projectTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [projectTasks]);

  // Drag and drop handlers
  const { dragState, sensors, handleDragStart, handleDragEnd } = useKanbanDragDrop({
    projectId: selectedProject?.id,
    projectTasks,
    updateTaskStatus,
    reorderTasks,
  });

  // Handle task creation
  const handleAddTask = useCallback(() => {
    setIsAddingTask(true);
  }, []);

  const handleTaskCreated = useCallback((task: Task) => {
    if (selectedProject) {
      addTask(selectedProject.id, task);
    }
  }, [selectedProject, addTask]);

  // Handle task click - open detail modal
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  // Handle task update from detail modal
  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      await apiClient.patch('/api/tasks', { updates: [{ id: taskId, ...updates }] });
      if (selectedProject) {
        updateTask(selectedProject.id, taskId, updates);
      }
      // Update local state for the selected task
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showToast('태스크 업데이트에 실패했습니다', 'error');
    }
  }, [selectedProject, selectedTask, updateTask, showToast]);

  // Handle task delete from detail modal
  const handleDeleteTask = useCallback(async (taskId: string) => {
    // This would be implemented in the store
    setSelectedTask(null);
  }, []);

  if (!selectedProject || !isKanbanOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeKanban}
      />

      {/* Board */}
      <div className="relative w-full max-w-6xl h-[80vh] glass-strong rounded-2xl p-6 flex flex-col">
        {/* Header */}
        <KanbanHeader
          project={selectedProject}
          onClose={closeKanban}
          onAddTask={handleAddTask}
        />

        {/* Loading indicator */}
        {isLoadingTasks && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm">
            태스크 불러오는 중...
          </div>
        )}

        {/* Kanban Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 flex-1 overflow-x-auto">
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className="flex-1 min-w-[280px] max-w-[400px] glass rounded-lg p-4"
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  tasks={tasksByStatus[column.id]}
                  accentColor={column.color}
                  onTaskClick={handleTaskClick}
                />
              </div>
            ))}
          </div>

          <DragOverlay
            dropAnimation={{
              ...defaultDropAnimation,
              duration: 250,
            }}
          >
            {dragState.activeTask ? (
              <div className="opacity-90 cursor-grabbing w-[300px]">
                <TaskCard
                  task={dragState.activeTask}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Add Task Modal */}
        <TaskCreationModal
          isOpen={isAddingTask}
          onClose={() => setIsAddingTask(false)}
          projectId={selectedProject.id}
          onTaskCreated={handleTaskCreated}
          tasksInTodo={tasksByStatus['TODO'].length}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={projectTasks}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
}
