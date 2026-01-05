import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

  // New Team Features
  members: Array<{ id: string; name: string; color: string }>;
  teamSchedules: Record<string, Record<string, 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK'>>;

  // Team Actions
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  setMemberSchedule: (date: string, memberId: string, type: 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK' | null) => void;
  setMonthSchedule: (year: number, month: number, memberId: string, type: 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK', excludeWeekends?: boolean) => void;

  // Auth State
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  // Save/Load
  lastSaved: Date | null;
  saveProjects: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      // Initial state
      isLoggedIn: false,
      lastSaved: null,
      projects: [
        {
          id: 'demo-project-1',
          uid: 'user-1',
          title: 'BizGalaxy Launch',
          scale: 7,
          category: 'Software',
          color: '#7C3AED',
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

      // Auth Actions
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),

      // Save Actions
      saveProjects: () => set({ lastSaved: new Date() }),

      // Actions
      setProjects: (projects) => set({ projects, lastSaved: new Date() }),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project], lastSaved: new Date() })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          selectedProject:
            state.selectedProject?.id === id
              ? { ...state.selectedProject, ...updates }
              : state.selectedProject,
          lastSaved: new Date()
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          selectedProject:
            state.selectedProject?.id === id ? null : state.selectedProject,
          lastSaved: new Date()
        })),

      selectProject: (project) => set({ selectedProject: project }),

      openKanban: (project) =>
        set({ selectedProject: project, isKanbanOpen: true }),

      closeKanban: () => set({ isKanbanOpen: false }),

      openLaunchpad: () => set({ isLaunchpadOpen: true }),

      closeLaunchpad: () => set({ isLaunchpadOpen: false }),

      setTeamName: (name) => set({ teamName: name, lastSaved: new Date() }),

      setSchedule: (date, type) =>
        set((state) => ({
          schedules: { ...state.schedules, [date]: type },
          lastSaved: new Date()
        })),

      removeSchedule: (date) =>
        set((state) => {
          const newSchedules = { ...state.schedules };
          delete newSchedules[date];
          return { schedules: newSchedules, lastSaved: new Date() };
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
          ],
          lastSaved: new Date()
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          lastSaved: new Date()
        })),

      setMemberSchedule: (date, memberId, type) =>
        set((state) => {
          const daySchedule = state.teamSchedules[date] || {};
          if (type === null) {
            const newDaySchedule = { ...daySchedule };
            delete newDaySchedule[memberId];
            return { teamSchedules: { ...state.teamSchedules, [date]: newDaySchedule }, lastSaved: new Date() };
          }
          return {
            teamSchedules: {
              ...state.teamSchedules,
              [date]: { ...daySchedule, [memberId]: type }
            },
            lastSaved: new Date()
          };
        }),

      setMonthSchedule: (year, month, memberId, type, excludeWeekends = true) =>
        set((state) => {
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const newSchedules = { ...state.teamSchedules };

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat

            // New Logic: Tue-Sat is work week. Sun(0) and Mon(1) are weekends.
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 1;

            if (excludeWeekends && isWeekend) continue;

            // Restriction: Saturday (6) allows only 'WORK' (Normal), not 'FLEX'
            if (dayOfWeek === 6 && type === 'FLEX') continue;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daySchedule = newSchedules[dateStr] || {};
            newSchedules[dateStr] = { ...daySchedule, [memberId]: type };
          }
          return { teamSchedules: newSchedules, lastSaved: new Date() };
        }),
    }),
    {
      name: 'bizgalaxy-storage',
      partialize: (state) => ({
        projects: state.projects,
        members: state.members,
        teamSchedules: state.teamSchedules,
        teamName: state.teamName,
        // Don't persist isLoggedIn for security demo, or persist if desired. Let's persist for convenience.
        isLoggedIn: state.isLoggedIn
      }),
    }
  )
);
