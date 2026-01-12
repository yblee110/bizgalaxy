"use client";

import React, { useMemo } from 'react';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
  tasks: Task[];
  projectTitle: string;
}

interface StatusProgress {
  status: TaskStatus;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  GOAL: { label: '사업 목표', color: '#A855F7' },
  TODO: { label: '할 일', color: '#EF4444' },
  IN_PROGRESS: { label: '진행 중', color: '#EAB308' },
  DONE: { label: '완료', color: '#22C55E' },
};

export default function ProgressDashboard({ tasks, projectTitle }: ProgressDashboardProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        goals: 0,
        progressPercentage: 0,
        statusBreakdown: [] as StatusProgress[],
        estimatedHours: 0,
        actualHours: 0,
      };
    }

    const byStatus: Record<TaskStatus, number> = {
      GOAL: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    let totalEstimated = 0;
    let totalActual = 0;

    tasks.forEach((task) => {
      byStatus[task.status]++;
      if (task.estimated_hours) totalEstimated += task.estimated_hours;
      if (task.actual_hours) totalActual += task.actual_hours;
    });

    const completed = byStatus.DONE;
    const progressPercentage = Math.round((completed / total) * 100);

    const statusBreakdown: StatusProgress[] = (Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => ({
      status,
      label: STATUS_CONFIG[status].label,
      color: STATUS_CONFIG[status].color,
      count: byStatus[status],
      percentage: total > 0 ? Math.round((byStatus[status] / total) * 100) : 0,
    }));

    return {
      total,
      completed,
      inProgress: byStatus.IN_PROGRESS,
      todo: byStatus.TODO,
      goals: byStatus.GOAL,
      progressPercentage,
      statusBreakdown,
      estimatedHours: totalEstimated,
      actualHours: totalActual,
    };
  }, [tasks]);

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">📊 진행률 대시보드</h3>
        <span className="text-sm text-muted-foreground">{projectTitle}</span>
      </div>

      {/* Main Progress Circle */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.progressPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-white">{stats.progressPercentage}%</span>
            <span className="text-xs text-muted-foreground">완료율</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <StatCard label="전체 태스크" value={stats.total} icon="📋" />
          <StatCard label="완료" value={stats.completed} icon="✅" color="#22C55E" />
          <StatCard label="진행 중" value={stats.inProgress} icon="🔄" color="#EAB308" />
          <StatCard label="할 일" value={stats.todo} icon="📝" color="#EF4444" />
        </div>
      </div>

      {/* Status Breakdown Bars */}
      <div className="space-y-2">
        {stats.statusBreakdown.map((status) => (
          <div key={status.status} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 shrink-0">
              {status.label}
            </span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color,
                }}
              />
            </div>
            <span className="text-xs text-white w-16 text-right">
              {status.count} ({status.percentage}%)
            </span>
          </div>
        ))}
      </div>

      {/* Time Tracking */}
      {(stats.estimatedHours > 0 || stats.actualHours > 0) && (
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
          <div className="text-center">
            <span className="text-lg font-semibold text-blue-400">
              {stats.estimatedHours}h
            </span>
            <p className="text-xs text-muted-foreground">예상 시간</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold text-green-400">
              {stats.actualHours}h
            </span>
            <p className="text-xs text-muted-foreground">실제 시간</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color?: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="glass rounded-lg p-3 flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <span className={cn("text-lg font-semibold text-white", color && `style={{color}}"`)}>
          {value}
        </span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
