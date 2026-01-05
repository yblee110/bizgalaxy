"use client";

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { Task, TaskStatus } from '@/types';
import KanbanColumn from './KanbanColumn';
import TaskCard, { TaskCard as TaskCardView } from './TaskCard';

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'GOAL', title: '사업 목표', color: '#A855F7' },
  { id: 'TODO', title: '할 일', color: '#EF4444' },
  { id: 'IN_PROGRESS', title: '진행 중', color: '#EAB308' },
  { id: 'DONE', title: '완료', color: '#22C55E' },
];

export default function KanbanBoard() {
  const { selectedProject, closeKanban, isKanbanOpen, deleteProject } = useProjectStore();
  const { tasks, getTasks, updateTaskStatus, reorderTasks, addTask } = useTaskStore();

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [newTaskContent, setNewTaskContent] = React.useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get tasks for current project
  const projectTasks = React.useMemo(() => {
    return selectedProject ? getTasks(selectedProject.id) : [];
  }, [selectedProject, getTasks, tasks]);

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = projectTasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = projectTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column && activeTask.status !== column.id) {
      updateTaskStatus(selectedProject!.id, activeId, column.id);
      return;
    }

    // Handle reordering within the same column
    if (activeId !== overId) {
      const oldIndex = projectTasks.findIndex((t) => t.id === activeId);
      const newIndex = projectTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(projectTasks, oldIndex, newIndex);
        // Update order values
        const tasksWithOrder = reorderedTasks.map((task, index) => ({
          ...task,
          order: index,
        }));
        reorderTasks(selectedProject!.id, tasksWithOrder);
      }
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim() || !selectedProject) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      project_id: selectedProject.id,
      status: 'TODO',
      content: newTaskContent.trim(),
      desc: '',
      is_ai_generated: false,
      order: tasksByStatus['TODO'].length,
      created_at: new Date(),
    };

    addTask(selectedProject.id, newTask);
    setNewTaskContent('');
    // Keep modal open for continuous entry
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;
    if (confirm(`'${selectedProject.title}' 프로젝트를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      deleteProject(selectedProject.id);
      closeKanban();
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-tech text-white">
              {selectedProject.title}
            </h2>
            {selectedProject.summary && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProject.summary}
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
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              태스크 추가
            </Button>
            <Button variant="ghost" size="icon" onClick={closeKanban}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

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
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-90 cursor-grabbing">
                <TaskCardView
                  task={activeTask}
                  isDragging
                  className="w-[300px]"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Add Task Modal overlay */}
        {isAddingTask && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
            <div className="bg-card glass-strong p-6 rounded-xl w-full max-w-md border border-white/10 shadow-xl space-y-4">
              <h3 className="text-lg font-semibold text-white">새 태스크 추가</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="할 일을 입력하세요..."
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsAddingTask(false);
                      setNewTaskContent('');
                    }
                  }}
                  className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskContent('');
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={!newTaskContent.trim()}>
                    추가하기
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
