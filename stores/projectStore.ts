import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectStore {
  // State
  projects: Project[];
  selectedProject: Project | null;
  isKanbanOpen: boolean;
  isLaunchpadOpen: boolean;
  teamName: string;
  // Legacy global schedules (kept for safety, but UI will move to teamSchedules)
  schedules: Record<string, 'FLEX' | 'AFTERNOON' | 'VACATION'>;

  // New Team Features
  members: Array<{ id: string; name: string; color: string }>;
  teamSchedules: Record<string, Record<string, 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK'>>; // Date -> { MemberId -> Type }

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (project: Project | null) => void;
  openKanban: (project: Project) => void;
  closeKanban: () => void;
  openLaunchpad: () => void;
  closeLaunchpad: () => void;
  setTeamName: (name: string) => void;

  // Legacy Actions
  setSchedule: (date: string, type: 'FLEX' | 'AFTERNOON' | 'VACATION') => void;
  removeSchedule: (date: string) => void;

  // New Team Actions
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  setMemberSchedule: (date: string, memberId: string, type: 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK' | null) => void;
  setMonthSchedule: (year: number, month: number, memberId: string, type: 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK', excludeWeekends?: boolean) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  // Initial state
  projects: [
    {
      id: 'demo-project-1',
      uid: 'user-1',
      title: 'BizGalaxy Launch',
      scale: 7,
      category: 'Software',
      summary: 'Initial launch of the platform',
      created_at: new Date()
    }
  ],
  selectedProject: null,
  isKanbanOpen: false,
  isLaunchpadOpen: false,
  teamName: '비즈갤럭시 팀',
  schedules: {},
  members: [
    { id: '1', name: '김팀장', color: 'bg-blue-500' },
    { id: '2', name: '이대리', color: 'bg-green-500' },
    { id: '3', name: '박사원', color: 'bg-purple-500' },
  ],
  teamSchedules: {},

  // Actions
  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
    })),

  selectProject: (project) => set({ selectedProject: project }),

  openKanban: (project) =>
    set({ selectedProject: project, isKanbanOpen: true }),

  closeKanban: () => set({ isKanbanOpen: false }),

  openLaunchpad: () => set({ isLaunchpadOpen: true }),

  closeLaunchpad: () => set({ isLaunchpadOpen: false }),

  setTeamName: (name) => set({ teamName: name }),

  setSchedule: (date, type) =>
    set((state) => ({
      schedules: { ...state.schedules, [date]: type },
    })),

  removeSchedule: (date) =>
    set((state) => {
      const newSchedules = { ...state.schedules };
      delete newSchedules[date];
      return { schedules: newSchedules };
    }),

  addMember: (name) =>
    set((state) => ({
      members: [
        ...state.members,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          color: `bg-${['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'][Math.floor(Math.random() * 17)]}-500`
        }
      ]
    })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id)
    })),

  setMemberSchedule: (date, memberId, type) =>
    set((state) => {
      const daySchedule = state.teamSchedules[date] || {};
      if (type === null) {
        const newDaySchedule = { ...daySchedule };
        delete newDaySchedule[memberId];
        return { teamSchedules: { ...state.teamSchedules, [date]: newDaySchedule } };
      }
      return {
        teamSchedules: {
          ...state.teamSchedules,
          [date]: { ...daySchedule, [memberId]: type }
        }
      };
    }),

  setMonthSchedule: (year, month, memberId, type, excludeWeekends = true) =>
    set((state) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const newSchedules = { ...state.teamSchedules };

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        if (excludeWeekends && isWeekend) continue;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const daySchedule = newSchedules[dateStr] || {};
        newSchedules[dateStr] = { ...daySchedule, [memberId]: type };
      }
      return { teamSchedules: newSchedules };
    }),
}));
