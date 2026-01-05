// Firestore Timestamp type
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

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
}

export type TaskStatus = 'GOAL' | 'TODO' | 'IN_PROGRESS' | 'DONE';

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
