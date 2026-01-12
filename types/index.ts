// Firestore Timestamp type
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
};

// Priority levels
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Project entity
export interface Project extends Record<string, unknown> {
  id: string;
  uid: string;
  title: string;
  scale: number; // 1-10, determines node size
  category: string;
  color?: string; // Hex code for custom coloring
  summary: string;
  created_at: Timestamp | Date;
  progress?: number; // 0-100, calculated from tasks
}

// Task entity
export interface Task {
  id: string;
  project_id: string;
  status: TaskStatus;
  content: string;
  desc: string;
  is_ai_generated: boolean;
  order: number;
  created_at: Timestamp | Date;
  priority?: TaskPriority;
  due_date?: Timestamp | Date;
  dependencies?: string[]; // Task IDs that must be completed first
  assignee?: string; // User ID or name
  tags?: string[]; // For categorization
  estimated_hours?: number;
  actual_hours?: number;
}

export type TaskStatus = 'GOAL' | 'TODO' | 'IN_PROGRESS' | 'DONE';

// Comment entity
export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  author: string;
  author_id?: string;
  created_at: Timestamp | Date;
  mentions?: string[]; // Mentioned user IDs
}

// File attachment entity
export interface TaskAttachment {
  id: string;
  task_id: string;
  name: string;
  type: string; // MIME type
  size: number;
  url: string;
  uploaded_at: Timestamp | Date;
  uploaded_by: string;
}

// React Flow Node for Galaxy View
export interface GalaxyNode {
  id: string;
  type: 'project' | 'team';
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

// React Flow Edge
export interface GalaxyEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'straight';
  animated?: boolean;
}

// Document upload types
export type DocumentType = 'pdf' | 'markdown';

export interface UploadedDocument {
  file: File;
  type: DocumentType;
  text?: string;
}

// AI Task extraction result
export interface ExtractedTasksResult {
  summary: string;
  tasks: Omit<Task, 'id' | 'project_id' | 'created_at'>[];
}
