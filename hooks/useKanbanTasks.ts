"use client";

import { useEffect, useState } from 'react';
import { Task } from '@/types';
import { apiClient } from '@/lib/api/client';

interface UseKanbanTasksResult {
  isLoading: boolean;
  error: Error | null;
  loadTasks: () => Promise<void>;
}

export function useKanbanTasks(projectId: string | undefined, onTasksLoaded: (tasks: Task[]) => void): UseKanbanTasksResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTasks = async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<{ tasks: Task[] }>(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);

      if (data.tasks) {
        const tasksWithDates: Task[] = data.tasks.map((t) => ({
          ...t,
          created_at: t.created_at instanceof Date
            ? t.created_at
            : (t.created_at?.toDate?.() ?? new Date()),
        }));
        onTasksLoaded(tasksWithDates);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tasks'));
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  return { isLoading, error, loadTasks };
}
