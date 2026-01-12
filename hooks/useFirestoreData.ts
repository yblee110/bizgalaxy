"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Project, Task } from '@/types';
import { getUserId } from '@/lib/auth';

interface LoadingState {
  projects: boolean;
  tasks: boolean;
}

interface ErrorState {
  projects: string | null;
  tasks: string | null;
}

/**
 * Hook to load and sync data with Firestore
 * Fetches projects and tasks for the current user
 */
export function useFirestoreData() {
  const [loading, setLoading] = useState<LoadingState>({
    projects: false,
    tasks: false,
  });
  const [error, setError] = useState<ErrorState>({
    projects: null,
    tasks: null,
  });
  const initializedRef = useRef(false);

  const { setProjects, projects } = useProjectStore();

  /**
   * Fetch projects from Firestore for the current user
   */
  const fetchProjects = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setError((prev) => ({ ...prev, projects: 'User not found' }));
      return;
    }

    setLoading((prev) => ({ ...prev, projects: true }));
    setError((prev) => ({ ...prev, projects: null }));

    try {
      const response = await fetch(`/api/projects?uid=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.projects) {
        // Convert Firestore timestamps to Dates for client-side
        const projectsWithDates: Project[] = data.projects.map((p: any) => ({
          ...p,
          created_at: p.created_at?.toDate?.() || p.created_at || new Date(),
        }));
        setProjects(projectsWithDates);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError((prev) => ({ ...prev, projects: err instanceof Error ? err.message : 'Unknown error' }));
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  }, [setProjects]);

  /**
   * Fetch tasks for a specific project from Firestore
   */
  const fetchTasks = useCallback(async (projectId: string): Promise<Task[]> => {
    if (!projectId) {
      setError((prev) => ({ ...prev, tasks: 'Project ID is required' }));
      return [];
    }

    setLoading((prev) => ({ ...prev, tasks: true }));
    setError((prev) => ({ ...prev, tasks: null }));

    try {
      const response = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.tasks) {
        // Convert Firestore timestamps to Dates for client-side
        const tasksWithDates: Task[] = data.tasks.map((t: any) => ({
          ...t,
          created_at: t.created_at?.toDate?.() || t.created_at || new Date(),
        }));
        return tasksWithDates;
      }

      return [];
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError((prev) => ({ ...prev, tasks: err instanceof Error ? err.message : 'Unknown error' }));
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  }, []);

  /**
   * Initialize: fetch projects on first mount
   */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchProjects();
  }, [fetchProjects]);

  /**
   * Create a new project via API
   */
  const createProject = useCallback(async (projectData: {
    uid: string;
    title: string;
    category?: string;
    scale?: number;
    documentText?: string;
  }) => {
    setLoading((prev) => ({ ...prev, projects: true }));

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.project) {
        // Refresh projects after creating a new one
        await fetchProjects();
        return { success: true, project: data.project, tasksCreated: data.tasksCreated };
      }

      return { success: false, error: 'Failed to create project' };
    } catch (err) {
      console.error('Error creating project:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  }, [fetchProjects]);

  /**
   * Create a new task via API
   */
  const createTask = useCallback(async (taskData: {
    project_id: string;
    content: string;
    desc?: string;
    status?: string;
  }) => {
    setLoading((prev) => ({ ...prev, tasks: true }));

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        return { success: true };
      }

      return { success: false, error: 'Failed to create task' };
    } catch (err) {
      console.error('Error creating task:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  }, []);

  return {
    loading: loading.projects || loading.tasks,
    loadingProjects: loading.projects,
    loadingTasks: loading.tasks,
    error: error.projects || error.tasks,
    projectsError: error.projects,
    tasksError: error.tasks,
    fetchProjects,
    fetchTasks,
    createProject,
    createTask,
  };
}
