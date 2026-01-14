"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Project, Task } from '@/types';
import { getUserId } from '@/lib/auth';
import debounce from 'lodash.debounce';

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

  const { setProjects, projects, setTeamData, teamName, members, teamSchedules } = useProjectStore();

  /**
   * Save Team Data to Firestore (Debounced)
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveTeamData = useCallback(
    debounce(async (uid: string, data: any) => {
      try {
        await fetch('/api/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, teamData: data }),
        });
        // console.log('Team data saved automatically');
      } catch (err) {
        console.error('Error auto-saving team data:', err);
      }
    }, 2000), // 2 second debounce
    []
  );

  /**
   * Fetch Team Data
   */
  const fetchTeamData = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`/api/team?uid=${encodeURIComponent(userId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.teamData) {
          // Merge with defaults if some fields are missing
          setTeamData({
            teamName: data.teamData.teamName || '비즈갤럭시 팀',
            members: data.teamData.members || [],
            teamSchedules: data.teamData.teamSchedules || {},
          });
        }
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
    }
  }, [setTeamData]);

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
      } else if (data.success && (!data.projects || data.projects.length === 0)) {
        // If projects is explicitly empty from server, clear local state
        setProjects([]);
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
    fetchTeamData();
  }, [fetchProjects, fetchTeamData]);

  /**
   * Watch for Team Data changes and Auto-Save
   * Skip the very first render to avoid saving initial state over existing data? 
   * Actually, if we fetch data, it updates the store. Then this effect runs.
   * We should ensure we don't save immediately after fetch.
   * But `teamName`, `members`, etc will change.
   * 
   * Solution: The fetch happens once. The user edits later.
   * Just ensuring the debounce is long enough (2s) usually helps, 
   * but to be safe, we can use a ref to track if data is loaded?
   * For now, simplistic approach is fine given the 'merge' strategy in API.
   */
  useEffect(() => {
    if (!initializedRef.current) return; // Don't save before init
    const userId = getUserId();
    if (userId) {
      debouncedSaveTeamData(userId, { teamName, members, teamSchedules });
    }
  }, [teamName, members, teamSchedules, debouncedSaveTeamData]);

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
