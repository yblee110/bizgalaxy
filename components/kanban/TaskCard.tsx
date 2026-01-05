"use client";

import React from 'react';
import { GripVertical, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export const TaskCard = React.forwardRef<
  HTMLDivElement,
  TaskCardProps & React.HTMLAttributes<HTMLDivElement>
>(({ task, onEdit, onDelete, isDragging, dragHandleProps, style, className, ...props }, ref) => {
  const statusColors = {
    GOAL: 'border-l-purple-500',
    TODO: 'border-l-red-500',
    IN_PROGRESS: 'border-l-yellow-500',
    DONE: 'border-l-green-500',
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'glass rounded-lg w-full p-3 border-l-4 cursor-grab active:cursor-grabbing',
        'hover:bg-white/10 transition-all group',
        statusColors[task.status],
        isDragging && 'opacity-50 rotate-2 scale-105',
        className
      )}
      {...props}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="flex items-start gap-2"
        onPointerDown={(e) => {
          // Allow interactive elements inside to work without triggering drag immediately if needed
          // But dnd-kit usually handles this via sensors/activators
          dragHandleProps?.onPointerDown?.(e);
        }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex-1 min-w-0">
          {/* AI Badge */}
          {task.is_ai_generated && (
            <div className="flex items-center gap-1 text-[10px] text-primary mb-1">
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">AI 생성</span>
            </div>
          )}

          {/* Task content */}
          <h4 className="text-sm font-medium text-white mb-1 break-words">
            {task.content}
          </h4>

          {/* Description */}
          {task.desc && (
            <p className="text-xs text-muted-foreground line-clamp-2 break-words">
              {task.desc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default function SortableTaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      onEdit={onEdit}
      onDelete={onDelete}
      style={style}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}
