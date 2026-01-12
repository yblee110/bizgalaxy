"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  accentColor: string;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  accentColor,
  onEditTask,
  onDeleteTask,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center gap-2 pb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div
        className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">태스크 없음</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onCardClick={onTaskClick}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
