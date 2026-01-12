"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';

interface FilterOptions {
  search: string;
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  tags: string[];
  hasDependencies: boolean | null;
  overdue: boolean;
}

interface TaskFiltersProps {
  tasks: Task[];
  onFilteredTasksChange: (tasks: Task[]) => void;
  allTags: string[];
  allAssignees: string[];
}

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string; color: string }> = [
  { value: 'GOAL', label: '사업 목표', color: '#A855F7' },
  { value: 'TODO', label: '할 일', color: '#EF4444' },
  { value: 'IN_PROGRESS', label: '진행 중', color: '#EAB308' },
  { value: 'DONE', label: '완료', color: '#22C55E' },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; color: string }> = [
  { value: 'LOW', label: '낮음', color: '#6B7280' },
  { value: 'MEDIUM', label: '보통', color: '#3B82F6' },
  { value: 'HIGH', label: '높음', color: '#F97316' },
  { value: 'URGENT', label: '긴급', color: '#EF4444' },
];

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: [],
    priority: [],
    assignee: [],
    tags: [],
    hasDependencies: null,
    overdue: false,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchContent = task.content.toLowerCase().includes(searchLower);
        const matchDesc = task.desc?.toLowerCase().includes(searchLower);
        const matchTags = task.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        if (!matchContent && !matchDesc && !matchTags) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && task.priority && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Assignee filter
      if (filters.assignee.length > 0) {
        if (!task.assignee || !filters.assignee.includes(task.assignee)) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        if (!task.tags || !filters.tags.some((tag) => task.tags?.includes(tag))) {
          return false;
        }
      }

      // Dependencies filter
      if (filters.hasDependencies !== null) {
        const hasDeps = task.dependencies && task.dependencies.length > 0;
        if (filters.hasDependencies && !hasDeps) return false;
        if (!filters.hasDependencies && hasDeps) return false;
      }

      // Overdue filter
      if (filters.overdue && task.due_date) {
        const dueDate = task.due_date instanceof Date
          ? task.due_date
          : new Date(task.due_date.toDate?.() || task.due_date.seconds * 1000);
        if (dueDate > new Date()) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const updateFilter = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleStatus = useCallback((status: TaskStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  }, []);

  const togglePriority = useCallback((priority: TaskPriority) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      assignee: [],
      tags: [],
      hasDependencies: null,
      overdue: false,
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.assignee.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.hasDependencies !== null) count++;
    if (filters.overdue) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredTasks,
    updateFilter,
    toggleStatus,
    togglePriority,
    clearFilters,
    activeFilterCount,
  };
}

export default function TaskFilters({
  tasks,
  onFilteredTasksChange,
  allTags,
  allAssignees,
}: TaskFiltersProps) {
  const {
    filters,
    updateFilter,
    toggleStatus,
    togglePriority,
    clearFilters,
    activeFilterCount,
  } = useTaskFilters(tasks);

  // Update parent when filtered tasks change
  React.useEffect(() => {
    onFilteredTasksChange(
      tasks.filter((task) => {
        if (filters.search && !task.content.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.status.length > 0 && !filters.status.includes(task.status)) {
          return false;
        }
        return true;
      })
    );
  }, [filters, tasks, onFilteredTasksChange]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="glass rounded-lg p-3 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="태스크 검색..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-md pl-10 pr-10 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        {filters.search && (
          <button
            onClick={() => updateFilter('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Filters - Status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => toggleStatus(status.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
              filters.status.includes(status.value)
                ? "text-white border-2"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
            )}
            style={
              filters.status.includes(status.value)
                ? { backgroundColor: status.color, borderColor: status.color }
                : {}
            }
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
      >
        <Filter className="h-3 w-3" />
        고급 필터
        {activeFilterCount > 0 && (
          <span className="bg-primary text-white text-[10px] px-1.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")}
        />
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          {/* Priority Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">우선순위</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => togglePriority(priority.value)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-all",
                    filters.priority.includes(priority.value)
                      ? "text-white"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                  style={
                    filters.priority.includes(priority.value)
                      ? { backgroundColor: priority.color }
                      : {}
                  }
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">태그</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = filters.tags || [];
                      const newTags = currentTags.includes(tag)
                        ? currentTags.filter((t) => t !== tag)
                        : [...currentTags, tag];
                      updateFilter('tags', newTags);
                    }}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-all",
                      filters.tags?.includes(tag)
                        ? "bg-primary text-white"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Toggle */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => updateFilter('overdue', e.target.checked)}
              className="rounded bg-white/10 border-white/20"
            />
            기한 초과 태스크만 표시
          </label>

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="w-full text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
