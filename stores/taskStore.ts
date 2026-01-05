import { create } from 'zustand';
import { Task, TaskStatus } from '@/types';

interface TaskStore {
  // State: projectId -> tasks mapping
  tasks: Record<string, Task[]>;

  // Actions
  setTasks: (projectId: string, tasks: Task[]) => void;
  getTasks: (projectId: string) => Task[];
  addTask: (projectId: string, task: Task) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  reorderTasks: (projectId: string, tasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: {},

  // Actions
  setTasks: (projectId, tasks) =>
    set((state) => ({
      tasks: { ...state.tasks, [projectId]: tasks },
    })),

  getTasks: (projectId) => {
    return get().tasks[projectId] || [];
  },

  addTask: (projectId, task) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: [...(state.tasks[projectId] || []), task],
      },
    })),

  updateTask: (projectId, taskId, updates) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, ...updates } : t
        ),
      },
    })),

  updateTaskStatus: (projectId, taskId, status) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, status } : t
        ),
      },
    })),

  deleteTask: (projectId, taskId) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).filter(
          (t) => t.id !== taskId
        ),
      },
    })),

  reorderTasks: (projectId, tasks) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: tasks,
      },
    })),
}));
