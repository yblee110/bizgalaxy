"use client";

import React, { useState, useMemo } from 'react';
import { Link2, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TaskDependenciesProps {
  task: Task;
  allTasks: Task[];
  onAddDependency: (taskId: string) => void;
  onRemoveDependency: (taskId: string) => void;
}

interface DependencyStatus {
  task: Task;
  isCompleted: boolean;
  isCircular: boolean;
  isSelf: boolean;
}

export function useTaskDependencies(currentTask: Task, allTasks: Task[]) {
  const availableTasks = useMemo(() => {
    // Filter out the current task and already selected dependencies
    const currentDeps = currentTask.dependencies || [];
    return allTasks.filter((t) => t.id !== currentTask.id && !currentDeps.includes(t.id));
  }, [allTasks, currentTask]);

  const dependencyStatus = useMemo(() => {
    const currentDeps = currentTask.dependencies || [];
    if (currentDeps.length === 0) return [];

    const status: DependencyStatus[] = currentDeps.map((depId) => {
      const depTask = allTasks.find((t) => t.id === depId);
      if (!depTask) {
        return { task: currentTask, isCompleted: false, isCircular: false, isSelf: false };
      }

      // Check for circular dependency
      const depDeps = depTask.dependencies || [];
      const isCircular = depDeps.includes(currentTask.id);

      return {
        task: depTask,
        isCompleted: depTask.status === 'DONE',
        isCircular,
        isSelf: false,
      };
    });

    return status;
  }, [currentTask, allTasks]);

  const canStartTask = useMemo(() => {
    return dependencyStatus.every(
      (dep) => dep.isCompleted || dep.isCircular || dep.isSelf
    );
  }, [dependencyStatus]);

  const blockedTasks = useMemo(() => {
    // Find tasks that depend on the current task
    return allTasks.filter((t) =>
      t.dependencies?.includes(currentTask.id)
    );
  }, [allTasks, currentTask.id]);

  return {
    availableTasks,
    dependencyStatus,
    canStartTask,
    blockedTasks,
  };
}

export default function TaskDependencies({
  task,
  allTasks,
  onAddDependency,
  onRemoveDependency,
}: TaskDependenciesProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const { availableTasks, dependencyStatus, canStartTask, blockedTasks } =
    useTaskDependencies(task, allTasks);

  const hasDependencies = (task.dependencies?.length || 0) > 0;
  const hasBlockedTasks = blockedTasks.length > 0;

  return (
    <div className="space-y-3">
      {/* Current Task Status */}
      {!canStartTask && hasDependencies && (
        <div className="flex items-center gap-2 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
          <span className="text-xs text-yellow-200">
            선행 태스크가 완료되면 시작할 수 있습니다
          </span>
        </div>
      )}

      {/* Dependencies List */}
      {hasDependencies && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" />
            <span>선행 태스크 ({dependencyStatus.length})</span>
          </div>
          <div className="space-y-1">
            {dependencyStatus.map((dep) => (
              <div
                key={dep.task.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg text-xs",
                  dep.isCompleted
                    ? "bg-green-500/10 border border-green-500/30"
                    : dep.isCircular
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-white/5 border border-white/10"
                )}
              >
                <span
                  className={cn(
                    "flex-1 truncate",
                    dep.isCompleted ? "text-green-300 line-through" : "text-white"
                  )}
                >
                  {dep.task.content}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {dep.isCompleted ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : dep.isCircular ? (
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">미완료</span>
                  )}
                  <button
                    onClick={() => onRemoveDependency(dep.task.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="의존성 제거"
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked Tasks List */}
      {hasBlockedTasks && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3 rotate-180" />
            <span>이 태스크가 완료되면 시작 가능 ({blockedTasks.length})</span>
          </div>
          <div className="space-y-1">
            {blockedTasks.map((blocked) => (
              <div
                key={blocked.id}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground truncate"
              >
                {blocked.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dependency Button */}
      {!isSelecting ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSelecting(true)}
          className="w-full text-xs h-7"
        >
          <Link2 className="h-3 w-3 mr-1" />
          의존성 추가
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">선행 태스크 선택:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSelecting(false)}
              className="h-5 text-xs px-2"
            >
              <X className="h-3 w-3 mr-1" />
              취소
            </Button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {availableTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                추가 가능한 태스크가 없습니다
              </p>
            ) : (
              availableTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onAddDependency(t.id);
                    setIsSelecting(false);
                  }}
                  className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                >
                  <span className="truncate flex-1 text-left">{t.content}</span>
                  <span
                    className={cn(
                      "ml-2 px-1.5 py-0.5 rounded text-[10px]",
                      t.status === 'DONE'
                        ? "bg-green-500/20 text-green-300"
                        : "bg-white/10 text-muted-foreground"
                    )}
                  >
                    {t.status === 'DONE' ? '완료' : '진행중'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dependency Graph Visualization (Mini) */}
      {(hasDependencies || hasBlockedTasks) && (
        <DependencyGraph
          task={task}
          dependencies={dependencyStatus.map((d) => d.task)}
          blockedTasks={blockedTasks}
        />
      )}
    </div>
  );
}

interface DependencyGraphProps {
  task: Task;
  dependencies: Task[];
  blockedTasks: Task[];
}

function DependencyGraph({ task, dependencies, blockedTasks }: DependencyGraphProps) {
  return (
    <div className="p-3 bg-black/20 rounded-lg">
      <svg viewBox="0 0 200 80" className="w-full h-16">
        {/* Dependencies (left) */}
        {dependencies.map((dep, i) => {
          const x = 30;
          const y = 40 + (i - dependencies.length / 2) * 10;
          return (
            <g key={dep.id}>
              <circle cx={x} cy={y} r="4" fill={dep.status === 'DONE' ? '#22C55E' : '#6B7280'} />
              <line
                x1={x + 4}
                y1={y}
                x2={90}
                y2={40}
                stroke={dep.status === 'DONE' ? '#22C55E80' : '#6B728080'}
                strokeWidth="1"
                markerEnd="url(#arrow)"
              />
            </g>
          );
        })}

        {/* Current Task (center) */}
        <g>
          <circle cx="100" cy="40" r="8" fill="#A855F7" />
          <text x="100" y="43" textAnchor="middle" fill="white" fontSize="6">
            {task.content.slice(0, 2)}
          </text>
        </g>

        {/* Blocked Tasks (right) */}
        {blockedTasks.map((blocked, i) => {
          const x = 170;
          const y = 40 + (i - blockedTasks.length / 2) * 10;
          return (
            <g key={blocked.id}>
              <line
                x1={108}
                y1={40}
                x2={x - 4}
                y2={y}
                stroke="#6B728080"
                strokeWidth="1"
                markerEnd="url(#arrow)"
              />
              <circle cx={x} cy={y} r="4" fill="#6B7280" />
            </g>
          );
        })}

        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B728080" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// Hook to check if a task is blocked by dependencies
export function useTaskBlockedStatus(task: Task, allTasks: Task[]): {
  isBlocked: boolean;
  blockingTasks: Task[];
} {
  const blockingTasks = useMemo(() => {
    const dependencies = task.dependencies || [];
    if (dependencies.length === 0) return [];

    return dependencies
      .map((depId) => allTasks.find((t) => t.id === depId))
      .filter((t): t is Task => t !== undefined && t.status !== 'DONE');
  }, [task, allTasks]);

  const isBlocked = blockingTasks.length > 0;

  return { isBlocked, blockingTasks };
}
